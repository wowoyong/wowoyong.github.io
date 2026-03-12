# Blog Automation 전면 수정 구현 플랜

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블로그 자동화 파이프라인 전체의 보안 취약점 제거, 하드코딩 날짜 자동화, 중복 발행 방지, 인프라 안정화를 통해 무인 자동 발행 시스템을 완성한다.

**Architecture:** 4개 에이전트가 발견한 총 66개 이슈를 우선순위별 5개 Phase로 분류. Phase 0(보안·즉시 조치)부터 Phase 4(장기 코드 품질)까지 순차 진행. 핵심 원칙: 기존 파일 패턴 유지, YAGNI(필요한 것만), 각 Phase 독립 배포 가능.

**Tech Stack:** Node.js 20, Playwright, Jekyll/Chirpy, Claude API (claude-haiku-4-5-20251001), GitHub Pages

---

## 발견된 이슈 전체 요약 (4개 에이전트 통합)

### Phase별 분류

| Phase | 주제 | HIGH | MED | LOW |
|-------|------|------|-----|-----|
| 0 | 보안·즉시 조치 | 2 | - | - |
| 1 | 퍼블리싱 파이프라인 | 6 | 5 | 4 |
| 2 | 콘텐츠 생성 안정화 | 9 | 6 | 3 |
| 3 | 인프라·스케줄링 | 5 | 8 | 2 |
| 4 | 코드 품질·장기 | - | 8 | 6 |

---

## 영향받는 파일 맵

### 신규 생성
- `scripts/publish-post.js` — 날짜 자동, 중복 방지 범용 발행 스크립트 (Phase 1)
- `scripts/lib/config-loader.js` — 공통 config.env 파싱 (Phase 4)
- `scripts/lib/post-writer.js` — 공통 frontmatter/writePost 로직 (Phase 4)
- `scripts/data/publish-state.json` — 통합 발행 상태 추적 (Phase 1)

### 수정 대상
- `scripts/naver-publisher.js` — env 검증, 무음 실패 제거, MD 변환 개선 (Phase 1)
- `scripts/tistory-publisher.js` — 동일 + 2FA 타임아웃 환경변수화 (Phase 1)
- `scripts/daily-digest.js` — 중복 방지 (Phase 2)
- `scripts/coding-test-gen.js` — 중복 방지, topics.json 연동 (Phase 2)
- `scripts/interview-gen.js` — 중복 방지, topics.json 연동 (Phase 2)
- `scripts/eng-digest.js` — 중복 방지 강화 (Phase 2)
- `scripts/sec-weekly.js` — 중복 방지, NVD auth 경고, retry 추가 (Phase 2)
- `scripts/claude-ecosystem-weekly.js` — 무한루프 방지, 중복 방지 (Phase 2)
- `scripts/config.env.example` — 누락된 변수 추가 (Phase 0)
- `package.json` — npm scripts 완성 (Phase 3)
- `.claude/crontab.txt` — 전체 스케줄 정의 (Phase 3)

### 삭제/정리 대상 (Phase 1 완료 후)
- `.claude/tmp/publish-today.js` — publish-post.js로 대체
- `.claude/tmp/publish-naver.js`
- `.claude/tmp/publish-tistory.js`
- `.claude/tmp/publish-three.js`
- `.claude/tmp/publish-interview.js`

---

## Chunk 0: 보안·즉시 조치 (지금 당장)

> **오늘 발행 + 보안 위협 제거. 코드 변경 없이 운영 조치.**

### Task 0-A: 인증정보 보안 조치

**배경:** `scripts/config.env`에 YouTube API Key, Naver/Kakao 비밀번호, GitHub Token이 평문 저장됨.
에이전트 조사 과정에서 내용이 보고서에 포함됨 → 즉시 교체 필요.

- [ ] **Step 1: GitHub Personal Access Token revoke 및 재발급**
  ```
  https://github.com/settings/tokens 접속 → 기존 토큰 Delete → Generate new token
  권한: public_repo (읽기만 필요)
  ```

- [ ] **Step 2: 새 토큰을 config.env에 업데이트**
  ```bash
  # scripts/config.env 열어서 GITHUB_TOKEN= 줄 업데이트
  # 절대 git에 커밋하지 말 것
  ```

- [ ] **Step 3: config.env가 .gitignore에 있는지 확인**
  ```bash
  grep "config.env" /Users/jojaeyong/WebstormProjects/wowoyong.github.io/.gitignore
  ```
  Expected: `scripts/config.env` 출력. 없으면 `.gitignore`에 추가.

