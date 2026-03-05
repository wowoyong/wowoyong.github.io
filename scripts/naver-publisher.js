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

const USER_DATA_DIR = path.join(__dirname, '..', '.playwright-naver');
const NAVER_COOKIES = path.join(__dirname, 'naver-cookies.json');
const NAVER_ID = process.env.NAVER_ID || '';
const NAVER_PW = process.env.NAVER_PW || '';
const NAVER_BLOG_ID = process.env.NAVER_BLOG_ID || '';
const NAVER_CATEGORY = process.env.NAVER_CATEGORY || '';

const LOGIN_URL = 'https://nid.naver.com/nidlogin.login?mode=form';
const WRITE_URL = (blogId) => `https://blog.naver.com/${blogId}/postwrite`;

function extractLeafCategory(category) {
  return category
    .split(/[/>]/)
    .map(part => part.trim())
    .filter(Boolean)
    .pop() || '';
}

// ─── 쿠키 저장/복원 헬퍼 ─────────────────────────────────────────────────────
async function loadCookies(context) {
  if (fs.existsSync(NAVER_COOKIES)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(NAVER_COOKIES, 'utf8'));
      await context.addCookies(cookies);
      return true;
    } catch (_) {}
  }
  return false;
}

async function saveCookies(context) {
  const cookies = await context.cookies();
  fs.writeFileSync(NAVER_COOKIES, JSON.stringify(cookies, null, 2));
}

