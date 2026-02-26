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

// Hacker News: AI/LLM 관련 뉴스
async function fetchHackerNews(sinceTs) {
  const url = [
    'https://hn.algolia.com/api/v1/search',
    '?tags=story',
    '&query=AI+LLM+GPT+Claude+Gemini+machine+learning+deep+learning',
    `&numericFilters=created_at_i>${sinceTs},points>2`,
    '&hitsPerPage=15',
    '&attributesToRetrieve=title,url,points,objectID'
  ].join('');

  const data = await fetchJSON(url);
  return (data.hits || []).map(h => ({
    type: 'news',
    title: h.title,
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points,
    source: 'Hacker News'
  }));
}

// GitHub: 최근 업데이트된 AI/LLM 레포
async function fetchGitHub(since) {
  const dateStr = since.toISOString().slice(0, 10);
  const url = [
    'https://api.github.com/search/repositories',
    `?q=topic:llm+pushed:>${dateStr}`,
    '&sort=stars&order=desc&per_page=10'
  ].join('');

  const data = await fetchJSON(url);
  return (data.items || []).slice(0, 8).map(r => ({
    type: 'github',
    name: r.full_name,
    description: r.description || '',
    url: r.html_url,
    stars: r.stargazers_count,
    language: r.language || '',
    source: 'GitHub'
  }));
}

// ─── Claude 요약 ──────────────────────────────────────────────────────────────
function summarize(news, github, dateStr) {
  const prompt = `당신은 AI 데일리 블로그 작성자입니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.

${dateStr} AI 데일리 블로그 포스트 본문을 아래 데이터로 작성해주세요.
front matter 없이 본문만 작성하세요.

---
[AI 뉴스]
${JSON.stringify(news, null, 2)}

[GitHub 프로젝트]
${JSON.stringify(github, null, 2)}
---

다음 섹션 구조를 정확히 따르세요:

## 오늘의 AI 뉴스
각 항목: ### 제목 (한국어 번역), 2-3문장 한국어 요약, > 📎 원문: [제목](URL)

## GitHub 하이라이트
각 항목: ### [레포명](URL), ⭐숫자 | 언어, 2문장 한국어 설명, **주목 이유**: 1문장

## 오늘의 트렌드 요약
오늘 AI 생태계의 전반적 흐름을 3-4줄로 요약.

규칙: 모든 텍스트는 한국어, 기술 용어·고유명사·URL은 영어 유지.`;

  console.log('[Claude] 요약 생성 중...');
  const result = spawnSync(
    NODE,
    [CLAUDE, '-p', prompt, '--model', 'claude-haiku-4-5-20251001'],
    {
      encoding: 'utf8',
      timeout: 180000,
      maxBuffer: 10 * 1024 * 1024,
      env: { ...process.env, PATH: `${NODE_BIN}:${process.env.PATH}` }
    }
  );

  if (result.status !== 0) throw new Error(`Claude 실패: ${result.stderr}`);
  return result.stdout.trim();
}

// ─── 포스트 저장 ──────────────────────────────────────────────────────────────
function writePost(dateStr, body) {
  const lower = body.toLowerCase();
  const candidates = ['llm', 'openai', 'anthropic', 'google', 'claude', 'gpt', 'gemini',
                      'opensource', 'transformer', 'rag', 'agent'];
  const tags = candidates.filter(t => lower.includes(t));

  const frontMatter = [
    '---',
    `title: "[AI 데일리] ${dateStr} — 오늘의 AI 뉴스 & GitHub 하이라이트"`,
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

  const [news, github] = await Promise.all([
    fetchHackerNews(startTs).catch(e => { console.error('[HN 오류]', e.message); return []; }),
    fetchGitHub(startTime).catch(e => { console.error('[GitHub 오류]', e.message); return []; }),
  ]);

  console.log(`수집: HN=${news.length}, GitHub=${github.length}`);
  if (news.length + github.length < 3) {
    throw new Error('데이터 부족 (3개 미만). 종료.');
  }

  const body     = summarize(news, github, dateStr);
  const filename = writePost(dateStr, body);

  if (!DRY_RUN) {
    gitPush(filename, dateStr);
    console.log(`\n✓ 완료: https://wowoyong.github.io/posts/${dateStr}-ai-daily/`);
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
