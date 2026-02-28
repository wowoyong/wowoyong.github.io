#!/usr/bin/env node
'use strict';

/**
 * 세션 keep-alive: persistent context + 쿠키 파일 저장/복원
 * - 네이버: 세션 만료 시 자동 재로그인 (ID/PW)
 * - 티스토리: 쿠키 복원으로 세션 갱신, 만료 시 경고
 * LaunchAgent로 6시간마다 실행
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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

const NAVER_DATA_DIR = path.join(__dirname, '..', '.playwright-naver');
const TISTORY_DATA_DIR = path.join(__dirname, '..', '.playwright-tistory');
const NAVER_COOKIES = path.join(__dirname, 'naver-cookies.json');
const TISTORY_COOKIES = path.join(__dirname, 'tistory-cookies.json');

// ─── 쿠키 저장/복원 헬퍼 ─────────────────────────────────────────────────────
async function loadCookies(context, cookieFile) {
  if (fs.existsSync(cookieFile)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
      await context.addCookies(cookies);
      return true;
    } catch (_) {}
  }
  return false;
}

async function saveCookies(context, cookieFile) {
  const cookies = await context.cookies();
  fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
}

// ─── 네이버 keep-alive ───────────────────────────────────────────────────────
async function keepAliveNaver() {
  const context = await chromium.launchPersistentContext(NAVER_DATA_DIR, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  try {
    await loadCookies(context, NAVER_COOKIES);
    const page = await context.newPage();
    await page.goto('https://blog.naver.com/MyBlog.naver', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.waitForTimeout(3000);

    if (!page.url().includes('nidlogin') && !page.url().includes('login')) {
      console.log('[Naver] 세션 유지 OK');
      await saveCookies(context, NAVER_COOKIES);
      await page.close();
      return true;
    }

    // 자동 재로그인
    console.log('[Naver] 세션 만료, 자동 재로그인...');
    await page.goto('https://nid.naver.com/nidlogin.login?mode=form', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.fill('#id', process.env.NAVER_ID || '');
    await page.waitForTimeout(500);
    await page.fill('#pw', process.env.NAVER_PW || '');
    await page.waitForTimeout(500);
    await page.click('.btn_login');

    try {
      await page.waitForURL((u) => !u.href.includes('nidlogin'), { timeout: 30000 });
    } catch (_) {
      console.error('[Naver] 재로그인 실패');
      await page.close();
      return false;
    }

    try {
      const s = await page.$('a.btn_skip, button.btn_skip, #new\\.dontsave');
      if (s) await s.click();
    } catch (_) {}

    await page.goto('https://blog.naver.com/MyBlog.naver', {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.waitForTimeout(3000);
    await saveCookies(context, NAVER_COOKIES);

    console.log('[Naver] 재로그인 + 쿠키 저장 완료');
    await page.close();
    return true;
  } finally {
    await context.close();
  }
}

// ─── 티스토리 keep-alive ─────────────────────────────────────────────────────
async function keepAliveTistory() {
  const context = await chromium.launchPersistentContext(TISTORY_DATA_DIR, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  try {
    await loadCookies(context, TISTORY_COOKIES);
    const page = await context.newPage();
    const blog = process.env.TISTORY_BLOG || 'wowoyong';
    await page.goto(`https://${blog}.tistory.com/manage`, {
      waitUntil: 'domcontentloaded', timeout: 15000,
    });
    await page.waitForTimeout(3000);

    if (page.url().includes('/manage')) {
      console.log('[Tistory] 세션 유지 OK');
      // 추가 방문으로 세션 강화
      await page.goto(`https://${blog}.tistory.com/manage/posts`, {
        waitUntil: 'domcontentloaded', timeout: 15000,
      });
      await page.waitForTimeout(2000);
      await saveCookies(context, TISTORY_COOKIES);
      await page.close();
      return true;
    }

    console.warn('[Tistory] 세션 만료 — 카카오 2FA 필요');
    await page.close();
    return false;
  } finally {
    await context.close();
  }
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[keep-alive] ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`);

  const naverOk = await keepAliveNaver().catch(e => {
    console.error(`[Naver] 오류: ${e.message}`);
    return false;
  });

  const tistoryOk = await keepAliveTistory().catch(e => {
    console.error(`[Tistory] 오류: ${e.message}`);
    return false;
  });

  console.log(`[결과] 네이버: ${naverOk ? 'OK' : 'FAIL'} | 티스토리: ${tistoryOk ? 'OK' : 'FAIL'}`);
  if (!naverOk || !tistoryOk) process.exit(1);
}

main();
