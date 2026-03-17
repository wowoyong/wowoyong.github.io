# Reddit Claude Digest Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reddit(r/ClaudeAI, r/anthropic)에서 Claude 관련 핫이슈를 매일 수집하여 시니어 개발자 관점의 분석 포스트를 자동 생성하는 `reddit-digest.js` 스크립트 구현

**Architecture:** 기존 `daily-digest.js`와 동일한 구조 (config 로드 → 데이터 수집 → LLM 요약 → 파일 작성 → Git push → 멀티플랫폼 퍼블리싱). Reddit JSON API로 데이터 수집, `reddit-seen.json`으로 중복 방지, 가중 점수 랭킹으로 상위 5~7개 선정.

**Tech Stack:** Node.js, Reddit JSON API (fetch), Claude CLI (spawnSync), Git, Playwright (Naver/Tistory 퍼블리싱)

**Spec:** `docs/superpowers/specs/2026-03-17-reddit-claude-digest-design.md`

---

## File Structure

| 파일 | 역할 | 작업 |
|------|------|------|
| `scripts/reddit-digest.js` | 메인 스크립트 | Create |
| `scripts/data/reddit-seen.json` | Reddit post ID 중복 추적 | Create (초기 빈 파일) |

---

### Task 1: 초기 파일 생성 + Config 블록

**Files:**
- Create: `scripts/reddit-digest.js`
- Create: `scripts/data/reddit-seen.json`

- [ ] **Step 1: `reddit-seen.json` 초기 파일 생성**

```json
{
  "seen": {},
  "lastRun": ""
}
```

- [ ] **Step 2: `reddit-digest.js` — shebang + require + config 블록 작성**

`daily-digest.js` 1~27행 패턴을 그대로 따름:
```javascript
#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const NODE_BIN  = '/Users/jojaeyong/.nvm/versions/node/v20.20.0/bin';
const CLAUDE    = '/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/cli.js';
const BLOG_DIR  = '/Users/jojaeyong/WebstormProjects/wowoyong.github.io';
const SSH_KEY   = '/Users/jojaeyong/.ssh/id_ed25519_wowoyong_new';
const NODE      = path.join(NODE_BIN, 'node');
const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE     = process.argv.includes('--force');
const PUBLISH_RETRY_COUNT = parseInt(process.env.PUBLISH_RETRY_COUNT || '2', 10);
const PUBLISH_RETRY_DELAY_MS = parseInt(process.env.PUBLISH_RETRY_DELAY_MS || '20000', 10);

const SUBREDDITS = ['ClaudeAI', 'anthropic'];
const MAX_POSTS  = 7;
const SEEN_FILE  = path.join(__dirname, 'data', 'reddit-seen.json');
const SEEN_EXPIRY_DAYS = 7;
const SEEN_SHORT_EXPIRY_DAYS = 3;
const MIN_POSTS  = 3;

// config.env 로드
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';
```

- [ ] **Step 3: 실행 확인**

Run: `node scripts/reddit-digest.js --dry-run 2>&1 | head -5`
Expected: 에러 없이 시작 (main 함수 미정의로 종료되어도 OK)

- [ ] **Step 4: Commit**

```bash
git add scripts/reddit-digest.js scripts/data/reddit-seen.json
git commit -m "feat: reddit-digest.js 초기 구조 + config"
```

---

### Task 2: Seen 파일 관리 (로드/저장/정리)

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: seen 파일 로드/저장/정리 함수 작성**

```javascript
// ─── Seen 관리 ────────────────────────────────────────────────────────────────
function loadSeen() {
  try {
    return JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8'));
  } catch {
    return { seen: {}, lastRun: '' };
  }
}

function saveSeen(state) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function purgeSeen(state, expiryDays) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - expiryDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const entries = Object.entries(state.seen);
  const before = entries.length;
  state.seen = Object.fromEntries(entries.filter(([, date]) => date >= cutoffStr));
  const removed = before - Object.keys(state.seen).length;
  if (removed > 0) console.log(`[Seen] ${removed}개 만료 항목 정리 (${expiryDays}일 기준)`);
}
```