// ─── 마크다운 → 네이버용 변환 ────────────────────────────────────────────────
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function convertMarkdownForNaver(md) {
  const codeBlocks = [];
  let source = md.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, lang = '', code = '') => {
    const token = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({
      lang: lang.trim(),
      code: code.replace(/\n$/, ''),
    });
    return token;
  });

  let text = source;
  let html = source;

  text = text.replace(/^## (.+)$/gm, '$1');
  text = text.replace(/^### (.+)$/gm, '$1');
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  text = text.replace(/`([^`]+)`/g, '[$1]');
  text = text.replace(/^> (.+)$/gm, '[highlight] $1');
  text = text.replace(/^- (.+)$/gm, '• $1');

  html = escapeHtml(html);
  html = html.replace(/^## (.+)$/gm, '<div style="margin:18px 0 8px;font-size:20px;font-weight:700;">$1</div>');
  html = html.replace(/^### (.+)$/gm, '<div style="margin:14px 0 6px;font-size:17px;font-weight:700;">$1</div>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" style="color:#2f6fed;text-decoration:underline;">$1</a>'
  );
  html = html.replace(
    /`([^`]+)`/g,
    '<span style="background:#f3f5f7;border:1px solid #d8dee4;border-radius:4px;padding:1px 6px;font-family:monospace;">$1</span>'
  );
  html = html.replace(
    /^> (.+)$/gm,
    '<div style="margin:10px 0;padding:10px 12px;border-left:4px solid #03c75a;background:#f6fbf8;"><strong>Highlight.</strong> $1</div>'
  );
  html = html.replace(/^- (.+)$/gm, '<div style="margin:2px 0 2px 12px;">• $1</div>');

  for (let i = 0; i < codeBlocks.length; i += 1) {
    const token = `__CODE_BLOCK_${i}__`;
    const { lang, code } = codeBlocks[i];
    const label = lang ? `[${lang}]` : '[code]';
    const escapedCode = escapeHtml(code);
    text = text.replace(token, `${label}\n${code}\n[/code]`);
    html = html.replace(
      token,
      `<div style="margin:12px 0;padding:12px 14px;border:1px solid #d8dee4;border-radius:8px;background:#f6f8fa;font-family:monospace;white-space:pre-wrap;"><strong style="display:block;margin-bottom:8px;font-family:sans-serif;">${label}</strong>${escapedCode}</div>`
    );
  }

  html = html.replace(/\n/g, '<br>');
  html = html.replace(/(<br>){3,}/g, '<br><br>');

  return { text, html };
}

// ─── Persistent Context 로그인 ───────────────────────────────────────────────
async function naverLogin() {
  if (!NAVER_ID || !NAVER_PW) {
    throw new Error('[Naver] NAVER_ID, NAVER_PW 환경변수가 설정되지 않았습니다.');
  }

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  await loadCookies(context);

  // 로그인 상태 확인
  const page = await context.newPage();
  console.log('[Naver] 로그인 상태 확인...');
  await page.goto('https://blog.naver.com/MyBlog.naver', {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  await page.waitForTimeout(2000);

  const url = page.url();
  if (!url.includes('nidlogin') && !url.includes('login')) {
    console.log('[Naver] 세션 유지 중 (persistent context)');
    await saveCookies(context);
    await page.close();
    return context;
  }

  // 세션 없음 → 로그인 진행
  console.log('[Naver] 로그인 진행...');
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.fill('#id', NAVER_ID);
  await page.waitForTimeout(500);
  await page.fill('#pw', NAVER_PW);
  await page.waitForTimeout(500);
  await page.click('.btn_login');

  try {
    await page.waitForURL((url) => !url.href.includes('nidlogin'), { timeout: 30000 });
  } catch (e) {
    const currentUrl = page.url();
    if (currentUrl.includes('nidlogin')) {
      const captcha = await page.$('.captcha_wrap');
      if (captcha) throw new Error('[Naver] CAPTCHA 발생 — 수동 로그인 필요');
      throw new Error('[Naver] 로그인 실패 — ID/PW 확인 필요');
    }
  }

  // "새로운 기기" 팝업 처리
  try {
    const skipBtn = await page.$('a.btn_skip, button.btn_skip, #new\\.dontsave');
    if (skipBtn) await skipBtn.click();
  } catch (_) {}

  console.log('[Naver] 로그인 성공');
  await saveCookies(context);
  await page.close();
  return context;
}

// ─── 블로그 발행 ──────────────────────────────────────────────────────────────
async function publishToNaverBlog(title, markdownBody) {
  if (!NAVER_BLOG_ID) {
    throw new Error('[Naver] NAVER_BLOG_ID 환경변수가 설정되지 않았습니다.');
  }

  const context = await naverLogin();

  try {
    const page = await context.newPage();
    const writeUrl = WRITE_URL(NAVER_BLOG_ID);
    console.log(`[Naver] 에디터 이동: ${writeUrl}`);
    await page.goto(writeUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 초안 복구 팝업 처리
    try {
      const draftPopup = await page.$('.se-popup-button-cancel, .se-popup-close');
      if (draftPopup) {
        await draftPopup.click();
        console.log('[Naver] 초안 복구 팝업 닫음');
        await page.waitForTimeout(1000);
      }
    } catch (_) {}

    // 도움말 패널 닫기
    try {
      const helpClose = await page.$('.se-help-panel-close-button');
      if (helpClose) {
        await helpClose.click();
        console.log('[Naver] 도움말 패널 닫음');
        await page.waitForTimeout(1000);
      }
    } catch (_) {}

    // 제목 입력
    console.log('[Naver] 제목 입력...');
    const titleSelector = '.se-documentTitle .se-text-paragraph';
    await page.waitForSelector(titleSelector, { timeout: 15000 });
    await page.click(titleSelector);
    await page.waitForTimeout(500);
    await page.keyboard.insertText(title);
    await page.waitForTimeout(500);

    // 본문 입력 (클립보드 붙여넣기)
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

    const { text: plainBody, html: htmlBody } = convertMarkdownForNaver(markdownBody);

    await page.evaluate(async ({ text, html }) => {
      if (window.ClipboardItem && navigator.clipboard.write) {
        const item = new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
        return;
      }

      await navigator.clipboard.writeText(text);
    }, { text: plainBody, html: htmlBody });
    await page.waitForTimeout(300);
    await page.keyboard.down('Meta');
    await page.keyboard.press('v');
    await page.keyboard.up('Meta');
    await page.waitForTimeout(3000);
    console.log('[Naver] 본문 입력 완료');

    // 발행 설정 패널 열기
    console.log('[Naver] 발행 설정 패널 열기...');
    await page.click('button[class*="publish_btn"]', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 카테고리 선택
    if (NAVER_CATEGORY) {
      const subCategory = extractLeafCategory(NAVER_CATEGORY);

      console.log(`[Naver] 카테고리 선택: ${subCategory}`);
      try {
        await page.click('[class*="option_category"]', { timeout: 5000 });
        await page.waitForTimeout(1000);
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
        if (!found) console.warn(`[Naver] 카테고리 "${subCategory}" 찾기 실패`);
        await page.waitForTimeout(500);
      } catch (e) {
        console.warn(`[Naver] 카테고리 선택 실패: ${e.message}`);
      }
    }

    // 최종 발행
    console.log('[Naver] 최종 발행...');
    await page.click('button[class*="confirm_btn"]', { timeout: 10000 });

    try {
      await page.waitForURL(url => !url.href.includes('/postwrite'), { timeout: 15000 });
      console.log(`[Naver] 발행 완료: ${page.url()}`);
    } catch (_) {
      console.warn('[Naver] 발행 완료를 확인하지 못함');
    }

    await page.close();
  } finally {
    await context.close();
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

module.exports = { publishToNaverBlog, convertMarkdownForNaver };
