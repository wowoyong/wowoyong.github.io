#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const NODE_BIN  = '/Users/jojaeyong/.nvm/versions/node/v20.20.0/bin';
const CLAUDE    = '/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/cli.js';
const BLOG_DIR  = '/Users/jojaeyong/WebstormProjects/wowoyong.github.io';
const SSH_KEY   = '/Users/jojaeyong/.ssh/id_ed25519_wowoyong_new';
const NODE      = path.join(NODE_BIN, 'node');
const DRY_RUN   = process.argv.includes('--dry-run');
const STATE_PATH = path.join(__dirname, 'claude-ecosystem-state.json');
const PUBLISH_RETRY_COUNT    = parseInt(process.env.PUBLISH_RETRY_COUNT || '2', 10);
const PUBLISH_RETRY_DELAY_MS = parseInt(process.env.PUBLISH_RETRY_DELAY_MS || '20000', 10);

// config.env 로드
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// ─── 상태 관리 ────────────────────────────────────────────────────────────────
function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { lastRun: null, seenRepos: [] };
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ─── HTTP 헬퍼 ────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url, headers = {}) {
  const ghHeaders = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ClaudeEcosystemWeekly/1.0', ...ghHeaders, ...headers },
    signal: AbortSignal.timeout(20000)
  });
  if (res.status === 403 || res.status === 429) {
    console.warn(`[API] Rate limit (${res.status}), 30초 대기 후 재시도`);
    await sleep(30000);
    return fetchJSON(url, headers);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ClaudeEcosystemWeekly/1.0' },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

// ─── GitHub 검색 ──────────────────────────────────────────────────────────────
const GITHUB_SEARCH = 'https://api.github.com/search/repositories';

async function searchGitHub(queries, maxPerCategory = 10) {
  const results = await Promise.all(
    queries.map(q =>
      fetchJSON(`${GITHUB_SEARCH}?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`)
        .catch(e => { console.warn(`[GitHub] 검색 실패: ${q} — ${e.message}`); return { items: [] }; })
    )
  );
  const all = results.flatMap(r => r.items || []);
  const unique = [...new Map(all.map(r => [r.full_name, r])).values()];
  return unique
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, maxPerCategory)
    .map(r => ({
      name: r.full_name,
      description: r.description || '',
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language || '',
      topics: r.topics || [],
      updatedAt: r.updated_at
    }));
}

async function fetchMcpServers() {
  return searchGitHub([
    'topic:mcp-server',
    'mcp-server claude model-context-protocol',
    'topic:model-context-protocol claude'
  ]);
}

async function fetchSkillsCommands() {
  return searchGitHub([
    'topic:claude-code-skills',
    'claude-code slash-command skills',
    'claude code skill prompt'
  ]);
}

async function fetchPluginsExtensions() {
  return searchGitHub([
    'topic:claude-code plugin',
    'claude-code extension tool integration',
    'claude code plugin workflow'
  ]);
}

async function fetchClaudeProjects() {
  return searchGitHub([
    'built-with-claude-code automation',
    'claude-code agent project',
    'claude code automation tool'
  ]);
}

// ─── Awesome 큐레이션 파싱 ────────────────────────────────────────────────────

// README에서 GitHub 링크 추출 (- [name](url) — description 패턴)
function parseAwesomeReadme(text, maxItems = 20) {
  const results = [];
  const lines = text.split('\n');
  const ghLinkRe = /\[([^\]]+)\]\((https:\/\/github\.com\/[^)]+)\)/;
  for (const line of lines) {
    const m = line.match(ghLinkRe);
    if (!m) continue;
    const [, name, url] = m;
    const descMatch = line.replace(m[0], '').match(/[-–—]\s*(.+)/);
    results.push({
      name: url.replace('https://github.com/', ''),
      description: descMatch ? descMatch[1].trim() : '',
      url,
      stars: 0,
      language: '',
      topics: [],
      source: 'awesome'
    });
    if (results.length >= maxItems) break;
  }
  return results;
}

