#!/usr/bin/env node
'use strict';

/**
 * 범용 발행 스크립트
 * 사용법: node scripts/publish-post.js [날짜] [타입] [카테고리]
 * 예시: node scripts/publish-post.js today ai-daily "AI 개발 뉴스"
 *       node scripts/publish-post.js 2026-03-12 ai-daily "AI 개발 뉴스"
 *       node scripts/publish-post.js today ai-daily "AI 개발 뉴스" --force  (중복 재발행)
 */

const fs   = require('fs');
const path = require('path');

// ─── config 로드 ─────────────────────────────────────────────
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq < 1) return;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  });
}

// ─── 인자 파싱 ───────────────────────────────────────────────
const args     = process.argv.slice(2).filter(a => !a.startsWith('--'));
const flags    = process.argv.slice(2).filter(a => a.startsWith('--'));
const rawDate  = args[0] || 'today';
const postType = args[1] || 'ai-daily';
const category = args[2] || 'AI 개발 뉴스';
const force    = flags.includes('--force');

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
const missing = ['NAVER_ID', 'NAVER_PW', 'NAVER_BLOG_ID'].filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[오류] 필수 환경변수 없음: ${missing.join(', ')}`);
  console.error('scripts/config.env 파일을 확인하세요.');
  process.exit(1);
}

// ─── 포스트 파일 확인 ─────────────────────────────────────
const BLOG_DIR = path.join(__dirname, '..');
const postPath = path.join(BLOG_DIR, '_posts', `${DATE}-${postType}.md`);

if (!fs.existsSync(postPath)) {
  console.error(`[오류] 포스트 파일 없음: ${postPath}`);
  const postsDir = path.join(BLOG_DIR, '_posts');
  const available = fs.readdirSync(postsDir).filter(f => f.startsWith(DATE));
  if (available.length > 0) {
    console.error('해당 날짜의 사용 가능한 포스트 타입:');
    available.forEach(f => {
      const type = f.replace(`${DATE}-`, '').replace('.md', '');
      console.error(`  node scripts/publish-post.js ${DATE} ${type}`);
    });
  } else {
    console.error(`${DATE} 날짜의 포스트가 없습니다.`);
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

if (state[stateKey] && !force) {
  const prev = state[stateKey];
  console.log(`[스킵] ${stateKey}는 이미 발행됨 (${prev.publishedAt})`);
  console.log(`  Naver: ${prev.naver ? '성공' : '실패'}, Tistory: ${prev.tistory ? '성공' : '실패'}`);
  console.log(`재발행하려면 --force 플래그를 사용하세요:`);
  console.log(`  node scripts/publish-post.js ${DATE} ${postType} "${category}" --force`);
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
  if (force) console.log('  --force 모드: 중복 발행 허용');

  const { publishToNaverBlog } = require('./naver-publisher');
  const { publishToTistory }   = require('./tistory-publisher');

  console.log('\n[Naver] 발행 시작...');
  try {
    await publishToNaverBlog(title, body, category);
    result.naver = true;
    console.log('[Naver] 완료 ✓');
  } catch (e) {
    console.error('[Naver] 실패:', e.message);
    if (process.env.DEBUG) console.error(e.stack);
  }

  console.log('\n[Tistory] 발행 시작...');
  try {
    await publishToTistory(title, body, category);
    result.tistory = true;
    console.log('[Tistory] 완료 ✓');
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

  if (!result.naver && !result.tistory) {
    console.error('[오류] 양쪽 모두 실패. DEBUG=1 환경변수로 스택 트레이스 확인 가능.');
    process.exit(1);
  }
}

run().catch(e => {
  console.error('[FATAL]', e.message);
  if (process.env.DEBUG) console.error(e.stack);
  process.exit(1);
});