- [ ] **Step 2: 단순 검증**

Run: `node -e "const fs=require('fs'); const f='scripts/data/reddit-seen.json'; console.log(JSON.parse(fs.readFileSync(f,'utf8')))"`
Expected: `{ seen: {}, lastRun: '' }`

- [ ] **Step 3: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest seen 파일 관리 함수"
```

---

### Task 3: Reddit API 데이터 수집

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: fetchJSON + fetchReddit 함수 작성**

```javascript
// ─── Reddit 수집 ──────────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'RedditClaudeDigest/1.0 (+https://wowoyong.github.io)' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchSubreddit(sub, endpoint) {
  const url = `https://www.reddit.com/r/${sub}/${endpoint}.json?limit=15${endpoint === 'top' ? '&t=day' : ''}`;
  try {
    const data = await fetchJSON(url);
    return (data.data?.children || []).map(c => c.data);
  } catch (e) {
    // 1회 재시도 (2초 대기)
    console.warn(`[Reddit] ${sub}/${endpoint} 실패, 재시도: ${e.message}`);
    await new Promise(r => setTimeout(r, 2000));
    try {
      const data = await fetchJSON(url);
      return (data.data?.children || []).map(c => c.data);
    } catch (e2) {
      console.error(`[Reddit] ${sub}/${endpoint} 최종 실패: ${e2.message}`);
      return [];
    }
  }
}