- [ ] **Step 4: config.env.example에 누락된 변수 추가**

  파일: `scripts/config.env.example` 하단에 추가:
  ```
  GITHUB_TOKEN=              # GitHub Personal Access Token (public_repo 읽기)
  NVD_API_KEY=               # NVD API Key (선택, 없으면 rate limit 초당 5회)
  PUBLISH_RETRY_COUNT=2      # 발행 재시도 횟수
  PUBLISH_RETRY_DELAY_MS=20000 # 재시도 대기 시간(ms)
  KAKAO_2FA_TIMEOUT_MS=180000  # 카카오 2FA 대기 시간(ms)
  CLAUDE_MODEL=claude-haiku-4-5-20251001  # 사용할 Claude 모델명
  ```

- [ ] **Step 5: 커밋**
  ```bash
  git add scripts/config.env.example .gitignore
  git commit -m "docs: config.env.example 누락 변수 추가, .gitignore 확인"
  ```

---

### Task 0-B: 오늘 포스트(2026-03-12) 수동 발행

- [ ] **Step 1: 미커밋 파일 확인**
  ```bash
  cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && git status
  ```

- [ ] **Step 2: 임시 발행 스크립트 실행**
  ```bash
  # 오늘 날짜 자동으로 Naver/Tistory 발행
  DATE=$(date +%Y-%m-%d)
  node -e "
  const fs = require('fs');
  const path = require('path');
  const BLOG_DIR = '/Users/jojaeyong/WebstormProjects/wowoyong.github.io';
  const date = '$DATE';
  const postPath = path.join(BLOG_DIR, '_posts', date + '-ai-daily.md');
  if (!fs.existsSync(postPath)) { console.error('포스트 없음:', postPath); process.exit(1); }
  const raw = fs.readFileSync(postPath, 'utf8');
  const body = raw.replace(/^---[\\s\\S]*?---\\n/, '');
  const titleMatch = raw.match(/^title: [\"']?(.+?)[\"']?\\s*$/m);
  const title = titleMatch ? titleMatch[1] : '[AI 데일리] ' + date;
  async function run() {
    const { publishToNaverBlog } = require(path.join(BLOG_DIR, 'scripts/naver-publisher'));
    const { publishToTistory } = require(path.join(BLOG_DIR, 'scripts/tistory-publisher'));
    try { await publishToNaverBlog(title, body, 'AI 개발 뉴스'); console.log('[Naver] 완료'); }
    catch(e) { console.error('[Naver] 실패:', e.message); }
    try { await publishToTistory(title, body, 'AI 개발 뉴스'); console.log('[Tistory] 완료'); }
    catch(e) { console.error('[Tistory] 실패:', e.message); }
  }
  run();
  "
  ```

- [ ] **Step 3: 미커밋 파일 전체 스테이징 및 커밋**
  ```bash
  cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io
  git add _posts/2026-03-09-ai-daily.md _posts/2026-03-10-interview.md
  git add scripts/coding-test-gen.js scripts/interview-gen.js
  git add scripts/eng-digest.js scripts/sec-weekly.js
  git add scripts/coding-test-topics.json scripts/interview-topics.json
  git add scripts/sec-state.json
  git add scripts/naver-publisher.js scripts/tistory-publisher.js
  git status  # 확인
  git commit -m "chore: 누적된 자동화 스크립트 및 포스트 파일 일괄 커밋"
  git push origin main
  ```

---

## Chunk 1: 퍼블리싱 파이프라인 핵심 수정

> 발행 스크립트의 날짜 자동화, 환경변수 조기 검증, 중복 발행 방지, MD 변환 개선.

### Task 1-A: 범용 발행 스크립트 `scripts/publish-post.js` 작성

**문제:** `.claude/tmp/publish-today.js` 등 5개 파일이 특정 날짜·파일 하드코딩.
매일 새 스크립트를 만들어야 하는 비효율.

**해결:** 날짜·포스트타입을 CLI 인자로 받는 범용 스크립트. 중복 발행 상태도 추적.

**Files:**
- Create: `scripts/publish-post.js`
- Create: `scripts/data/publish-state.json` (자동 생성)

- [ ] **Step 1: `scripts/publish-post.js` 작성**

