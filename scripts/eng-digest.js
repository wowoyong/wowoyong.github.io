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
const SEEN_PATH = path.join(__dirname, 'data', 'eng-digest-seen.json');

// config.env 로드
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';

// ─── RSS 피드 목록 ─────────────────────────────────────────────────────────────
const FEEDS = [
  { company: 'Netflix',      url: 'https://netflixtechblog.com/feed' },
  { company: 'Airbnb',       url: 'https://medium.com/feed/airbnb-engineering' },
  { company: 'Stripe',       url: 'https://stripe.com/blog/feed' },
  { company: 'Cloudflare',   url: 'https://blog.cloudflare.com/rss' },
  { company: 'GitHub',       url: 'https://github.blog/feed' },
  { company: 'Shopify',      url: 'https://shopify.engineering/feed' },
  { company: '카카오',        url: 'https://tech.kakao.com/feed' },
  { company: '토스',          url: 'https://toss.tech/rss.xml' },
  { company: '우아한형제들',  url: 'https://techblog.woowahan.com/feed' },
];

// ─── 유틸 ──────────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    return u.toString().replace(/\/$/, '');
  } catch { return url.trim(); }
}

// ─── 중복 방지 ─────────────────────────────────────────────────────────────────
function loadSeenUrls() {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(SEEN_PATH)) return new Map();
  const obj = JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8'));
  return new Map(Object.entries(obj));
}

function saveSeenUrls(seenMap) {
  // 90일 초과 항목 purge
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const obj = {};
  for (const [url, date] of seenMap.entries()) {
    if (date >= cutoff) obj[url] = date;
  }
  fs.writeFileSync(SEEN_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

// ─── RSS 파싱 ──────────────────────────────────────────────────────────────────
function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
  return m ? (m[1] || m[2] || '').trim() : '';
}

function parseRssXml(xml, company) {
  const items = [];

  // RSS <item> 파싱
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block   = match[1];
    const title   = extractTag(block, 'title');
    const link    = extractTag(block, 'link') || extractTag(block, 'guid');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || extractTag(block, 'published');
    if (title && link) items.push({ title, url: link.trim(), pubDate, company });
  }

  // Atom <entry> 파싱 (Medium 등)
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block   = match[1];
      const title   = extractTag(block, 'title');
      const linkM   = block.match(/<link[^>]+href="([^"]+)"/);
      const link    = linkM ? linkM[1] : extractTag(block, 'id');
      const pubDate = extractTag(block, 'published') || extractTag(block, 'updated');
      if (title && link) items.push({ title, url: link.trim(), pubDate, company });
    }
  }

  return items;
}

