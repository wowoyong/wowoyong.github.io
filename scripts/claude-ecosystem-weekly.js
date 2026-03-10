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

// ─── LLM 요약 ─────────────────────────────────────────────────────────────────

function buildPrompt(data, dateStr) {
  return `당신은 5년차 이상 시니어 풀스택 개발자로, 주니어 개발자(1~3년차)가 Claude Code 생태계 흐름을 빠르게 파악할 수 있도록 주간 큐레이션 블로그를 씁니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙 (페르소나):
- 5년차 시니어가 팀 내 주니어에게 설명해주듯 작성. 권위적이거나 설교하지 말 것.
- 기술 용어(MCP, LLM, API 등)는 그대로 사용하되, 왜 중요한지/어떤 상황에 쓰면 좋은지 함께 설명.
- "이게 실무에서 어떻게 쓰이는가" 관점 유지.
- 이모지 사용 절대 금지.
- 문장은 짧고 명확하게. 한 문장에 하나의 내용만.
- 모든 텍스트는 한국어. 레포명, 기술 용어, URL은 영어 유지.

${dateStr} Claude 생태계 주간 큐레이션 블로그 포스트 본문을 아래 데이터로 작성하세요.

---
[MCP 서버]
${JSON.stringify(data.mcp, null, 2)}

[Skills / Slash Commands]
${JSON.stringify(data.skills, null, 2)}

[Plugins / Extensions]
${JSON.stringify(data.plugins, null, 2)}

[Claude Code 활용 프로젝트]
${JSON.stringify(data.projects, null, 2)}
---

다음 섹션 구조를 정확히 따르세요:

## 이번 주 Claude 생태계 하이라이트

수집된 전체 데이터를 바탕으로 이번 주 Claude Code 생태계의 핵심 흐름을 3~4문장으로 먼저 정리하세요.

## MCP 서버

각 항목 형식:

### [레포명](GitHub URL) — ⭐ {star수}

기능 요약:
- (무엇을 하는 도구인지 — 1줄)
- (주요 기능 2~3가지 — 각 1줄)
- (지원 환경/언어/연동 서비스 — 1줄)

개발자 코멘트:
왜 이 도구가 주목할 만한지, 어떤 워크플로우에서 유용한지, 어떻게 쓸 수 있는지를
시니어가 주니어에게 설명해주듯 5줄 내외로 작성. 실무 적용 관점 중심.

---

## Skills / Slash Commands

(MCP 서버와 동일한 항목 형식)

## Plugins / Extensions

(MCP 서버와 동일한 항목 형식)

## Claude Code 활용 프로젝트

(MCP 서버와 동일한 항목 형식)

규칙:
- 이모지 절대 사용 금지
- star수가 0인 경우 ⭐ 표기 생략
- 데이터가 부족한 카테고리는 있는 것만 작성 (빈 섹션 금지)
- 모든 텍스트는 한국어, 레포명/기술 용어/URL은 영어 유지`;
}

function callLLM(prompt) {
  let result;
  if (LLM_PROVIDER === 'codex') {
    const codexEnv = { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` };
    delete codexEnv.CLAUDECODE;
    result = spawnSync(
      'codex',
      ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt],
      { encoding: 'utf8', timeout: 300000, maxBuffer: 10 * 1024 * 1024, env: codexEnv }
    );
  } else {
    result = spawnSync(
      NODE,
      [CLAUDE, '-p', prompt, '--model', 'claude-haiku-4-5-20251001'],
      {
        encoding: 'utf8',
        timeout: 300000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` }
      }
    );
  }
  if (result.status !== 0) throw new Error(`LLM 실패: ${result.stderr}`);
  return result.stdout.trim();
}

