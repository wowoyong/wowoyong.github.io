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
const PUBLISH_RETRY_COUNT = parseInt(process.env.PUBLISH_RETRY_COUNT || '2', 10);
const PUBLISH_RETRY_DELAY_MS = parseInt(process.env.PUBLISH_RETRY_DELAY_MS || '20000', 10);

// config.env 로드 (API 키 등 로컬 설정)
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

// ─── Fetch Helpers ────────────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AI-Daily-Digest/1.0' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

// ─── Data Sources ─────────────────────────────────────────────────────────────

// Hacker News: 풀스택 개발자 관점 AI 뉴스
async function fetchHackerNews(sinceTs) {
  // 두 쿼리 병렬 실행 후 병합
  const base = 'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=10&attributesToRetrieve=title,url,points,objectID';
  const filter = `&numericFilters=created_at_i>${sinceTs},points>1`;
  const [r1, r2] = await Promise.all([
    fetchJSON(`${base}&query=AI+developer${filter}`),
    fetchJSON(`${base}&query=ChatGPT+Claude+Gemini+OpenAI${filter}`),
  ]);
  const all = [...(r1.hits || []), ...(r2.hits || [])];
  const unique = [...new Map(all.map(h => [h.objectID, h])).values()];
  return unique.map(h => ({
    type: 'news',
    title: h.title,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points,
    source: 'Hacker News'
  }));
}

// GitHub: 개발자가 쓰는 AI 도구 레포 (토픽별 개별 쿼리 후 병합)
async function fetchGitHub(since) {
  const dateStr = since.toISOString().slice(0, 10);
  const topics = ['openai', 'chatgpt', 'langchain', 'claude-api'];
  const base = 'https://api.github.com/search/repositories';
  const results = await Promise.all(
    topics.map(t =>
      fetchJSON(`${base}?q=topic:${t}+pushed:>${dateStr}&sort=stars&order=desc&per_page=5`)
        .catch(() => ({ items: [] }))
    )
  );
  const all = results.flatMap(r => r.items || []);
  const unique = [...new Map(all.map(r => [r.full_name, r])).values()];
  return unique
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)
    .map(r => ({
      type: 'github',
      name: r.full_name,
      description: r.description || '',
      url: r.html_url,
      stars: r.stargazers_count,
      language: r.language || '',
      source: 'GitHub'
    }));
}