```javascript
#!/usr/bin/env node
'use strict';

/**
 * 범용 발행 스크립트
 * 사용법: node scripts/publish-post.js [날짜] [타입] [카테고리]
 * 예시: node scripts/publish-post.js today ai-daily "AI 개발 뉴스"
 *       node scripts/publish-post.js 2026-03-12 ai-daily "AI 개발 뉴스"
 */

const fs   = require('fs');
const path = require('path');

// ─── config 로드 ─────────────────────────────────────────────
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = line.slice(eq + 1).trim();
    }
  });
}

// ─── 인자 파싱 ───────────────────────────────────────────────
const [,, rawDate = 'today', postType = 'ai-daily', category = 'AI 개발 뉴스'] = process.argv;

function getTodayKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

const DATE = rawDate === 'today' ? getTodayKST() : rawDate;

if (!/^\d{4}-\d{2}-\d{2}$/.test(DATE)) {
  console.error(`[오류] 날짜 형식 잘못됨: "${DATE}" (올바른 형식: YYYY-MM-DD 또는 today)`);
  process.exit(1);
}

// ─── 환경변수 조기 검증 ────────────────────────────────────
const missing = ['NAVER_ID','NAVER_PW','NAVER_BLOG_ID'].filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[오류] 필수 환경변수 없음: ${missing.join(', ')}`);
  console.error('scripts/config.env 파일을 확인하세요.');
  process.exit(1);
}

// ─── 포스트 파일 확인 ─────────────────────────────────────
const BLOG_DIR  = path.join(__dirname, '..');
const postPath  = path.join(BLOG_DIR, '_posts', `${DATE}-${postType}.md`);

if (!fs.existsSync(postPath)) {
  console.error(`[오류] 포스트 파일 없음: ${postPath}`);
  const available = fs.readdirSync(path.join(BLOG_DIR, '_posts'))
    .filter(f => f.startsWith(DATE));
  if (available.length > 0) {
    console.error('해당 날짜의 사용 가능한 포스트:');
    available.forEach(f => console.error(`  - ${f.replace('.md','').slice(11)}`));
  }
  process.exit(1);
}

// ─── 중복 발행 방지 ───────────────────────────────────────
const STATE_PATH = path.join(__dirname, 'data', 'publish-state.json');
function loadState() {
  if (!fs.existsSync(STATE_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); } catch { return {}; }
}
function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

const state    = loadState();
const stateKey = `${DATE}-${postType}`;

if (state[stateKey] && !process.argv.includes('--force')) {
  const prev = state[stateKey];
  console.log(`[스킵] ${stateKey}는 이미 발행됨 (${prev.publishedAt})`);
  console.log(`  Naver: ${prev.naver ? '성공' : '실패'}, Tistory: ${prev.tistory ? '성공' : '실패'}`);
  console.log(`재발행하려면 --force 플래그를 사용하세요.`);
  process.exit(0);
}

// ─── 콘텐츠 로드 ─────────────────────────────────────────
const raw  = fs.readFileSync(postPath, 'utf8');
const body = raw.replace(/^---[\s\S]*?---\n/, '');
const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
const title = titleMatch ? titleMatch[1] : `[${postType}] ${DATE}`;

// ─── 발행 실행 ───────────────────────────────────────────
const result = { naver: false, tistory: false, publishedAt: new Date().toISOString() };

async function run() {
  console.log(`\n[발행 시작] ${title}`);
  console.log(`  포스트: ${postPath}`);
  console.log(`  카테고리: ${category}`);

  const { publishToNaverBlog } = require('./naver-publisher');
  const { publishToTistory }   = require('./tistory-publisher');

  console.log('\n[Naver] 발행 시작...');
  try {
    await publishToNaverBlog(title, body, category);
    result.naver = true;
    console.log('[Naver] 완료');
  } catch (e) {
    console.error('[Naver] 실패:', e.message);
    if (process.env.DEBUG) console.error(e.stack);
  }

  console.log('\n[Tistory] 발행 시작...');
  try {
    await publishToTistory(title, body, category);
    result.tistory = true;
    console.log('[Tistory] 완료');
  } catch (e) {
    console.error('[Tistory] 실패:', e.message);
    if (process.env.DEBUG) console.error(e.stack);
  }

  // 하나라도 성공하면 상태 저장
  if (result.naver || result.tistory) {
    state[stateKey] = result;
    saveState(state);
    console.log(`\n[상태 저장] ${stateKey}`);
  }

  console.log(`\n[결과] Naver: ${result.naver ? '✓' : '✗'} | Tistory: ${result.tistory ? '✓' : '✗'}`);
  if (!result.naver && !result.tistory) process.exit(1);
}