async function fetchAwesomeMcpServers() {
  try {
    const text = await fetchText('https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md');
    return parseAwesomeReadme(text, 20);
  } catch (e) {
    console.warn('[Awesome MCP] 파싱 실패:', e.message);
    return [];
  }
}

async function fetchAwesomeClaudeCode() {
  const candidates = [
    'https://raw.githubusercontent.com/hesreallyhim/awesome-claude-code/main/README.md',
    'https://raw.githubusercontent.com/anthropics/awesome-claude-code/main/README.md',
  ];
  for (const url of candidates) {
    try {
      const text = await fetchText(url);
      return parseAwesomeReadme(text, 20);
    } catch (_) {}
  }
  console.warn('[Awesome Claude] 사용 가능한 레포 없음');
  return [];
}

// ─── Anthropic 공식 Org 추적 ──────────────────────────────────────────────────
async function fetchAnthropicOrgRepos() {
  const orgs = ['anthropics', 'modelcontextprotocol'];
  const results = await Promise.all(
    orgs.map(org =>
      fetchJSON(`https://api.github.com/orgs/${org}/repos?sort=updated&per_page=10&type=public`)
        .catch(e => { console.warn(`[Org] ${org} 실패: ${e.message}`); return []; })
    )
  );
  const all = results.flat();
  return all
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 10)
    .map(r => ({
      name: r.full_name,
      description: r.description || '',
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language || '',
      topics: r.topics || [],
      updatedAt: r.updated_at,
      source: 'official'
    }));
}

// ─── 중복 제거 + 병합 ─────────────────────────────────────────────────────────

function deduplicateCategory(items, seenSet, maxItems = 10) {
  const unique = [...new Map(items.map(r => [r.name, r])).values()];
  return unique
    .filter(r => !seenSet.has(r.name))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, maxItems);
}

function mergeAndDeduplicate(githubItems, awesomeItems) {
  const githubNames = new Set(githubItems.map(r => r.name));
  const extraFromAwesome = awesomeItems.filter(r => !githubNames.has(r.name));
  return [...githubItems, ...extraFromAwesome];
}

async function collectAllData(seenSet) {
  console.log('[수집] 모든 데이터 소스 병렬 조회 중...');
  const [
    ghMcp, ghSkills, ghPlugins, ghProjects,
    awMcp, awClaude, official
  ] = await Promise.all([
    fetchMcpServers().catch(() => []),
    fetchSkillsCommands().catch(() => []),
    fetchPluginsExtensions().catch(() => []),
    fetchClaudeProjects().catch(() => []),
    fetchAwesomeMcpServers().catch(() => []),
    fetchAwesomeClaudeCode().catch(() => []),
    fetchAnthropicOrgRepos().catch(() => []),
  ]);

  const mcpAll     = mergeAndDeduplicate(ghMcp, awMcp);
  const skillsAll  = mergeAndDeduplicate(ghSkills, awClaude.filter(r => r.name.toLowerCase().includes('skill') || r.name.toLowerCase().includes('command')));
  const pluginsAll = mergeAndDeduplicate(ghPlugins, awClaude.filter(r => r.name.toLowerCase().includes('plugin') || r.name.toLowerCase().includes('extension')));
  const projectsAll = mergeAndDeduplicate(ghProjects, official);

  return {
    mcp:      deduplicateCategory(mcpAll, seenSet),
    skills:   deduplicateCategory(skillsAll, seenSet),
    plugins:  deduplicateCategory(pluginsAll, seenSet),
    projects: deduplicateCategory(projectsAll, seenSet),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const state   = loadState();
  const seenSet = new Set(state.seenRepos || []);
  const data    = await collectAllData(seenSet);
  console.log(`최종 MCP: ${data.mcp.length}, Skills: ${data.skills.length}, Plugins: ${data.plugins.length}, Projects: ${data.projects.length}`);
  const total = [...data.mcp, ...data.skills, ...data.plugins, ...data.projects].length;
  console.log(`총 ${total}개 항목 (중복 제거 후)`);
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
