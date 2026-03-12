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
const TOPICS_PATH = path.join(__dirname, 'interview-topics.json');

function pickUnusedTopic() {
  if (!fs.existsSync(TOPICS_PATH)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'));
    const allItems = (data.topics || []).flatMap(cat => cat.items || []);
    if (allItems.length === 0) return null;
    const used = data.used || [];
    const available = allItems.filter(t => !used.includes(t.slug));
    const pool = available.length > 0 ? available : allItems;
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
    headers: { 'User-Agent': 'InterviewGen/1.0' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchHackerNews() {
  try {
    const r = await fetchJSON(
      'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=15&attributesToRetrieve=title,url,points' +
      '&query=developer+programming+software'
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
    return (r.items || []).map(repo =>
      `${repo.full_name} (${repo.language || 'N/A'}) — ${repo.description || ''}`
    ).slice(0, 8);
  } catch (e) {
    console.warn('[GitHub] 실패:', e.message);
    return [];
  }
}

// ─── LLM ──────────────────────────────────────────────────────────────────────
function buildPrompt(hnTitles, githubRepos, dateStr) {
  const hnSection = hnTitles.length > 0
    ? `\n[오늘의 Hacker News 인기 글]\n${hnTitles.map((t, i) => `${i+1}. ${t}`).join('\n')}`
    : '';
  const ghSection = githubRepos.length > 0
    ? `\n[오늘의 GitHub 트렌딩]\n${githubRepos.map((r, i) => `${i+1}. ${r}`).join('\n')}`
    : '';

  return `당신은 7년차 백엔드/풀스택 개발자로, 주니어 개발자(1~2년차)가 기술 면접을 준비할 수 있도록 글을 씁니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙:
- 이모지 사용 금지
- 문장은 짧고 명확하게. 한 문장에 하나의 내용만.
- 어려운 개념은 실제 코드나 비유로 풀어서 설명
- 암기식 나열이 아닌, "왜 그런가"를 중심으로 설명
- 1~2년차가 읽어도 이해할 수 있는 수준

오늘 날짜: ${dateStr}
${hnSection}
${ghSection}

---

위 트렌드를 참고해서, 오늘 개발자들이 가장 관심 가질 만한 기술 면접 주제 1개를 직접 선택하세요.
트렌딩 기술과 연관된 주제를 고르되, 실제 면접에서 자주 출제되는 내용이어야 합니다.

출력 시작 전에 아래 형식으로 주제명을 첫 줄에 반드시 작성하세요:
SUBJECT: {주제명 (예: React 렌더링 원리, JVM GC 동작 방식, JWT 인증 흐름)}

아래 구조를 정확히 따라 작성하세요 (총 1500~2500자):

## 오늘의 면접 주제
> 왜 오늘 이 주제를 선택했는지 한 줄로 설명 (예: "React 19 출시로 주목받는...")

## 핵심 한 줄 요약
한 문장으로 면접 답변의 핵심을 정의하세요.

## 면접 질문 & 모범 답변

6~8개의 질문을 작성하세요:

### Q1. [가장 기본적인 질문]
**기본 답변** (2-3문장): 개념을 정확하고 간결하게 설명.
**심화 포인트**: 대부분의 지원자가 놓치는 내용.

### Q2. [동작 원리를 묻는 질문]
...

### Q3. [비교/선택 기준을 묻는 질문]
...

### Q4. [실무 경험 또는 문제 해결을 묻는 질문]
...

### Q5. [트레이드오프 또는 단점을 묻는 질문]
...

### Q6~Q8. [추가 질문]
...

## 꼬리 질문 대비
실제 면접에서 연달아 나오는 3~5개 질문을 한 줄씩 나열하세요.

## 헷갈리기 쉬운 포인트
면접자들이 자주 혼동하는 개념 2~3개를 교정하세요.

## 면접관 시각
현직 면접관 입장에서 이 주제로 지원자를 평가할 때 실제로 보는 포인트를 2~3문장으로 작성하세요.

---

규칙:
- 모든 텍스트는 한국어. 기술 용어·고유명사·코드는 영어 유지.
- 이모지 사용 금지.
- 코드 예시는 짧게(5줄 이내) 필요할 때만 사용.
- 단순 나열 금지. 설명 문장 위주.`;
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
function writePost(dateStr, rawBody) {
  // SUBJECT 줄 파싱 후 본문에서 제거
  const subjectMatch = rawBody.match(/^SUBJECT:\s*(.+)$/m);
  const subject = subjectMatch ? subjectMatch[1].trim() : '오늘의 기술 면접';
  const body = rawBody.replace(/^SUBJECT:.*\n?/m, '').trimStart();

  const lower = body.toLowerCase();
  const keywords = ['react', 'spring', 'java', 'javascript', 'typescript', 'python',
    'docker', 'kubernetes', 'redis', 'mysql', 'postgresql', 'rest', 'graphql',
    'jwt', 'oauth', 'http', 'https', 'tcp', 'udp', 'jvm', 'gc', 'node',
    'nextjs', 'vue', 'angular', 'rust', 'go', 'golang', 'kafka', 'rabbitmq'];
  const tags = ['interview', ...keywords.filter(k => lower.includes(k))];

  const frontMatter = [
    '---',
    `title: "[기술 면접] ${dateStr} — ${subject}"`,
    `date: ${dateStr} 09:00:00 +0900`,
    `categories: [기술 면접]`,
    `tags: [${[...new Set(tags)].join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-interview.md`;
  const destPath = path.join(BLOG_DIR, '_posts', filename);
  fs.writeFileSync(destPath, frontMatter + body, 'utf8');
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

  const commit = spawnSync('git', ['commit', '-m', `feat: 기술 면접 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

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

  console.log(`\n=== 기술 면접 포스트 생성: ${dateStr} ===`);

  // ─── 중복 방지 ──────────────────────────────────────────────
  const todayFile = path.join(BLOG_DIR, '_posts', `${dateStr}-interview.md`);
  if (fs.existsSync(todayFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} 기술 면접 포스트가 이미 있습니다.`);
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
    ? `\n\n## 오늘 면접 주제 (반드시 이 주제로 Q&A를 작성하세요)\n- 주제: ${selectedTopic.titleShort}\n- 설명: ${selectedTopic.description}\n- 권장 태그: ${(selectedTopic.tags || []).join(', ')}\n- 대상 레벨: ${selectedTopic.level}`
    : '';
  const prompt = buildPrompt(hnTitles, githubRepos, dateStr) + topicHint;
  console.log('[LLM] 면접 Q&A 생성 중...');
  const rawBody  = callLLM(prompt);
  const { filename, subject, body } = writePost(dateStr, rawBody);

  if (!DRY_RUN) {
    gitPush(filename, dateStr);
    if (selectedTopic) markTopicUsed(selectedTopic);
    console.log(`\n완료: https://wowoyong.github.io/posts/${dateStr}-interview/`);
    const title = `[기술 면접] ${dateStr} — ${subject}`;
    await publishAll(title, body, '기술 면접', '기술 면접');
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