// YouTube: AI 개발 관련 인기 영상 (최근 7일, 조회수 순)
async function fetchYouTube(since) {
  if (!YOUTUBE_API_KEY) { console.warn('[YouTube] API 키 없음, 건너뜀'); return []; }

  // 7일 전부터 검색 (조회수가 쌓일 시간 필요)
  const weekAgo = new Date(since.getTime() - 6 * 24 * 60 * 60 * 1000);
  const publishedAfter = weekAgo.toISOString();

  const queries = [
    'ChatGPT API tutorial developer 2026',
    'Claude Anthropic API developer guide',
    'Gemini Google AI fullstack developer',
    'OpenAI LLM fullstack application build'
  ];

  const allItems = [];
  for (const q of queries) {
    try {
      const searchUrl = [
        'https://www.googleapis.com/youtube/v3/search',
        `?part=snippet&q=${encodeURIComponent(q)}`,
        `&type=video&order=viewCount`,
        `&publishedAfter=${publishedAfter}`,
        `&maxResults=3&key=${YOUTUBE_API_KEY}`
      ].join('');
      const data = await fetchJSON(searchUrl);
      if (data.items) allItems.push(...data.items);
    } catch (e) {
      console.warn(`[YouTube] 검색 실패: ${q} — ${e.message}`);
    }
  }

  if (allItems.length === 0) return [];

  // 중복 제거
  const unique = [...new Map(allItems.map(v => [v.id.videoId, v])).values()];

  // 조회수 가져오기
  const ids = unique.map(v => v.id.videoId).join(',');
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${ids}&key=${YOUTUBE_API_KEY}`;
  const statsData = await fetchJSON(statsUrl);

  return (statsData.items || [])
    .sort((a, b) => parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0))
    .slice(0, 5)
    .map(v => ({
      type: 'youtube',
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      views: parseInt(v.statistics.viewCount || 0),
      published: v.snippet.publishedAt.slice(0, 10),
      source: 'YouTube'
    }));
}

// ─── Claude 요약 ──────────────────────────────────────────────────────────────
function summarize(news, github, youtube, dateStr) {
  const youtubeSection = youtube.length > 0
    ? `\n[이번 주 YouTube 인기 영상]\n${JSON.stringify(youtube, null, 2)}`
    : '';

  const prompt = `당신은 5년차 이상 시니어 풀스택 개발자로, 주니어 개발자(1~3년차)가 AI 생태계 흐름을 빠르게 파악할 수 있도록 데일리 블로그를 씁니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙 (페르소나):
- 5년차 시니어가 팀 내 주니어에게 설명해주듯 작성. 권위적이거나 설교하지 말 것.
- 기술 용어는 그대로 사용하되, 왜 중요한지/어떤 상황에 쓰면 좋은지 함께 설명.
- "이 소식이 실무에 어떤 영향을 주는가" 관점 유지.
- 이모지 사용 절대 금지 (원문 링크 앞 📎 하나만 허용).
- 문장은 짧고 명확하게. 한 문장에 하나의 내용만.

${dateStr} AI 데일리 블로그 포스트 본문을 아래 데이터로 작성해주세요.

---
[AI 뉴스]
${JSON.stringify(news, null, 2)}

[GitHub 프로젝트]
${JSON.stringify(github, null, 2)}
${youtubeSection}
---

다음 섹션 구조를 정확히 따르세요:

## 오늘의 AI 개발 뉴스

각 뉴스 항목 형식:

### {제목 (한국어 번역)}

내용 요약:
- (무엇에 관한 소식인지 — 1줄)
- (핵심 기능/변경사항/발표 내용 — 1~2줄)
- (관련 기술 스택 또는 배경 — 1줄)
- (실무에서 어떤 의미를 갖는지 — 1줄)

개발자 코멘트:
왜 주목해야 하는지, 실무에 어떤 영향을 줄 수 있는지를
시니어 개발자 관점에서 주니어도 이해할 수 있게 5줄 내외로 작성.
단순 번역이 아닌 "이게 왜 중요한가"를 중심으로.

> 📎 원문: [{제목}]({URL})

## GitHub 하이라이트

각 GitHub 항목 형식:

### [{레포명}]({URL}) — ⭐ {star수} | {언어}

기능 요약:
- (어떤 도구인지 — 1줄)
- (주요 기능 2~3가지 — 각 1줄)
- (어떤 개발 상황에 쓰는지 — 1줄)

개발자 코멘트:
실무에서 언제, 어떻게 쓰면 좋은지를 5줄 내외로 설명.
비슷한 도구 대비 어떤 점이 특이한지도 포함하면 좋음.

${youtube.length > 0 ? `## 이번 주 추천 영상
각 항목: ### [{영상제목}]({URL}), 채널명 | 조회수 N만회 | 날짜, 영상 내용 1~2문장 요약

` : ''}## 오늘의 트렌드 요약

오늘 수집된 소식들을 바탕으로 AI 생태계 핵심 흐름을 3~4줄로 정리.
풀스택 개발자 입장에서 오늘 무엇을 주목해야 하는지 포함.

규칙:
- 모든 텍스트는 한국어. 기술 용어·고유명사·레포명·URL은 영어 유지.
- 이모지 절대 사용 금지 (📎 원문 링크 앞 하나만 허용).`;

  console.log('[Claude] 요약 생성 중...');
  let result;
  if (LLM_PROVIDER === 'codex') {
    const codexEnv = { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` };
    delete codexEnv.CLAUDECODE;
    result = spawnSync(
      'codex',
      ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt],
      {
        encoding: 'utf8',
        timeout: 180000,
        maxBuffer: 10 * 1024 * 1024,
        env: codexEnv
      }
    );
  } else {
    // 기존 Claude 코드 (유지)
    result = spawnSync(
      NODE,
      [CLAUDE, '-p', prompt, '--model', 'claude-haiku-4-5-20251001'],
      {
        encoding: 'utf8',
        timeout: 180000,
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
  const candidates = ['llm', 'openai', 'anthropic', 'google', 'claude', 'gpt', 'gemini',
                      'opensource', 'transformer', 'rag', 'agent', 'api', 'sdk'];
  const tags = candidates.filter(t => lower.includes(t));

  const frontMatter = [
    '---',
    `title: "[AI 데일리] ${dateStr} — 풀스택 개발자를 위한 AI 뉴스"`,
    `date: ${dateStr} 08:00:00 +0900`,
    `categories: [AI 데일리]`,
    `tags: [${tags.join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-ai-daily.md`;
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

  const commit = spawnSync('git', ['commit', '-m', `feat: AI 데일리 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

  const push = spawnSync('git', ['push', 'origin', 'main'], opts);
  if (push.status !== 0) throw new Error(`git push 실패: ${push.stderr}`);

  console.log('[Git] 배포 완료');
}

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
      const isLast = attempt === maxAttempts;
      if (isLast) break;
      console.error(`[${name}] 발행 실패 (시도 ${attempt}/${maxAttempts}): ${e.message}`);
      console.log(`[${name}] ${Math.floor(retryDelayMs / 1000)}초 후 재시도`);
      await sleep(retryDelayMs);
    }
  }
  console.error(`[${name}] 발행 최종 실패 (GitHub Pages는 정상): ${lastError ? lastError.message : 'unknown error'}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now       = new Date();
  const kstNow    = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr   = kstNow.toISOString().slice(0, 10);
  const startTime = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const startTs   = Math.floor(startTime.getTime() / 1000);

  console.log(`\n=== AI 데일리 생성: ${dateStr} ===`);
  console.log(`수집 범위: ${startTime.toISOString()} ~ ${now.toISOString()}`);
  if (DRY_RUN) console.log('[dry-run 모드: git push 생략]');

  const [news, github, youtube] = await Promise.all([
    fetchHackerNews(startTs).catch(e => { console.error('[HN 오류]', e.message); return []; }),
    fetchGitHub(startTime).catch(e => { console.error('[GitHub 오류]', e.message); return []; }),
    fetchYouTube(startTime).catch(e => { console.error('[YouTube 오류]', e.message); return []; }),
  ]);

  console.log(`수집: HN=${news.length}, GitHub=${github.length}, YouTube=${youtube.length}`);
  if (news.length + github.length < 3) {
    throw new Error('데이터 부족 (3개 미만). 종료.');
  }

  const body     = summarize(news, github, youtube, dateStr);
  const filename = writePost(dateStr, body);

  if (!DRY_RUN) {
    gitPush(filename, dateStr);
    console.log(`\n✓ 완료: https://wowoyong.github.io/posts/${dateStr}-ai-daily/`);

    const maxAttempts = Number.isFinite(PUBLISH_RETRY_COUNT) && PUBLISH_RETRY_COUNT > 0 ? PUBLISH_RETRY_COUNT : 2;
    const retryDelayMs = Number.isFinite(PUBLISH_RETRY_DELAY_MS) && PUBLISH_RETRY_DELAY_MS >= 0
      ? PUBLISH_RETRY_DELAY_MS
      : 20000;

    const { publishToNaverBlog } = require('./naver-publisher');
    const { publishToTistory } = require('./tistory-publisher');
    const title = `[AI 데일리] ${dateStr} — 풀스택 개발자를 위한 AI 뉴스`;

    await publishWithRetry('Naver', () => publishToNaverBlog(title, body), maxAttempts, retryDelayMs);
    await publishWithRetry('Tistory', () => publishToTistory(title, body), maxAttempts, retryDelayMs);
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
