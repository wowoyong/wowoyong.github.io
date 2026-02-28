#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
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

const AUTH_FILE = path.join(__dirname, 'tistory-auth.json');
const KAKAO_EMAIL = process.env.KAKAO_EMAIL || '';
const KAKAO_PW = process.env.KAKAO_PW || '';
const TISTORY_BLOG = process.env.TISTORY_BLOG || '';
const TISTORY_CATEGORY = process.env.TISTORY_CATEGORY || '';

const WRITE_URL = (blog) => `https://${blog}.tistory.com/manage/newpost`;

// ─── 카카오 로그인 ────────────────────────────────────────────────────────────
async function tistoryLogin() {
  if (!KAKAO_EMAIL || !KAKAO_PW) {
    throw new Error('[Tistory] KAKAO_EMAIL, KAKAO_PW 환경변수가 설정되지 않았습니다.');
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });

  // 저장된 세션 재사용 시도
  let context;
  if (fs.existsSync(AUTH_FILE)) {
    console.log('[Tistory] 저장된 세션 복원 시도...');
    try {
      context = await browser.newContext({ storageState: AUTH_FILE });
      const page = await context.newPage();
      await page.goto(WRITE_URL(TISTORY_BLOG), {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(3000);
      const url = page.url();
      if (url.includes('/manage/newpost')) {
        console.log('[Tistory] 세션 복원 성공');
        await page.close();
        return { browser, context };
      }
      console.log('[Tistory] 세션 만료, 재로그인 필요');
      await page.close();
      await context.close();
    } catch (e) {
      console.log('[Tistory] 세션 복원 실패:', e.message);
      if (context) await context.close();
    }
  }

  // 새 로그인: 에디터 페이지 → 카카오 로그인 리다이렉트
  console.log('[Tistory] 카카오 계정 로그인 진행...');
  context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  await page.goto(WRITE_URL(TISTORY_BLOG), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 티스토리 로그인 페이지 → 카카오 버튼 클릭
  if (page.url().includes('tistory.com/auth/login')) {
    await page.click('a[class*="kakao"]', { timeout: 5000 });
    await page.waitForTimeout(2000);
  }

  // 카카오 이메일/비밀번호 입력
  if (page.url().includes('accounts.kakao')) {
    await page.fill('#loginId, input[name="loginId"]', KAKAO_EMAIL);
    await page.waitForTimeout(500);
    await page.fill('#password, input[name="password"]', KAKAO_PW);
    await page.waitForTimeout(500);
    await page.click('button[type="submit"], .btn_g, .btn_confirm');
    await page.waitForTimeout(3000);
  }

  // 2단계 인증 대기 (카카오톡 승인 필요)
  const isTistoryManage = (u) => {
    try { return new URL(u).hostname.includes('tistory.com') && u.includes('/manage'); }
    catch (_) { return false; }
  };

  if (!isTistoryManage(page.url())) {
    console.log('[Tistory] 카카오톡 2단계 인증 대기 (60초)...');
    // "이 브라우저에서 2단계 인증 사용 안 함" 체크 시도
    try {
      const checkbox = await page.$('input[type="checkbox"]');
      if (checkbox) await checkbox.click();
    } catch (_) {}

    try {
      await page.waitForURL(url => {
        try { return new URL(url).hostname.includes('tistory.com') && !url.href.includes('/auth/login'); }
        catch (_) { return false; }
      }, { timeout: 60000 });
    } catch (_) {
      throw new Error('[Tistory] 카카오 로그인 시간 초과');
    }

    // 에디터 페이지로 이동
    if (!page.url().includes('/manage/newpost')) {
      await page.goto(WRITE_URL(TISTORY_BLOG), { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
    }
  }

  console.log('[Tistory] 로그인 성공');
  await context.storageState({ path: AUTH_FILE });
  console.log('[Tistory] 세션 저장 완료:', AUTH_FILE);

  await page.close();
  return { browser, context };
}

// ─── 블로그 발행 ──────────────────────────────────────────────────────────────
async function publishToTistory(title, markdownBody) {
  if (!TISTORY_BLOG) {
    throw new Error('[Tistory] TISTORY_BLOG 환경변수가 설정되지 않았습니다.');
  }

  const { browser, context } = await tistoryLogin();

  try {
    const page = await context.newPage();
    const writeUrl = WRITE_URL(TISTORY_BLOG);
    console.log(`[Tistory] 에디터 이동: ${writeUrl}`);
    await page.goto(writeUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // 카테고리 선택
    if (TISTORY_CATEGORY) {
      const subCategory = TISTORY_CATEGORY.includes('/')
        ? TISTORY_CATEGORY.split('/').pop()
        : TISTORY_CATEGORY;

      console.log(`[Tistory] 카테고리 선택: ${subCategory}`);
      try {
        await page.click('#category-btn', { timeout: 5000 });
        await page.waitForTimeout(1000);

        // 카테고리 목록에서 텍스트 매칭 (스크린샷에서 확인: "- AI" 형태)
        const catItem = page.locator(`#category-btn + *, [class*="category"]`).locator(`text="${subCategory}"`).first();
        // 대안: 페이지 전체에서 정확히 "AI" 텍스트가 있는 요소 클릭
        const clicked = await page.evaluate((cat) => {
          // 카테고리 드롭다운의 모든 항목을 순회
          const items = document.querySelectorAll('span, a, li, div, p');
          for (const item of items) {
            const text = item.textContent.trim();
            // "- AI" 또는 "AI" 정확 매칭
            if (text === cat || text === `- ${cat}`) {
              item.click();
              return true;
            }
          }
          return false;
        }, subCategory);

        if (clicked) {
          console.log(`[Tistory] 카테고리 "${subCategory}" 선택 완료`);
        } else {
          console.warn(`[Tistory] 카테고리 "${subCategory}" 찾기 실패`);
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(500);
      } catch (e) {
        console.warn(`[Tistory] 카테고리 선택 실패: ${e.message}`);
      }
    }

    // 제목 입력
    console.log('[Tistory] 제목 입력...');
    await page.click('#post-title-inp');
    await page.waitForTimeout(300);
    await page.keyboard.insertText(title);
    await page.waitForTimeout(500);

    // 본문 입력 (TinyMCE iframe)
    console.log('[Tistory] 본문 입력...');
    const iframe = await page.$('iframe#editor-tistory_ifr');
    if (iframe) {
      const frame = await iframe.contentFrame();
      if (frame) {
        const body = await frame.$('body');
        if (body) {
          await body.click();
          await page.waitForTimeout(300);
          // 마크다운을 평문으로 변환
          const plainBody = markdownBody
            .replace(/^#{1,3}\s+/gm, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^>\s?/gm, '')
            .replace(/^-\s+/gm, '• ');
          await page.keyboard.insertText(plainBody);
          console.log('[Tistory] 본문 입력 완료');
        }
      }
    } else {
      console.warn('[Tistory] TinyMCE iframe을 찾지 못함');
    }
    await page.waitForTimeout(1000);

    // 완료 버튼 클릭 → 발행 설정 패널 열기
    console.log('[Tistory] 발행 설정 패널 열기...');
    await page.click('#publish-layer-btn', { timeout: 5000 });
    await page.waitForTimeout(2000);

    // "공개" 라디오 버튼 선택 (기본값이 비공개)
    console.log('[Tistory] 공개 설정...');
    await page.click('#open20', { timeout: 5000 });
    await page.waitForTimeout(500);

    // 공개 발행 버튼 클릭
    console.log('[Tistory] 공개 발행...');
    await page.click('#publish-btn', { timeout: 5000 });

    // 발행 완료 대기
    try {
      await page.waitForURL(url => !url.href.includes('/manage/newpost'), { timeout: 15000 });
      console.log(`[Tistory] 발행 완료: ${page.url()}`);
    } catch (_) {
      console.warn('[Tistory] 발행 완료를 확인하지 못함');
    }

    await page.close();
  } finally {
    await browser.close();
  }
}

// ─── CLI 테스트 모드 ──────────────────────────────────────────────────────────
if (require.main === module) {
  const testMode = process.argv.includes('--test');

  if (testMode) {
    const testTitle = `[AI 데일리] ${new Date().toISOString().slice(0, 10)} — 테스트 포스트`;
    const testBody = `## 테스트 포스트

이것은 티스토리 블로그 자동 발행 테스트입니다.

### 테스트 항목
- **Playwright** 브라우저 자동화
- 카카오 계정 로그인
- 티스토리 에디터 본문 입력

> 이 포스트는 자동 생성되었습니다.

## 결론
테스트 완료!`;

    publishToTistory(testTitle, testBody)
      .then(() => console.log('\n[테스트] 완료'))
      .catch(err => {
        console.error('\n[테스트 실패]', err.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node scripts/tistory-publisher.js --test');
  }
}

module.exports = { publishToTistory };