run().catch(e => {
  console.error('[FATAL]', e.message);
  process.exit(1);
});
```

- [ ] **Step 2: 동작 테스트 (파일 없는 날짜로 에러 확인)**
  ```bash
  cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io
  node scripts/publish-post.js 2099-01-01 ai-daily 2>&1
  ```
  Expected: `[오류] 포스트 파일 없음: ...2099-01-01-ai-daily.md`

- [ ] **Step 3: package.json에 npm scripts 추가**

  `package.json`의 `scripts` 블록에 추가:
  ```json
  "publish": "node scripts/publish-post.js today ai-daily \"AI 개발 뉴스\"",
  "publish:coding": "node scripts/publish-post.js today coding-test \"코딩 테스트\"",
  "publish:interview": "node scripts/publish-post.js today interview \"기술 면접\"",
  "publish:eng": "node scripts/publish-post.js today eng-digest \"테크 인사이드\"",
  "publish:sec": "node scripts/publish-post.js today sec-weekly \"개발자 보안\"",
  "publish:eco": "node scripts/publish-post.js today claude-ecosystem \"Claude 생태계\""
  ```

- [ ] **Step 4: 커밋**
  ```bash
  git add scripts/publish-post.js package.json
  git commit -m "feat: 범용 발행 스크립트 — 날짜 자동화, 중복 방지, env 조기 검증"
  ```

---

### Task 1-B: naver-publisher.js 조기 검증 + 무음 실패 제거

**문제:** 환경변수 누락 시 로그인 시도 후에야 실패. catch(`_`)로 에러 원인 숨김.

**Files:**
- Modify: `scripts/naver-publisher.js:18-20` (config 로드 직후), `scripts/naver-publisher.js:45`

- [ ] **Step 1: config 로드 블록 직후(~20번째 줄)에 조기 검증 추가**
  ```javascript
  // ─── 조기 검증 (require가 아닌 직접 실행 시에만) ──────────
  if (require.main === module) {
    const req = ['NAVER_ID', 'NAVER_PW', 'NAVER_BLOG_ID'];
    const miss = req.filter(k => !process.env[k]);
    if (miss.length) {
      console.error(`[Naver 오류] 필수 env 없음: ${miss.join(', ')}`);
      process.exit(1);
    }
  }
  ```

- [ ] **Step 2: 쿠키 로드 catch(45번째 줄) 개선**
  ```javascript
  // 변경 전:
  } catch (_) {}
  // 변경 후:
  } catch (e) { console.warn('[Naver] 쿠키 로드 실패 (재로그인 필요):', e.message); }
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/naver-publisher.js
  git commit -m "fix: naver-publisher — 조기 env 검증, 무음 실패 제거"
  ```

---

### Task 1-C: tistory-publisher.js 동일 수정 + 2FA 타임아웃 환경변수화

**Files:**
- Modify: `scripts/tistory-publisher.js:18-20`, `scripts/tistory-publisher.js:45`, `scripts/tistory-publisher.js:104`

- [ ] **Step 1: 조기 검증 추가** (Task 1-B와 동일, 변수: `KAKAO_EMAIL`, `KAKAO_PW`)

- [ ] **Step 2: 쿠키 로드 catch 개선** (45번째 줄)

- [ ] **Step 3: 2FA 타임아웃 환경변수화**
  ```javascript
  // 기존 하드코딩:
  await page.waitForURL(..., { timeout: 180000 });
  // 변경:
  const KAKAO_2FA_TIMEOUT = parseInt(process.env.KAKAO_2FA_TIMEOUT_MS || '180000', 10);
  await page.waitForURL(..., { timeout: KAKAO_2FA_TIMEOUT });
  ```

- [ ] **Step 4: 커밋**
  ```bash
  git add scripts/tistory-publisher.js
  git commit -m "fix: tistory-publisher — 조기 env 검증, 2FA 타임아웃 환경변수화"
  ```

---

### Task 1-D: Markdown→HTML H1/이미지/테이블 변환 추가

**문제:** 현재 naver/tistory 변환기가 H1(`# ...`), 이미지(`![]()`), 테이블(`|---|`) 미처리.

**Files:**
- Modify: `scripts/naver-publisher.js:64-120`
- Modify: `scripts/tistory-publisher.js:191-226`

- [ ] **Step 1: naver-publisher.js markdownToNaverHtml에 변환 추가**

  기존 H2 처리 줄 위에 삽입:
  ```javascript
  // H1 → H2로 변환 (네이버 에디터 호환)
  text = text.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  // 이미지
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" style="max-width:100%;height:auto">');
  // 테이블 (단순 변환)
  text = text.replace(/\|[-: |]+\|\n?/g, ''); // 구분선 제거
  text = text.replace(/^\|(.+)\|$/gm, (_, row) => {
    const cells = row.split('|').map(c => c.trim());
    return '<div>' + cells.map(c => `<span style="margin-right:16px">${c}</span>`).join('') + '</div>';
  });
  ```

