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

// ─── Topics 관리 ──────────────────────────────────────────────────────────────
const TOPICS_PATH = path.join(__dirname, 'coding-test-topics.json');

function pickUnusedTopic() {
  if (!fs.existsSync(TOPICS_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
    const allItems = (data.topics || []).flatMap(cat => cat.items || []);
    if (allItems.length === 0) return null;
    const used = data.used || [];
    const available = allItems.filter(t => !used.includes(t.slug));
    const pool = available.length > 0 ? available : allItems; // 전체 소진 시 전체에서 선택
    return pool[Math.floor(Math.random() * pool.length)];
  } catch (e) {
    console.warn('[topics] 로드 실패:', e.message);
    return null;
  }
}

function markTopicUsed(topic) {
  if (!topic || !fs.existsSync(TOPICS_PATH)) return;
  try {
    const data = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
    if (!data.used) data.used = [];
    if (!data.used.includes(topic.slug)) data.used.push(topic.slug);
    data.lastUsed = { slug: topic.slug, title: topic.titleShort, date: new Date().toISOString().slice(0, 10) };
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('[topics] 저장 실패:', e.message);
  }
}

// config.env 로드
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';

// ─── 트렌딩 데이터 수집 ───────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CodingTestGen/1.0' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchHackerNews() {
  try {
    const r = await fetchJSON(
      'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=15&attributesToRetrieve=title,url,points' +
      '&query=algorithm+programming+developer+software'
    );
    return (r.hits || []).map(h => h.title).slice(0, 10);
  } catch (e) {
    console.warn('[HN] 실패:', e.message);
    return [];
  }
}

async function fetchGitHubTrending() {
  try {
    const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const r = await fetchJSON(
      `https://api.github.com/search/repositories?q=stars:>100+pushed:>${since}&sort=stars&order=desc&per_page=10`
    );
    return (r.items || []).map(repo => `${repo.full_name} (${repo.language || 'N/A'}) — ${repo.description || ''}`).slice(0, 8);
  } catch (e) {
    console.warn('[GitHub] 실패:', e.message);
    return [];
  }
}

// ─── LLM ──────────────────────────────────────────────────────────────────────
function buildPrompt(hnTitles, githubRepos, dateStr) {
  const hnSection = hnTitles.length  > 0 ? `\n[오늘의 Hacker News 인기 글]\n${hnTitles.map((t, i) => `${i+1}. ${t}`).join('\n')}` : '';
  const ghSection = githubRepos.length > 0 ? `\n[오늘의 GitHub 트렌딩]\n${githubRepos.map((r, i) => `${i+1}. ${r}`).join('\n')}` : '';

  return `당신은 7년차 백엔드/풀스택 개발자로, 1~2년차 개발자가 코딩 테스트를 준비할 수 있도록 문제와 풀이를 씁니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙:
- 이모지 사용 금지
- 문장은 짧고 명확하게
- 풀이 설명은 "왜 이 방법인가"를 먼저, 그다음 "어떻게 구현하는가" 순으로
- 1~2년차가 읽고 혼자 구현해볼 수 있는 수준의 설명

오늘 날짜: ${dateStr}
${hnSection}
${ghSection}

---

위 트렌드를 참고해서, 오늘 개발자들이 관심 가질 만한 알고리즘/자료구조 문제 유형 1개를 선택하세요.
트렌딩 기술과 연관성이 있으면 더 좋지만, 실제 코딩 테스트에 나올 법한 수준이어야 합니다.

출력 시작 전에 아래 형식으로 주제명을 첫 줄에 반드시 작성하세요:
SUBJECT: {문제 유형명 (예: 슬라이딩 윈도우, 이진 탐색, 그래프 BFS/DFS)}
기존 LeetCode/프로그래머스 문제를 그대로 복사하지 말고, 영감을 받아 새로운 문제를 직접 만드세요.

아래 구조를 정확히 따라 작성하세요:

## 오늘의 문제 선정 이유
> 왜 오늘 이 유형을 선택했는지 한 줄 설명

## 문제 설명

실제 코딩 테스트에 나올 법한 문제를 서술하세요.

## 입출력 예시

\`\`\`
입력: ...
출력: ...
설명: ...
\`\`\`

예시 2개 이상 작성하세요.

## 제약 조건

- 숫자 범위, 배열 길이, 시간 제한 등 명시

## 풀이 접근법

### 핵심 아이디어
어떤 알고리즘/자료구조를 쓰는지, 왜 이 방법인지 2~3문장.

### 단계별 풀이 과정
1. ...
2. ...
3. ...

## 코드 풀이

### Python
\`\`\`python
# 풀이 코드 (주석 포함)
\`\`\`

### JavaScript
\`\`\`javascript
// 풀이 코드 (주석 포함)
\`\`\`

## 시간·공간 복잡도

- **시간 복잡도**: O(...) — 이유 한 줄
- **공간 복잡도**: O(...) — 이유 한 줄

## 틀리기 쉬운 포인트

실제로 많이 실수하는 엣지 케이스나 주의사항 2~3개.

## 유사 문제 패턴

이 문제와 같은 접근법이 통하는 다른 유형 2~3개를 간략히 소개하세요.

---

규칙:
- 모든 텍스트는 한국어. 변수명·함수명·기술 용어는 영어 유지.
- 이모지 사용 금지.
- 코드는 동작하는 완전한 풀이 코드여야 합니다.
- 난이도는 중급(실무 코딩 테스트 수준)으로 맞추세요.`;
}