async function fetchAllReddit() {
  const requests = SUBREDDITS.flatMap(sub => [
    fetchSubreddit(sub, 'hot'),
    fetchSubreddit(sub, 'top')
  ]);
  const results = await Promise.all(requests);
  const all = results.flat();

  // ID 기준 병합 (중복 제거)
  const merged = new Map();
  for (const post of all) {
    if (!post.id || post.stickied) continue; // 고정글 제외
    if (!merged.has(post.id)) merged.set(post.id, post);
  }
  console.log(`[Reddit] 수집 완료: 총 ${merged.size}개 (중복 제거 후)`);
  return [...merged.values()];
}
```

- [ ] **Step 2: 수집 테스트**

Run: `node -e "
const fetch = globalThis.fetch;
(async () => {
  const url = 'https://www.reddit.com/r/ClaudeAI/hot.json?limit=3';
  const res = await fetch(url, { headers: { 'User-Agent': 'RedditClaudeDigest/1.0' }, signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  console.log('status:', res.status, 'posts:', data.data.children.length);
  console.log('first:', data.data.children[0]?.data?.title);
})().catch(e => console.error(e.message));
"`
Expected: status 200, posts 3, 첫 포스트 제목 출력

- [ ] **Step 3: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest Reddit API 수집 함수"
```

---

### Task 4: 필터링 + 랭킹

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: filterAndRank 함수 작성**

```javascript
// ─── 필터링 + 랭킹 ───────────────────────────────────────────────────────────
function filterAndRank(posts, seenState) {
  // seen 필터링
  let filtered = posts.filter(p => !seenState.seen[p.id]);
  console.log(`[필터] seen 제외 후: ${filtered.length}개`);

  // 3개 미만이면 seen 만료 단축 후 재시도
  if (filtered.length < MIN_POSTS) {
    console.log(`[필터] ${MIN_POSTS}개 미만 — seen 만료를 ${SEEN_SHORT_EXPIRY_DAYS}일로 단축`);
    purgeSeen(seenState, SEEN_SHORT_EXPIRY_DAYS);
    filtered = posts.filter(p => !seenState.seen[p.id]);
    console.log(`[필터] 단축 만료 적용 후: ${filtered.length}개`);
  }

  if (filtered.length === 0) return [];

  // 가중 점수 계산
  const now = Date.now() / 1000;
  const scored = filtered.map(p => {
    const recencyBonus = (now - p.created_utc) < 6 * 3600 ? 50 : 0;
    const weightedScore = (p.score || 0) * 1.0 + (p.num_comments || 0) * 2.0 + recencyBonus;
    return { ...p, weightedScore };
  });

  // 정렬 + 상위 N개 선정
  scored.sort((a, b) => b.weightedScore - a.weightedScore);
  const selected = scored.slice(0, MAX_POSTS);

  console.log(`[랭킹] 상위 ${selected.length}개 선정:`);
  selected.forEach((p, i) =>
    console.log(`  ${i + 1}. [${p.subreddit}] ${p.title} (score=${p.score}, comments=${p.num_comments}, weighted=${p.weightedScore.toFixed(0)})`)
  );

  return selected;
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest 필터링 + 가중 점수 랭킹"
```

---

### Task 5: LLM 요약 생성

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: buildPrompt + summarize 함수 작성**

```javascript
// ─── LLM 요약 ─────────────────────────────────────────────────────────────────
function buildPrompt(posts, dateStr) {
  const postsData = posts.map(p => ({
    title: p.title,
    selftext: (p.selftext || '').slice(0, 2000),
    url: p.url,
    score: p.score,
    num_comments: p.num_comments,
    permalink: `https://www.reddit.com${p.permalink}`,
    subreddit: p.subreddit,
    flair: p.link_flair_text || null
  }));

  return `당신은 5년차 이상 시니어 개발자로, Claude와 Anthropic 생태계에 정통합니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙:
- 시니어 개발자가 팀 내 동료에게 공유하듯 작성. 권위적이거나 설교하지 말 것.
- 기술 용어는 그대로 사용하되, 왜 중요한지/어떤 맥락인지 함께 설명.
- "이 소식이 실무에 어떤 영향을 주는가" 관점 유지.
- 이모지 사용 절대 금지.
- 문장은 짧고 명확하게. 한 문장에 하나의 내용만.

${dateStr} Reddit Claude/Anthropic 커뮤니티 핫이슈 분석 포스트를 작성해주세요.

---
[Reddit 수집 데이터]
${JSON.stringify(postsData, null, 2)}
---

다음 구조를 따르세요:

첫 줄에 SUBJECT: 로 시작하는 한 줄 제목을 작성하세요. (예: SUBJECT: Claude 4.5 출시 소식과 커뮤니티 반응)
그 아래부터 본문을 작성합니다.

## 카테고리별 분류

아래 카테고리 중 해당하는 것만 사용 (포스트가 없는 카테고리는 생략):
- 신기능/업데이트
- 버그/이슈
- 팁/활용법
- 심층 토론
- 생태계/서드파티

각 카테고리 형식:

### {카테고리명}

각 포스트별:

#### {포스트 제목 (한국어 번역)}

핵심 요약:
- (무엇에 관한 내용인지 — 1줄)
- (핵심 논점/기능/이슈 — 1~2줄)
- (커뮤니티 반응 요약: 업보트 N, 댓글 N — 1줄)

시니어 코멘트:
이 이슈가 왜 주목할 만한지, 실무에 어떤 시사점이 있는지를
시니어 개발자 관점에서 3~5줄로 분석.

> 원문: [r/{subreddit}]({permalink})

## 오늘의 Reddit 온도

오늘 수집된 Reddit 포스트들을 바탕으로 Claude/Anthropic 커뮤니티의 전반적 분위기를 2~3줄로 요약.
어떤 주제에 관심이 집중되고 있는지, 커뮤니티 감정은 어떤지 포함.

규칙:
- 모든 텍스트는 한국어. 기술 용어/고유명사/URL은 영어 유지.
- 이모지 절대 사용 금지.
- 포스트가 없는 카테고리는 아예 섹션을 만들지 말 것.`;
}

function summarize(posts, dateStr) {
  const prompt = buildPrompt(posts, dateStr);

  console.log('[Claude] 요약 생성 중...');
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
      { encoding: 'utf8', timeout: 180000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` } }
    );
  }

  if (result.status !== 0) throw new Error(`LLM 실패: ${result.stderr}`);
  return result.stdout.trim();
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest LLM 프롬프트 + 요약 생성"
```

---

### Task 6: 포스트 작성 + Git push + 퍼블리싱

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: writePost 함수 작성**

```javascript
// ─── 포스트 저장 ──────────────────────────────────────────────────────────────
function writePost(dateStr, body) {
  // SUBJECT 줄 추출
  let subject = 'Claude 커뮤니티 핫이슈';
  const subjectMatch = body.match(/^SUBJECT:\s*(.+)$/m);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = body.replace(/^SUBJECT:\s*.+\n*/m, '').trim();
  }

  const lower = body.toLowerCase();
  const candidates = ['claude', 'anthropic', 'api', 'sdk', 'prompt', 'agent', 'mcp', 'sonnet', 'opus', 'haiku', 'artifact'];
  const tags = ['reddit', ...candidates.filter(t => lower.includes(t))];

  const title = `[Reddit 클로드] ${subject} - ${dateStr}`;
  const frontMatter = [
    '---',
    `title: "${title}"`,
    `date: ${dateStr} 09:00:00 +0900`,
    `categories: [Reddit 클로드]`,
    `tags: [${tags.join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-reddit-claude.md`;
  const destPath = path.join(BLOG_DIR, '_posts', filename);
  fs.writeFileSync(destPath, frontMatter + body, 'utf8');
  console.log(`[저장] ${destPath}`);
  return { filename, title, body };
}
```

- [ ] **Step 2: gitPush 함수 작성**

```javascript
// ─── Git push ─────────────────────────────────────────────────────────────────
function gitPush(filename, dateStr) {
  const env = {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no`
  };
  const opts = { cwd: BLOG_DIR, env, encoding: 'utf8' };

  spawnSync('git', ['add', `_posts/${filename}`, 'scripts/data/reddit-seen.json'], opts);

  const commit = spawnSync('git', ['commit', '-m', `feat: Reddit 클로드 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

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
```

- [ ] **Step 3: sleep + publishWithRetry 함수 작성**

```javascript
// ─── 퍼블리싱 ─────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function publishWithRetry(name, publisher, maxAttempts, retryDelayMs) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (attempt > 1) console.log(`[${name}] 재시도 ${attempt}/${maxAttempts}...`);
      await publisher();
      console.log(`[${name}] 블로그 발행 완료`);
      return;
    } catch (e) {
      lastError = e;
      if (attempt === maxAttempts) break;
      console.error(`[${name}] 발행 실패 (시도 ${attempt}/${maxAttempts}): ${e.message}`);
      console.log(`[${name}] ${Math.floor(retryDelayMs / 1000)}초 후 재시도`);
      await sleep(retryDelayMs);
    }
  }
  console.error(`[${name}] 발행 최종 실패 (GitHub Pages는 정상): ${lastError ? lastError.message : 'unknown error'}`);
}
```

- [ ] **Step 4: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest 포스트 작성 + Git push + 퍼블리싱"
```

---

### Task 7: Main 함수 + 통합

**Files:**
- Modify: `scripts/reddit-digest.js`

- [ ] **Step 1: main 함수 작성**

```javascript
// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now     = new Date();
  const kstNow  = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);

  console.log(`\n=== Reddit 클로드 다이제스트 생성: ${dateStr} ===`);

  // 중복 방지: 파일 존재 체크
  const todayFile = path.join(BLOG_DIR, '_posts', `${dateStr}-reddit-claude.md`);
  if (fs.existsSync(todayFile) && !FORCE) {
    console.log(`[스킵] ${dateStr} Reddit 클로드 포스트가 이미 있습니다.`);
    console.log(`재생성하려면 --force 플래그를 사용하세요.`);
    process.exit(0);
  }

  if (DRY_RUN) console.log('[dry-run 모드: git push + 퍼블리싱 생략]');

  // 1. Seen 로드 + 정리
  const seenState = loadSeen();
  purgeSeen(seenState, SEEN_EXPIRY_DAYS);

  // 2. Reddit 데이터 수집
  const allPosts = await fetchAllReddit();
  if (allPosts.length === 0) {
    console.log('[종료] Reddit에서 수집된 포스트가 없습니다.');
    process.exit(0);
  }

  // 3. 필터링 + 랭킹
  const selected = filterAndRank(allPosts, seenState);
  if (selected.length === 0) {
    console.log('[종료] 새로운 포스트가 없습니다 (모두 이전에 다룸).');
    process.exit(0);
  }

  // 4. LLM 요약 생성
  const llmBody = summarize(selected, dateStr);

  // 5. 포스트 작성
  const { filename, title, body } = writePost(dateStr, llmBody);

  // 6. Seen 업데이트
  for (const p of selected) {
    seenState.seen[p.id] = dateStr;
  }
  seenState.lastRun = dateStr;
  saveSeen(seenState);

  // 7. Git + 퍼블리싱
  if (!DRY_RUN) {
    let gitOk = false;
    try {
      gitPush(filename, dateStr);
      gitOk = true;
      console.log(`\n✓ GitHub Pages 배포 완료`);
    } catch (e) {
      console.error(`[Git] 배포 실패 (네이버/티스토리는 계속 진행): ${e.message}`);
    }

    const maxAttempts = Number.isFinite(PUBLISH_RETRY_COUNT) && PUBLISH_RETRY_COUNT > 0 ? PUBLISH_RETRY_COUNT : 2;
    const retryDelayMs = Number.isFinite(PUBLISH_RETRY_DELAY_MS) && PUBLISH_RETRY_DELAY_MS >= 0
      ? PUBLISH_RETRY_DELAY_MS : 20000;

    const { publishToNaverBlog } = require('./naver-publisher');
    const { publishToTistory } = require('./tistory-publisher');

    await publishWithRetry('Naver', () => publishToNaverBlog(title, body, 'Reddit 클로드'), maxAttempts, retryDelayMs);
    await publishWithRetry('Tistory', () => publishToTistory(title, body, 'Reddit 클로드'), maxAttempts, retryDelayMs);

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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/reddit-digest.js
git commit -m "feat: reddit-digest main 함수 통합 완료"
```

---

### Task 8: Dry-run 통합 테스트

**Files:**
- None (테스트만)

- [ ] **Step 1: dry-run 실행**

Run: `node scripts/reddit-digest.js --dry-run`
Expected:
```
=== Reddit 클로드 다이제스트 생성: 2026-03-17 ===
[dry-run 모드: git push + 퍼블리싱 생략]
[Reddit] 수집 완료: 총 N개 (중복 제거 후)
[필터] seen 제외 후: N개
[랭킹] 상위 5~7개 선정:
  1. [ClaudeAI] ... (score=..., comments=..., weighted=...)
[Claude] 요약 생성 중...
[저장] .../wowoyong.github.io/_posts/2026-03-17-reddit-claude.md
[dry-run] 파일 생성됨: _posts/2026-03-17-reddit-claude.md (push 생략)
```

- [ ] **Step 2: 생성된 포스트 확인**

Run: `head -10 _posts/2026-03-17-reddit-claude.md`
Expected: frontmatter에 `categories: [Reddit 클로드]`, `tags:` 배열 포함

- [ ] **Step 3: reddit-seen.json 업데이트 확인**

Run: `cat scripts/data/reddit-seen.json`
Expected: `seen` 객체에 Reddit post ID들이 날짜와 함께 기록됨

- [ ] **Step 4: 2회차 dry-run (중복 방지 확인)**

Run: `node scripts/reddit-digest.js --dry-run`
Expected: `[스킵] 2026-03-17 Reddit 클로드 포스트가 이미 있습니다.`

- [ ] **Step 5: --force dry-run (강제 재생성 확인)**

Run: `node scripts/reddit-digest.js --dry-run --force`
Expected: 정상 재생성. seen 필터에 의해 이전 실행에서 선정된 포스트는 제외되고 새 포스트만 선정.

- [ ] **Step 6: 생성된 포스트 정리 (테스트 파일 삭제)**

Run: `rm _posts/2026-03-17-reddit-claude.md` (이미 있는 경우)
Note: 실제 배포용이 아닌 테스트이므로, seen.json은 유지하여 다음 실제 실행 시 중복 방지에 활용

- [ ] **Step 7: Commit (reddit-seen.json 초기 데이터 포함)**

```bash
git add scripts/data/reddit-seen.json
git commit -m "feat: reddit-digest 통합 테스트 완료"
```
