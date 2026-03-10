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

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Claude 생태계 주간 — 데이터 수집 테스트 ===');
  const [mcp, skills, plugins, projects] = await Promise.all([
    fetchMcpServers().catch(e => { console.error('[MCP]', e.message); return []; }),
    fetchSkillsCommands().catch(e => { console.error('[Skills]', e.message); return []; }),
    fetchPluginsExtensions().catch(e => { console.error('[Plugins]', e.message); return []; }),
    fetchClaudeProjects().catch(e => { console.error('[Projects]', e.message); return []; }),
  ]);
  console.log(`MCP 서버: ${mcp.length}개`);
  console.log(`Skills/Commands: ${skills.length}개`);
  console.log(`Plugins/Extensions: ${plugins.length}개`);
  console.log(`활용 프로젝트: ${projects.length}개`);
  if (mcp.length > 0) console.log('MCP 샘플:', mcp[0].name, mcp[0].stars + '★');
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