- [ ] **Step 2: tistory-publisher.js에도 동일 패턴 적용**

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/naver-publisher.js scripts/tistory-publisher.js
  git commit -m "fix: MD→HTML 변환 H1/이미지/테이블 지원 추가"
  ```

---

## Chunk 2: 콘텐츠 생성 스크립트 안정화

> 중복 포스트 방지, topics.json 연동, API 실패 graceful handling.

### Task 2-A: daily-digest.js 중복 포스트 방지

**Files:**
- Modify: `scripts/daily-digest.js` — `main()` 함수 첫 번째 줄

- [ ] **Step 1: main() 최상단에 중복 체크 추가**
  ```javascript
  async function main() {
    // ─── 중복 방지 ────────────────────────────────────────
    const todayFile = path.join(BLOG_DIR, '_posts', `${dateStr}-ai-daily.md`);
    if (fs.existsSync(todayFile) && !process.argv.includes('--force')) {
      console.log(`[스킵] ${dateStr} AI 데일리 포스트가 이미 있습니다.`);
      console.log(`재생성하려면 --force 플래그를 사용하세요.`);
      process.exit(0);
    }
    // ... 기존 코드 계속 ...
  }
  ```

- [ ] **Step 2: package.json에 force 스크립트 추가**
  ```json
  "daily:force": "node scripts/daily-digest.js --force"
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/daily-digest.js package.json
  git commit -m "fix: daily-digest — 중복 포스트 방지 (--force로 우회)"
  ```

---

### Task 2-B: coding-test-gen.js 중복 방지 + topics.json 연동

**문제 1:** 중복 방지 없음.
**문제 2:** `coding-test-topics.json` 존재하나 전혀 사용 안 됨.

**Files:**
- Modify: `scripts/coding-test-gen.js`
- Modify: `scripts/coding-test-topics.json` (used 배열 추가)

- [ ] **Step 1: topics.json 현재 형식 확인**
  ```bash
  node -e "console.log(JSON.stringify(require('./scripts/coding-test-topics.json'), null, 2))" 2>&1 | head -40
  ```

- [ ] **Step 2: coding-test-gen.js 상단에 topics 유틸 추가**
  ```javascript
  // ─── Topics 관리 ──────────────────────────────────────────
  const TOPICS_PATH = path.join(__dirname, 'coding-test-topics.json');

  function pickUnusedTopic() {
    if (!fs.existsSync(TOPICS_PATH)) return null;
    const data = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
    const topics = data.topics || data;
    if (!Array.isArray(topics)) return null;
    const used = data.used || [];
    const available = topics.filter(t => {
      const id = t.id || t.title || t;
      return !used.includes(id);
    });
    const pool = available.length > 0 ? available : topics; // 전체 소진 시 초기화
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function markTopicUsed(topic) {
    if (!topic || !fs.existsSync(TOPICS_PATH)) return;
    const data = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
    if (!data.used) data.used = [];
    const id = topic.id || topic.title || topic;
    if (!data.used.includes(id)) data.used.push(id);
    data.lastUsed = { id, date: dateStr };
    fs.writeFileSync(TOPICS_PATH, JSON.stringify(data, null, 2));
  }
  ```

- [ ] **Step 3: main()에 중복 체크 + 주제 주입**
  ```javascript
  async function main() {
    // 중복 방지
    const todayFile = path.join(BLOG_DIR, '_posts', `${dateStr}-coding-test.md`);
    if (fs.existsSync(todayFile) && !process.argv.includes('--force')) {
      console.log(`[스킵] ${dateStr} 코딩 테스트 포스트 이미 있음.`);
      process.exit(0);
    }

    // 주제 선택
    const topic = pickUnusedTopic();
    if (topic) console.log(`[주제] ${topic.title || topic}`);

    // 기존 트렌드 수집 코드 ...

    // LLM 프롬프트에 주제 힌트 추가 (기존 프롬프트 변수에 append):
    // const topicHint = topic ? `\n\n## 오늘 출제 주제\n${JSON.stringify(topic, null, 2)}\n이 주제로 문제를 출제하세요.` : '';

    // 포스트 생성 성공 후:
    if (topic) markTopicUsed(topic);
  }
  ```

- [ ] **Step 4: 커밋**
  ```bash
  git add scripts/coding-test-gen.js scripts/coding-test-topics.json
  git commit -m "fix: coding-test-gen — 중복 방지, topics.json 주제 연동"
  ```

---

### Task 2-C: interview-gen.js 동일 수정

**Files:**
- Modify: `scripts/interview-gen.js`
- Modify: `scripts/interview-topics.json`

- [ ] **Step 1: topics.json 형식 확인**
  ```bash
  node -e "console.log(JSON.stringify(require('./scripts/interview-topics.json'), null, 2))" 2>&1 | head -40
  ```

- [ ] **Step 2: Task 2-B와 동일 패턴 적용**
  - TOPICS_PATH → `interview-topics.json`
  - 포스트 파일명 → `${dateStr}-interview.md`
  - LLM 프롬프트에 주제 힌트 주입

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/interview-gen.js scripts/interview-topics.json
  git commit -m "fix: interview-gen — 중복 방지, topics.json 주제 연동"
  ```

---

### Task 2-D: sec-weekly.js NVD 인증 경고 + publishWithRetry + 중복 방지

**Files:**
- Modify: `scripts/sec-weekly.js`

- [ ] **Step 1: NVD API 키 경고 추가** (config 로드 직후)
  ```javascript
  if (!process.env.NVD_API_KEY) {
    console.warn('[경고] NVD_API_KEY 없음 — rate limit 적용 (초당 5회). config.env에 추가 권장.');
  }
  ```

- [ ] **Step 2: publishWithRetry 함수 추가** (daily-digest.js 패턴 복사)
  ```javascript
  const PUBLISH_RETRY_COUNT    = parseInt(process.env.PUBLISH_RETRY_COUNT || '2', 10);
  const PUBLISH_RETRY_DELAY_MS = parseInt(process.env.PUBLISH_RETRY_DELAY_MS || '20000', 10);

  async function publishWithRetry(fn, label) {
    for (let i = 0; i <= PUBLISH_RETRY_COUNT; i++) {
      try { await fn(); return true; }
      catch (e) {
        if (i < PUBLISH_RETRY_COUNT) {
          console.warn(`[${label}] 실패(${i+1}/${PUBLISH_RETRY_COUNT}): ${e.message} — ${PUBLISH_RETRY_DELAY_MS/1000}초 후 재시도`);
          await new Promise(r => setTimeout(r, PUBLISH_RETRY_DELAY_MS));
        } else {
          console.error(`[${label}] 최종 실패:`, e.message);
          return false;
        }
      }
    }
  }
  ```

- [ ] **Step 3: 중복 방지 추가** (main() 최상단)
  ```javascript
  const weekFile = path.join(BLOG_DIR, '_posts', `${dateStr}-sec-weekly.md`);
  if (fs.existsSync(weekFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} 보안 위클리 이미 있음. --force로 재생성.`);
    process.exit(0);
  }
  ```

- [ ] **Step 4: 커밋**
  ```bash
  git add scripts/sec-weekly.js
  git commit -m "fix: sec-weekly — publishWithRetry 추가, NVD 경고, 중복 방지"
  ```

---

### Task 2-E: claude-ecosystem-weekly.js 무한루프 방지 + 중복 방지

**Files:**
- Modify: `scripts/claude-ecosystem-weekly.js:51-54`

- [ ] **Step 1: fetchJSON rate limit 재시도에 상한 추가**

  현재 재시도 블록:
  ```javascript
  if (res.status === 429 || res.status === 403) {
    // 재시도 로직
  }
  ```
  변경 후 (retries 파라미터 확인 후 적용):
  ```javascript
  async function fetchJSON(url, headers = {}, retries = 3) {
    // ...
    if ((res.status === 429 || res.status === 403) && retries > 0) {
      console.warn(`[Rate limit] ${url} — 30초 대기 (남은 재시도: ${retries})`);
      await new Promise(r => setTimeout(r, 30000));
      return fetchJSON(url, headers, retries - 1);
    }
    if (res.status === 429 || res.status === 403) {
      throw new Error(`Rate limit 초과, 재시도 소진: ${url}`);
    }
    // ...
  }
  ```

- [ ] **Step 2: 중복 방지 추가** (main() 최상단)
  ```javascript
  const weekFile = path.join(BLOG_DIR, '_posts', `${dateStr}-claude-ecosystem.md`);
  if (fs.existsSync(weekFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} Claude 생태계 이미 있음.`);
    process.exit(0);
  }
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/claude-ecosystem-weekly.js
  git commit -m "fix: claude-ecosystem-weekly — 무한루프 방지, 중복 방지"
  ```

---

### Task 2-F: eng-digest.js 중복 방지

**Files:**
- Modify: `scripts/eng-digest.js`

- [ ] **Step 1: 중복 방지 추가**
  ```javascript
  const weekFile = path.join(BLOG_DIR, '_posts', `${dateStr}-eng-digest.md`);
  if (fs.existsSync(weekFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} 테크 인사이드 이미 있음.`);
    process.exit(0);
  }
  ```

- [ ] **Step 2: 커밋**
  ```bash
  git add scripts/eng-digest.js
  git commit -m "fix: eng-digest — 중복 포스트 방지"
  ```

---

## Chunk 3: 인프라·스케줄링 정비

> crontab 실제 등록, npm scripts 완성, 로그 전략 통일.

### Task 3-A: 전체 crontab 재정의 및 실제 등록

**문제:** `.claude/crontab.txt`에 claude-ecosystem 하나만 있고, 실제 등록도 안 됨.
`crontab -l` 결과 "No active crontab."

**Files:**
- Modify: `.claude/crontab.txt`

- [ ] **Step 1: `.claude/crontab.txt` 전체 재작성**

  ```
  # wowoyong.github.io 블로그 자동화 crontab
  # 등록: crontab .claude/crontab.txt
  # 확인: crontab -l
  # 시스템 시간대: KST (Mac 로컬)

  # AI 데일리 — 매일 오전 8:00
  0 8 * * * cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/daily-digest.js >> scripts/logs/daily-digest.log 2>&1

  # 코딩 테스트 — 매일 오전 9:30
  30 9 * * * cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/coding-test-gen.js >> scripts/logs/coding-test.log 2>&1

  # 기술 면접 — 화/목 오전 9:00
  0 9 * * 2,4 cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/interview-gen.js >> scripts/logs/interview.log 2>&1

  # 테크 인사이드 — 매주 수요일 오전 9:00
  0 9 * * 3 cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/eng-digest.js >> scripts/logs/eng-digest.log 2>&1

  # 개발자 보안 — 매주 금요일 오전 9:00
  0 9 * * 5 cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/sec-weekly.js >> scripts/logs/sec-weekly.log 2>&1

  # Claude 생태계 주간 — 매주 월요일 오전 8:00
  0 8 * * 1 cd /Users/jojaeyong/WebstormProjects/wowoyong.github.io && /Users/jojaeyong/.nvm/versions/node/v20.20.0/bin/node scripts/claude-ecosystem-weekly.js >> scripts/logs/claude-ecosystem.log 2>&1
  ```

- [ ] **Step 2: crontab 실제 등록**
  ```bash
  crontab /Users/jojaeyong/WebstormProjects/wowoyong.github.io/.claude/crontab.txt
  crontab -l
  ```
  Expected: 6개 cron 항목 출력

- [ ] **Step 3: 커밋**
  ```bash
  git add .claude/crontab.txt
  git commit -m "chore: crontab 전체 6개 스케줄 정의 및 실제 등록"
  ```

---

### Task 3-B: 로그 전략 통일 + .gitignore 정리

**문제:** 로그가 `scripts/*.log`(현재)와 `scripts/logs/*.log`(crontab 대상)으로 분산.

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: .gitignore에 로그 파일 추가 확인**
  ```bash
  grep "*.log" /Users/jojaeyong/WebstormProjects/wowoyong.github.io/.gitignore
  ```
  없으면 추가:
  ```
  scripts/*.log
  scripts/logs/*.log
  ```

- [ ] **Step 2: package.json에 로그 확인 스크립트 추가**
  ```json
  "logs": "tail -50 scripts/logs/daily-digest.log",
  "logs:err": "grep -i 'error\\|fail\\|fatal' scripts/logs/*.log | tail -20"
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add .gitignore package.json
  git commit -m "chore: 로그 .gitignore 추가, 로그 확인 npm scripts 추가"
  ```

---

### Task 3-C: package.json npm scripts 전체 완성

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 전체 scripts 블록 확인 후 누락 항목 추가**

  현재 있어야 할 스크립트 목록:
  ```json
  {
    "scripts": {
      "daily": "node scripts/daily-digest.js",
      "daily:dry": "node scripts/daily-digest.js --dry-run",
      "daily:force": "node scripts/daily-digest.js --force",
      "coding": "node scripts/coding-test-gen.js",
      "coding:force": "node scripts/coding-test-gen.js --force",
      "interview": "node scripts/interview-gen.js",
      "interview:force": "node scripts/interview-gen.js --force",
      "eng": "node scripts/eng-digest.js",
      "eng:force": "node scripts/eng-digest.js --force",
      "sec": "node scripts/sec-weekly.js",
      "sec:force": "node scripts/sec-weekly.js --force",
      "eco": "node scripts/claude-ecosystem-weekly.js",
      "eco:force": "node scripts/claude-ecosystem-weekly.js --force",
      "publish": "node scripts/publish-post.js today ai-daily \"AI 개발 뉴스\"",
      "publish:coding": "node scripts/publish-post.js today coding-test \"코딩 테스트\"",
      "publish:interview": "node scripts/publish-post.js today interview \"기술 면접\"",
      "publish:eng": "node scripts/publish-post.js today eng-digest \"테크 인사이드\"",
      "publish:sec": "node scripts/publish-post.js today sec-weekly \"개발자 보안\"",
      "publish:eco": "node scripts/publish-post.js today claude-ecosystem \"Claude 생태계\"",
      "logs": "tail -50 scripts/logs/daily-digest.log",
      "logs:err": "grep -i 'error\\|fail\\|fatal' scripts/logs/*.log 2>/dev/null | tail -20"
    }
  }
  ```

- [ ] **Step 2: 커밋**
  ```bash
  git add package.json
  git commit -m "chore: package.json npm scripts 전체 완성"
  ```

---

## Chunk 4: 코드 품질 장기 개선 (선택)

> 공통 모듈 추출, Playwright 개선, 모델명 환경변수화. 운영 안정화 후 진행.

### Task 4-A: 공통 config-loader 모듈 추출

**Files:**
- Create: `scripts/lib/config-loader.js`
- Modify: 6개 스크립트 (동일한 파싱 블록 → require로 교체)

- [ ] **Step 1: `scripts/lib/config-loader.js` 작성**
  ```javascript
  'use strict';
  const fs = require('fs'), path = require('path');
  function loadConfig(p = path.join(__dirname, '..', 'config.env')) {
    if (!fs.existsSync(p)) return;
    fs.readFileSync(p, 'utf8').split('\n').forEach(line => {
      const t = line.trim();
      if (!t || t.startsWith('#')) return;
      const eq = t.indexOf('=');
      if (eq < 1) return;
      const key = t.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = t.slice(eq + 1).trim();
    });
  }
  module.exports = { loadConfig };
  ```

- [ ] **Step 2: 6개 스크립트 파싱 블록 교체**
  ```javascript
  // 기존 ~8줄 블록 대신:
  require('./lib/config-loader').loadConfig();
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/lib/config-loader.js scripts/*.js
  git commit -m "refactor: config-loader 공통 모듈 추출 (8개 파일 중복 코드 제거)"
  ```

---

### Task 4-B: 모델명 환경변수화

**Files:**
- Modify: 6개 스크립트 (CLAUDE_MODEL 변수 참조)
- Modify: `scripts/config.env.example`

- [ ] **Step 1: 각 스크립트의 하드코딩 모델명 교체**
  ```javascript
  // 기존:
  '--model', 'claude-haiku-4-5-20251001',
  // 변경:
  const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
  // ...
  '--model', CLAUDE_MODEL,
  ```

- [ ] **Step 2: config.env.example에 추가**
  ```
  CLAUDE_MODEL=claude-haiku-4-5-20251001
  ```

- [ ] **Step 3: 커밋**
  ```bash
  git add scripts/*.js scripts/config.env.example
  git commit -m "refactor: Claude 모델명 환경변수화 (CLAUDE_MODEL)"
  ```

---

## 실행 순서 요약

```
[즉시] Phase 0:
  0-A → GitHub Token revoke + config.env.example 보완
  0-B → 오늘 포스트 수동 발행 + 누적 파일 git 커밋

[오늘~내일] Phase 1:
  1-A → publish-post.js 범용 스크립트
  1-B → naver-publisher.js 수정
  1-C → tistory-publisher.js 수정
  1-D → MD→HTML 변환 개선

[이번 주] Phase 2:
  2-A → daily-digest 중복 방지
  2-B → coding-test-gen 중복 방지 + topics 연동
  2-C → interview-gen 동일
  2-D → sec-weekly publishWithRetry + NVD 경고
  2-E → claude-ecosystem-weekly 무한루프 방지
  2-F → eng-digest 중복 방지

[이번 주 내] Phase 3:
  3-A → crontab 6개 등록
  3-B → 로그 전략 통일
  3-C → package.json 완성

[다음 주, 선택] Phase 4:
  4-A → config-loader 공통 모듈
  4-B → 모델명 환경변수화
```

---

## 검증 체크리스트

- [ ] Phase 0 완료: Naver/Tistory에 오늘 포스트 게시 확인. `git status` 깨끗
- [ ] Phase 1 완료: `node scripts/publish-post.js 2099-01-01 ai-daily` → 에러 메시지. 같은 포스트 재발행 → "[스킵]"
- [ ] Phase 2 완료: `node scripts/daily-digest.js` 두 번 → 두 번째 "[스킵]"
- [ ] Phase 3 완료: `crontab -l` → 6개 항목. `npm run daily` 실행 가능
- [ ] Phase 4 완료: `node -e "require('./scripts/lib/config-loader')"` 오류 없음