function callLLM(prompt) {
  let result;
  if (LLM_PROVIDER === 'codex') {
    const codexEnv = { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` };
    delete codexEnv.CLAUDECODE;
    result = spawnSync(
      'codex',
      ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt],
      { encoding: 'utf8', timeout: 180000, maxBuffer: 10 * 1024 * 1024, env: codexEnv }
    );
  } else {
    result = spawnSync(
      NODE,
      [CLAUDE, '-p', prompt, '--model', 'claude-haiku-4-5-20251001'],
      { encoding: 'utf8', timeout: 180000, maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` } }
    );
  }
  if (result.status !== 0) throw new Error(`LLM 실패: ${result.stderr}`);
  return result.stdout.trim();
}

// ─── 포스트 저장 ──────────────────────────────────────────────────────────────
function writePost(dateStr, rawBody, selectedTopic) {
  // SUBJECT 줄 파싱 후 본문에서 제거
  const subjectMatch = rawBody.match(/^SUBJECT:\s*(.+)$/m);
  const subject = subjectMatch
    ? subjectMatch[1].trim()
    : (selectedTopic ? selectedTopic.titleShort : '오늘의 코딩 테스트');
  const body = rawBody.replace(/^SUBJECT:.*\n?/m, '').trimStart();

  const lower = body.toLowerCase();
  const keywords = ['array', 'string', 'hash', 'tree', 'graph', 'dp', 'greedy',
    'stack', 'queue', 'heap', 'binary-search', 'backtracking', 'sliding-window',
    'two-pointer', 'linked-list', 'sort', 'bfs', 'dfs', 'recursion'];
  const tags = ['coding-test', ...keywords.filter(k => lower.includes(k.replace('-', ' ')))];

  const frontmatter = [
    '---',
    `title: "[코딩 테스트] ${dateStr} — ${subject}"`,
    `date: ${dateStr} 09:30:00 +0900`,
    `categories: [코딩 테스트]`,
    `tags: [${[...new Set(tags)].join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-coding-test.md`;
  const destPath = path.join(BLOG_DIR, '_posts', filename);
  fs.writeFileSync(destPath, frontmatter + body, 'utf8');
  console.log(`[저장] ${destPath}`);
  return { filename, subject, body };
}

// ─── Git push ─────────────────────────────────────────────────────────────────
function gitPush(filename, dateStr) {
  const env = {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`
  };
  const opts = { cwd: BLOG_DIR, env, encoding: 'utf8' };

  spawnSync('git', ['add', `_posts/${filename}`], opts);

  const commit = spawnSync('git', ['commit', '-m', `feat: 코딩 테스트 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

  // unstaged 변경사항 stash 후 rebase
  const stash = spawnSync('git', ['stash', '--include-untracked'], opts);
  const hasStash = stash.stdout && stash.stdout.includes('Saved');

  const pull = spawnSync('git', ['pull', '--rebase', 'origin', 'main'], opts);
  if (pull.status !== 0) {
    if (hasStash) spawnSync('git', ['stash', 'pop'], opts);
    throw new Error(`git pull --rebase 실패: ${pull.stderr}`);
  }

  if (hasStash) spawnSync('git', ['stash', 'pop'], opts);

  const push = spawnSync('git', ['push', 'origin', 'main'], opts);
  if (push.status !== 0) throw new Error(`git push 실패: ${push.stderr}`);

  console.log('[Git] 배포 완료');
}

// ─── 발행 헬퍼 ────────────────────────────────────────────────────────────────
async function publishAll(title, body, naverCategory, tistoryCategory) {
  try {
    const { publishToNaverBlog } = require('./naver-publisher');
    await publishToNaverBlog(title, body, naverCategory);
  } catch (e) {
    console.error('[Naver] 발행 실패 (GitHub Pages는 정상):', e.message);
  }
  try {
    const { publishToTistory } = require('./tistory-publisher');
    await publishToTistory(title, body, tistoryCategory);
  } catch (e) {
    console.error('[Tistory] 발행 실패 (GitHub Pages는 정상):', e.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now     = new Date();
  const kstNow  = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);

  console.log(`\n=== 코딩 테스트 포스트 생성: ${dateStr} ===`);

  // ─── 중복 방지 ──────────────────────────────────────────────
  const todayFile = path.join(BLOG_DIR, '_posts', `${dateStr}-coding-test.md`);
  if (fs.existsSync(todayFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} 코딩 테스트 포스트가 이미 있습니다.`);
    console.log(`재생성하려면 --force 플래그를 사용하세요.`);
    process.exit(0);
  }

  if (DRY_RUN) console.log('[dry-run 모드: git push 생략]');

  // ─── 주제 선택 ──────────────────────────────────────────────
  const selectedTopic = pickUnusedTopic();
  if (selectedTopic) {
    console.log(`[주제] ${selectedTopic.titleShort} (${selectedTopic.slug})`);
  } else {
    console.log('[주제] topics.json 미사용 — LLM 자유 선택');
  }

  console.log('[트렌드] HN + GitHub 수집 중...');
  const [hnTitles, githubRepos] = await Promise.all([
    fetchHackerNews(),
    fetchGitHubTrending(),
  ]);
  console.log(`[트렌드] HN=${hnTitles.length}개, GitHub=${githubRepos.length}개`);

  const topicHint = selectedTopic
    ? `\n\n## 오늘 출제 주제 (반드시 이 주제로 문제를 출제하세요)\n- 주제: ${selectedTopic.titleShort}\n- 설명: ${selectedTopic.description}\n- 권장 태그: ${(selectedTopic.tags || []).join(', ')}\n- 난이도: ${selectedTopic.level}`
    : '';
  const prompt = buildPrompt(hnTitles, githubRepos, dateStr) + topicHint;
  console.log('[LLM] 문제 + 풀이 생성 중...');
  const rawBody  = callLLM(prompt);
  const { filename, subject, body } = writePost(dateStr, rawBody, selectedTopic);

  if (!DRY_RUN) {
    let gitOk = false;
    try {
      gitPush(filename, dateStr);
      gitOk = true;
      if (selectedTopic) markTopicUsed(selectedTopic);
      console.log(`\n✓ GitHub Pages 배포 완료: https://wowoyong.github.io/posts/${dateStr}-coding-test/`);
    } catch (e) {
      console.error(`[Git] 배포 실패 (네이버/티스토리는 계속 진행): ${e.message}`);
      if (selectedTopic) markTopicUsed(selectedTopic);
    }

    const title = `[코딩 테스트] ${dateStr} — ${subject}`;
    await publishAll(title, body, '코딩 테스트', '코딩 테스트');

    if (!gitOk) {
      console.warn('\n[경고] GitHub Pages 배포는 실패했습니다. 수동으로 git push를 실행하세요.');
    }
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
