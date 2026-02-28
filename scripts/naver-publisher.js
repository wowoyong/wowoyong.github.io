#!/usr/bin/env node
'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
// config.env 로드 (daily-digest.js에서 require 시에도 이미 로드되어 있지만, 단독 실행 대비)
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

const AUTH_FILE = path.join(__dirname, 'naver-auth.json');
const NAVER_ID = process.env.NAVER_ID || '';
const NAVER_PW = process.env.NAVER_PW || '';
const NAVER_BLOG_ID = process.env.NAVER_BLOG_ID || '';
const NAVER_CATEGORY = process.env.NAVER_CATEGORY || '';

const LOGIN_URL = 'https://nid.naver.com/nidlogin.login?mode=form';
const WRITE_URL = (blogId) => `https://blog.naver.com/${blogId}/postwrite`;

// ─── 마크다운 → HTML 변환 ────────────────────────────────────────────────────
function markdownToHtml(md) {
  let html = md;

  // ## 헤딩 → 볼드 + 크게
  html = html.replace(/^### (.+)$/gm, '<br><b>$1</b><br>');
  html = html.replace(/^## (.+)$/gm, '<br><br><b style="font-size:18px">$1</b><br>');

  // **볼드**
  html = html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  // [텍스트](URL) → <a> 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // `인라인 코드`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // > 인용문
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 줄바꿈
  html = html.replace(/\n/g, '<br>');

  // 연속 <br> 정리
  html = html.replace(/(<br>){3,}/g, '<br><br>');

  return html;
}

// ─── 로그인 ───────────────────────────────────────────────────────────────────
async function naverLogin() {
  if (!NAVER_ID || !NAVER_PW) {
    throw new Error('[Naver] NAVER_ID, NAVER_PW 환경변수가 설정되지 않았습니다.');
  }

  const launchOptions = {
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  };

  const browser = await chromium.launch(launchOptions);

  // 저장된 세션이 있으면 재사용 시도
  let context;
  if (fs.existsSync(AUTH_FILE)) {
    console.log('[Naver] 저장된 세션 복원 시도...');
    try {
      context = await browser.newContext({
        storageState: AUTH_FILE,
        permissions: ['clipboard-read', 'clipboard-write'],
      });
      const page = await context.newPage();
      await page.goto('https://blog.naver.com/MyBlog.naver', {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // 로그인 상태 확인: 마이블로그 페이지가 로그인 페이지로 리다이렉트 되지 않으면 성공
      const url = page.url();
      if (!url.includes('nidlogin') && !url.includes('login')) {
        console.log('[Naver] 세션 복원 성공');
        await page.close();
        return { browser, context };
      }
      console.log('[Naver] 세션 만료, 재로그인 필요');
      await page.close();
      await context.close();
    } catch (e) {
      console.log('[Naver] 세션 복원 실패:', e.message);
      if (context) await context.close();
    }
  }

  // 새 로그인
  console.log('[Naver] 로그인 진행...');
  context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  const page = await context.newPage();
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // ID/PW 입력 (fill 사용 — 네이버 보안 키보드 우회)
  await page.fill('#id', NAVER_ID);
  await page.waitForTimeout(500);
  await page.fill('#pw', NAVER_PW);
  await page.waitForTimeout(500);

  // 로그인 버튼 클릭
  await page.click('.btn_login');

  // 로그인 결과 대기
  try {
    await page.waitForURL((url) => !url.href.includes('nidlogin'), { timeout: 30000 });
  } catch (e) {
    // CAPTCHA 또는 2단계 인증 확인
    const currentUrl = page.url();
    if (currentUrl.includes('nidlogin')) {
      const captcha = await page.$('.captcha_wrap');
      if (captcha) {
        throw new Error('[Naver] CAPTCHA 발생 — 수동 로그인 필요');
      }
      throw new Error('[Naver] 로그인 실패 — ID/PW 확인 필요');
    }
  }

  // "새로운 기기" 등록 안내 팝업이 뜨면 "등록 안함" 클릭
  try {
    const skipBtn = await page.$('a.btn_skip, button.btn_skip, #new\\.dontsave');
    if (skipBtn) await skipBtn.click();
  } catch (_) { /* 팝업 없으면 무시 */ }

  console.log('[Naver] 로그인 성공');

  // 세션 저장
  await context.storageState({ path: AUTH_FILE });
  console.log('[Naver] 세션 저장 완료:', AUTH_FILE);

  await page.close();
  return { browser, context };
}

// ─── 블로그 발행 ──────────────────────────────────────────────────────────────
async function publishToNaverBlog(title, markdownBody) {
  if (!NAVER_BLOG_ID) {
    throw new Error('[Naver] NAVER_BLOG_ID 환경변수가 설정되지 않았습니다.');
  }

  const { browser, context } = await naverLogin();

  try {
    const page = await context.newPage();
    const writeUrl = WRITE_URL(NAVER_BLOG_ID);
    console.log(`[Naver] 에디터 이동: ${writeUrl}`);
    await page.goto(writeUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // SmartEditor ONE 로딩 대기

    // 초안 복구 팝업 처리
    try {
      const draftPopup = await page.$('.se-popup-button-cancel, .se-popup-close');
      if (draftPopup) {
        await draftPopup.click();
        console.log('[Naver] 초안 복구 팝업 닫음');
        await page.waitForTimeout(1000);
      }
    } catch (_) { /* 팝업 없으면 무시 */ }

    // 도움말 패널 닫기 (발행 버튼을 가릴 수 있음)
    try {
      const helpClose = await page.$('.se-help-panel-close-button');
      if (helpClose) {
        await helpClose.click();
        console.log('[Naver] 도움말 패널 닫음');
        await page.waitForTimeout(1000);
      }
    } catch (_) { /* 없으면 무시 */ }

    // 제목 입력 (keyboard.insertText — SmartEditor ONE 호환)
    console.log('[Naver] 제목 입력...');
    const titleSelector = '.se-documentTitle .se-text-paragraph';
    await page.waitForSelector(titleSelector, { timeout: 15000 });
    await page.click(titleSelector);
    await page.waitForTimeout(500);
    await page.keyboard.insertText(title);
    await page.waitForTimeout(500);

    // 본문 입력 (SmartEditor ONE의 본문은 iframe 내부이므로 클립보드 붙여넣기 사용)
    console.log('[Naver] 본문 입력...');
    const bodySelector = '.se-component.se-text:not(.se-documentTitle) .se-text-paragraph';
    try {
      await page.waitForSelector(bodySelector, { timeout: 5000 });
      await page.click(bodySelector);
    } catch (_) {
      const contentArea = await page.$('.se-content, .se-components-container');
      if (contentArea) await contentArea.click();
    }
    await page.waitForTimeout(500);

    // 마크다운을 평문으로 변환
    const plainBody = markdownBody
      .replace(/^#{1,3}\s+/gm, '')           // 헤딩 기호 제거
      .replace(/\*\*(.+?)\*\*/g, '$1')       // 볼드 기호 제거
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')  // 링크 → 텍스트 (URL)
      .replace(/`([^`]+)`/g, '$1')           // 인라인 코드 기호 제거
      .replace(/^>\s?/gm, '')                // 인용문 기호 제거
      .replace(/^-\s+/gm, '• ');             // 리스트 → 불릿

    // 클립보드에 텍스트 복사 → Cmd+V 붙여넣기
    await page.evaluate(async (text) => {
      await navigator.clipboard.writeText(text);
    }, plainBody);
    await page.waitForTimeout(300);
    await page.keyboard.down('Meta');
    await page.keyboard.press('v');
    await page.keyboard.up('Meta');
    await page.waitForTimeout(3000);
    console.log('[Naver] 본문 입력 완료');

    // 발행 버튼 클릭 (발행 설정 패널 열기)
    console.log('[Naver] 발행 설정 패널 열기...');
    await page.click('button[class*="publish_btn"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 카테고리 선택 (발행 설정 패널에서)
    if (NAVER_CATEGORY) {
      // "IT/AI소식" → 하위 카테고리명 "AI소식" 추출
      const subCategory = NAVER_CATEGORY.includes('/')
        ? NAVER_CATEGORY.split('/').pop()
        : NAVER_CATEGORY;

      console.log(`[Naver] 카테고리 선택: ${subCategory}`);
      try {
        // 카테고리 드롭다운 클릭
        await page.click('[class*="option_category"]', { timeout: 5000 });
        await page.waitForTimeout(1000);

        // 카테고리 목록에서 해당 항목 선택 (li.item__* 중 텍스트 매칭)
        const items = await page.$$('li[class*="item__"]');
        let found = false;
        for (const item of items) {
          const text = await item.textContent();
          if (text.includes(subCategory)) {
            await item.click();
            console.log(`[Naver] 카테고리 "${subCategory}" 선택 완료`);
            found = true;
            break;
          }
        }
        if (!found) {
          console.warn(`[Naver] 카테고리 "${subCategory}" 찾기 실패, 기본 카테고리로 발행`);
        }
        await page.waitForTimeout(500);
      } catch (e) {
        console.warn(`[Naver] 카테고리 선택 실패: ${e.message}`);
      }
    }

    // 최종 발행 확인 버튼 클릭
    console.log('[Naver] 최종 발행...');
    await page.click('button[class*="confirm_btn"]', { timeout: 10000 });

    // 발행 완료 대기 (에디터 → 포스트 뷰로 이동)
    try {
      await page.waitForURL(url => !url.href.includes('/postwrite'), { timeout: 15000 });
      console.log(`[Naver] 발행 완료: ${page.url()}`);
    } catch (_) {
      console.warn('[Naver] 발행 완료를 확인하지 못함 (에디터에 남아있음)');
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

이것은 네이버 블로그 자동 발행 테스트입니다.

### 테스트 항목
- **Playwright** 브라우저 자동화
- [네이버 블로그](https://blog.naver.com) 로그인
- SmartEditor ONE 본문 입력

> 이 포스트는 자동 생성되었습니다.

## 결론
테스트 완료!`;

    publishToNaverBlog(testTitle, testBody)
      .then(() => console.log('\n[테스트] 완료'))
      .catch(err => {
        console.error('\n[테스트 실패]', err.message);
        process.exit(1);
      });
  } else {
    console.log('사용법: node scripts/naver-publisher.js --test');
  }
}

module.exports = { publishToNaverBlog, markdownToHtml };