// ─── 포스트 저장 ──────────────────────────────────────────────────────────────
function writePost(dateStr, body) {
  const lower = body.toLowerCase();
  const tagCandidates = ['claude-code', 'mcp', 'plugin', 'skills', 'anthropic',
    'model-context-protocol', 'automation', 'agent', 'extension', 'tool'];
  const tags = ['claude-code', 'mcp', 'anthropic', ...tagCandidates.filter(t => lower.includes(t))];

  const frontMatter = [
    '---',
    `title: "[Claude 생태계] ${dateStr} — 이번 주 MCP·Skills·플러그인 큐레이션"`,
    `date: ${dateStr} 08:00:00 +0900`,
    `categories: [AI소식]`,
    `tags: [${[...new Set(tags)].join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-claude-ecosystem.md`;
  const destPath = path.join(BLOG_DIR, '_posts', filename);
  fs.writeFileSync(destPath, frontMatter + body, 'utf8');
  console.log(`[저장] ${destPath}`);
  return filename;
}

// ─── Git push ─────────────────────────────────────────────────────────────────
function gitPush(filename, dateStr) {
  const env = {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`
  };
  const opts = { cwd: BLOG_DIR, env, encoding: 'utf8' };

  spawnSync('git', ['add', `_posts/${filename}`], opts);
  spawnSync('git', ['add', 'scripts/claude-ecosystem-state.json'], opts);

  const commit = spawnSync('git', ['commit', '-m', `feat: Claude 생태계 주간 큐레이션 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

  const push = spawnSync('git', ['push', 'origin', 'main'], opts);
  if (push.status !== 0) throw new Error(`git push 실패: ${push.stderr}`);

  console.log('[Git] 배포 완료');
}

// ─── 발행 재시도 ──────────────────────────────────────────────────────────────
async function publishWithRetry(name, publisher, maxAttempts, retryDelayMs) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) console.log(`[${name}] 재시도 ${attempt}/${maxAttempts}...`);
      await publisher();
      console.log(`[${name}] 발행 완료`);
      return;
    } catch (e) {
      lastError = e;
      if (attempt === maxAttempts) break;
      console.error(`[${name}] 발행 실패 (${attempt}/${maxAttempts}): ${e.message}`);
      await sleep(retryDelayMs);
    }
  }
  console.error(`[${name}] 최종 실패 (GitHub Pages는 정상): ${lastError?.message}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now     = new Date();
  const kstNow  = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);

  console.log(`\n=== Claude 생태계 주간 큐레이션: ${dateStr} ===`);
  if (DRY_RUN) console.log('[dry-run 모드: LLM 호출 + git push 생략]');

  const state   = loadState();
  const seenSet = new Set(state.seenRepos || []);

  const data  = await collectAllData(seenSet);
  const total = [...data.mcp, ...data.skills, ...data.plugins, ...data.projects].length;
  console.log(`[수집] 총 ${total}개 (MCP:${data.mcp.length} Skills:${data.skills.length} Plugins:${data.plugins.length} Projects:${data.projects.length})`);

  if (total < 3) {
    console.warn('[경고] 데이터 부족. 종료.');
    process.exit(0);
  }

  if (DRY_RUN) {
    const prompt = buildPrompt(data, dateStr);
    console.log(`[dry-run] 프롬프트 ${prompt.length}자 생성됨. 종료.`);
    return;
  }

  console.log('[LLM] 포스트 생성 중...');
  const body     = callLLM(buildPrompt(data, dateStr));
  const filename = writePost(dateStr, body);

  // 상태 업데이트 (소개한 레포 기록)
  const newRepos = [...data.mcp, ...data.skills, ...data.plugins, ...data.projects].map(r => r.name);
  state.seenRepos = [...new Set([...(state.seenRepos || []), ...newRepos])];
  state.lastRun = now.toISOString();
  saveState(state);

  gitPush(filename, dateStr);
  console.log(`\n완료: https://wowoyong.github.io/posts/${dateStr}-claude-ecosystem/`);

  const title = `[Claude 생태계] ${dateStr} — 이번 주 MCP·Skills·플러그인 큐레이션`;
  const maxAttempts  = PUBLISH_RETRY_COUNT > 0 ? PUBLISH_RETRY_COUNT : 2;
  const retryDelayMs = PUBLISH_RETRY_DELAY_MS >= 0 ? PUBLISH_RETRY_DELAY_MS : 20000;

  const { publishToNaverBlog } = require('./naver-publisher');
  const { publishToTistory }   = require('./tistory-publisher');

  await publishWithRetry('Naver',   () => publishToNaverBlog(title, body, 'AI소식'), maxAttempts, retryDelayMs);
  await publishWithRetry('Tistory', () => publishToTistory(title, body, 'AI소식'),   maxAttempts, retryDelayMs);
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