async function fetchFeed(feedDef) {
  const res = await fetch(feedDef.url, {
    headers: { 'User-Agent': 'EngDigest/1.0 (+https://wowoyong.github.io)' },
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${feedDef.url}`);
  const xml = await res.text();
  return parseRssXml(xml, feedDef.company);
}

async function fetchAllFeeds() {
  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
  const all = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`[RSS] ${FEEDS[i].company}: ${r.value.length}개`);
      all.push(...r.value);
    } else {
      console.warn(`[RSS] ${FEEDS[i].company} 실패: ${r.reason.message}`);
    }
  });
  return all;
}

// ─── 필터링 ───────────────────────────────────────────────────────────────────
function filterRecent(items, seenMap) {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return items.filter(item => {
    if (!item.pubDate) return false;
    const d = new Date(item.pubDate);
    if (isNaN(d.getTime()) || d < cutoff) return false;
    const norm = normalizeUrl(item.url);
    return !seenMap.has(norm);
  });
}

// ─── 본문 추출 ────────────────────────────────────────────────────────────────
async function fetchArticleContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EngDigest/1.0)' },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return '';
    const html = await res.text();
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return stripped.slice(0, 4000);
  } catch {
    return '';
  }
}

// ─── LLM 요약 ─────────────────────────────────────────────────────────────────
function summarizeArticle(article, content) {
  const prompt = `당신은 7년차 백엔드/풀스택 개발자로, 주니어 개발자(1~2년차)를 위해 엔지니어링 블로그 글을 요약합니다.
도구를 절대 사용하지 마세요. 텍스트만 직접 출력하세요.

아래 엔지니어링 블로그 글을 한국어로 2~3문장으로 요약하세요.

글쓰기 원칙:
- 이모지 사용 금지
- 문장은 짧고 명확하게
- "어떤 문제가 있었고, 어떻게 해결했으며, 결과는 무엇인가" 흐름으로 요약
- 1~2년차가 읽어도 맥락을 파악할 수 있도록

규칙:
- 핵심 기술적 내용 중심
- 한국어로 작성, 기술 용어·고유명사·제품명은 영어 유지
- 요약 텍스트만 출력 (제목, 링크 등 메타 정보 없이)
- 2~3문장을 초과하지 말 것

---
회사: ${article.company}
글 제목: ${article.title}
본문:
${content || '(본문을 가져오지 못했습니다. 제목 기반으로 요약해주세요.)'}
---`;

  let result;
  if (LLM_PROVIDER === 'codex') {
    const codexEnv = { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` };
    delete codexEnv.CLAUDECODE;
    result = spawnSync(
      'codex',
      ['exec', '--dangerously-bypass-approvals-and-sandbox', '--skip-git-repo-check', prompt],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 10 * 1024 * 1024, env: codexEnv }
    );
  } else {
    result = spawnSync(
      NODE,
      [CLAUDE, '-p', prompt, '--model', 'claude-haiku-4-5-20251001'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` } }
    );
  }
  if (result.status !== 0) throw new Error(`LLM 실패: ${result.stderr}`);
  return result.stdout.trim();
}

async function summarizeArticles(articles) {
  // 회사당 최대 2개
  const byCompany = {};
  const limited = [];
  for (const a of articles) {
    const count = byCompany[a.company] || 0;
    if (count < 2) {
      limited.push(a);
      byCompany[a.company] = count + 1;
    }
  }

  const results = [];
  for (const article of limited) {
    try {
      console.log(`[LLM] 요약 중: ${article.company} — ${article.title.slice(0, 50)}`);
      const content = await fetchArticleContent(article.url);
      const summary = summarizeArticle(article, content);
      results.push({ ...article, summary });
    } catch (e) {
      console.warn(`[LLM] 요약 실패: ${article.title} — ${e.message}`);
    }
    await sleep(1000);
  }
  return results;
}

// ─── 포스트 생성 ──────────────────────────────────────────────────────────────
function buildPost(summaries, dateStr) {
  // 회사별 그룹화
  summaries.sort((a, b) => a.company.localeCompare(b.company));

  const lines = [
    `## 이번 주 엔지니어링 블로그 하이라이트`,
    ``,
    `> 수집 기간: 최근 7일 | ${summaries.length}개 글 요약`,
    ``
  ];

  for (const s of summaries) {
    lines.push(`### [${s.company}] ${s.title}`);
    lines.push(``);
    lines.push(s.summary);
    lines.push(``);
    lines.push(`> 📎 원문: [${s.title}](${s.url})`);
    lines.push(``);
  }

  const frontMatter = [
    '---',
    `title: "[테크 인사이드] ${dateStr} — 이번 주 엔지니어링 블로그"`,
    `date: ${dateStr} 09:00:00 +0900`,
    `categories: [테크 인사이드, 엔지니어링]`,
    `tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]`,
    '---',
    ''
  ].join('\n');

  return frontMatter + lines.join('\n');
}

function writePost(dateStr, markdown) {
  const filename = `${dateStr}-eng-digest.md`;
  const destPath = path.join(BLOG_DIR, '_posts', filename);
  fs.writeFileSync(destPath, markdown, 'utf8');
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
  spawnSync('git', ['add', 'scripts/data/eng-digest-seen.json'], opts);

  const commit = spawnSync('git', ['commit', '-m', `feat: 테크 인사이드 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

  const push = spawnSync('git', ['push', 'origin', 'main'], opts);
  if (push.status !== 0) throw new Error(`git push 실패: ${push.stderr}`);

  console.log('[Git] 배포 완료');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now     = new Date();
  const kstNow  = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);

  console.log(`\n=== 테크 인사이드 생성: ${dateStr} ===`);
  if (DRY_RUN) console.log('[dry-run 모드: git push 생략]');

  const seenMap = loadSeenUrls();
  const rawItems = await fetchAllFeeds();
  console.log(`[수집] 총 ${rawItems.length}개 항목`);

  const freshItems = filterRecent(rawItems, seenMap);
  console.log(`[필터] 신규 ${freshItems.length}개 항목`);

  if (freshItems.length === 0) {
    console.warn('[경고] 이번 주 새 글이 없습니다. 종료.');
    process.exit(0);
  }

  const summaries = await summarizeArticles(freshItems);
  if (summaries.length === 0) {
    throw new Error('요약된 글이 없습니다.');
  }

  const markdown = buildPost(summaries, dateStr);
  const filename  = writePost(dateStr, markdown);

  // seen.json 업데이트
  const today = dateStr;
  for (const s of summaries) {
    seenMap.set(normalizeUrl(s.url), today);
  }
  saveSeenUrls(seenMap);

  if (!DRY_RUN) {
    gitPush(filename, dateStr);
    console.log(`\n완료: https://wowoyong.github.io/posts/${dateStr}-eng-digest/`);
    const title = `[테크 인사이드] ${dateStr} — 엔지니어링 블로그 다이제스트`;
    try {
      const { publishToNaverBlog } = require('./naver-publisher');
      await publishToNaverBlog(title, markdown, '테크 인사이드');
    } catch (e) {
      console.error('[Naver] 발행 실패 (GitHub Pages는 정상):', e.message);
    }
    try {
      const { publishToTistory } = require('./tistory-publisher');
      await publishToTistory(title, markdown, '테크 인사이드');
    } catch (e) {
      console.error('[Tistory] 발행 실패 (GitHub Pages는 정상):', e.message);
    }
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
