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
const STATE_PATH = path.join(__dirname, 'sec-state.json');

const NVD_BASE              = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const GITHUB_ADVISORIES_URL = 'https://api.github.com/advisories';
const ECOSYSTEMS = ['npm', 'pip', 'maven', 'go', 'rubygems', 'nuget', 'composer'];

// config.env 로드
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  fs.readFileSync(configPath, 'utf8').split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
}
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'claude';
const NVD_API_KEY  = process.env.NVD_API_KEY  || '';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const PUBLISH_RETRY_COUNT    = parseInt(process.env.PUBLISH_RETRY_COUNT || '2', 10);
const PUBLISH_RETRY_DELAY_MS = parseInt(process.env.PUBLISH_RETRY_DELAY_MS || '20000', 10);

// NVD API 키 미설정 경고
if (!NVD_API_KEY) {
  console.warn('[경고] NVD_API_KEY 없음 — rate limit 적용 (초당 5회). scripts/config.env에 추가 권장.');
}

// ─── 유틸 ──────────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// ─── 상태 관리 ────────────────────────────────────────────────────────────────
function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { postedCves: {}, lastRun: null };
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

// ─── HTTP 헬퍼 ────────────────────────────────────────────────────────────────
async function fetchJSON(url, headers = {}, retries = 1) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SecWeekly-Blog/1.0', ...headers },
    signal: AbortSignal.timeout(20000)
  });
  if (res.status === 403 || res.status === 429) {
    if (retries > 0) {
      console.warn(`[API] Rate limit (${res.status}), 30초 대기 후 재시도`);
      await sleep(30000);
      return fetchJSON(url, headers, retries - 1);
    }
    throw new Error(`HTTP ${res.status}: ${url}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

// ─── NVD API ──────────────────────────────────────────────────────────────────
function extractCpes(configurations) {
  const cpes = [];
  (configurations?.nodes || []).forEach(node => {
    (node.cpeMatch || []).forEach(m => cpes.push(m.criteria));
    (node.children || []).forEach(child =>
      (child.cpeMatch || []).forEach(m => cpes.push(m.criteria))
    );
  });
  return cpes;
}

async function fetchNvdCves(startDate, endDate) {
  const fmt = d => d.toISOString().replace('Z', '').slice(0, 23);
  const baseParams = `pubStartDate=${encodeURIComponent(fmt(startDate))}&pubEndDate=${encodeURIComponent(fmt(endDate))}&resultsPerPage=50`;

  const nvdHeaders = {};
  if (NVD_API_KEY) nvdHeaders['apiKey'] = NVD_API_KEY;

  const [critical, high] = await Promise.all([
    fetchJSON(`${NVD_BASE}?${baseParams}&cvssV3Severity=CRITICAL`, nvdHeaders)
      .catch(e => { console.warn('[NVD CRITICAL]', e.message); return { vulnerabilities: [] }; }),
    fetchJSON(`${NVD_BASE}?${baseParams}&cvssV3Severity=HIGH`, nvdHeaders)
      .catch(e => { console.warn('[NVD HIGH]', e.message); return { vulnerabilities: [] }; }),
  ]);

  await sleep(700);

  return [...(critical.vulnerabilities || []), ...(high.vulnerabilities || [])].map(v => {
    const cve = v.cve;
    const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0];
    const cpes = extractCpes(cve.configurations);
    return {
      id:          cve.id,
      published:   cve.published,
      description: cve.descriptions?.find(d => d.lang === 'en')?.value || '',
      cvss:        metrics?.cvssData?.baseScore || 0,
      severity:    metrics?.cvssData?.baseSeverity || 'HIGH',
      cpes,
      nvdUrl:      `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      source:      'NVD',
      packages:    []
    };
  });
}

// ─── GitHub Advisories ────────────────────────────────────────────────────────
async function fetchGitHubAdvisories(since) {
  const ghHeaders = { 'Accept': 'application/vnd.github+json' };
  if (GITHUB_TOKEN) ghHeaders['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const sinceStr = since.toISOString();

  const results = await Promise.all(
    ECOSYSTEMS.map(eco =>
      fetchJSON(
        `${GITHUB_ADVISORIES_URL}?ecosystem=${eco}&severity=high,critical&per_page=5&sort=published&direction=desc`,
        ghHeaders
      ).catch(e => { console.warn(`[GitHub] ${eco} 실패: ${e.message}`); return []; })
    )
  );

  const all = results.flat().filter(a => a.published_at >= sinceStr);
  const unique = [...new Map(all.map(a => [a.ghsa_id, a])).values()];

  return unique.map(a => ({
    id:          a.cve_id || a.ghsa_id,
    published:   a.published_at,
    description: a.description || a.summary || '',
    cvss:        a.cvss?.score || 0,
    severity:    (a.severity || 'HIGH').toUpperCase(),
    cpes:        [],
    nvdUrl:      a.cve_id
                   ? `https://nvd.nist.gov/vuln/detail/${a.cve_id}`
                   : `https://github.com/advisories/${a.ghsa_id}`,
    source:      'GitHub',
    packages:    (a.vulnerabilities || []).map(v => ({
      ecosystem: v.package?.ecosystem,
      name:      v.package?.name,
      affected:  v.vulnerable_version_range,
      patched:   v.first_patched_version
    }))
  }));
}

// ─── 필터링 ───────────────────────────────────────────────────────────────────
const DEV_KEYWORDS = [
  'node', 'nodejs', 'python', 'java', 'golang', 'ruby', 'php', 'rust',
  'npm', 'pypi', 'maven', 'gradle', 'composer', 'rubygems', 'cargo',
  'spring', 'django', 'rails', 'express', 'fastapi', 'laravel', 'flask',
  'webpack', 'vite', 'babel', 'jest', 'junit', 'jsonwebtoken', 'bcrypt',
  'sequelize', 'mongoose', 'sqlalchemy', 'hibernate', 'prisma',
  'aws-sdk', 'azure-sdk', 'google-cloud', 'boto', 'openssl', 'log4j'
];

const OS_VENDORS = [
  'microsoft:windows', 'apple:macos', 'apple:ios',
  'linux:kernel', 'canonical:ubuntu', 'redhat:enterprise_linux',
  'cisco:', 'juniper:', 'fortinet:', 'palo_alto:'
];

function filterDeveloperRelevant(items) {
  return items.filter(item => {
    if (item.source === 'GitHub') return true;
    if (item.cvss < 7.0) return false;

    const desc  = item.description.toLowerCase();
    const cpes  = item.cpes || [];

    const hasOsCpe    = cpes.some(c => c.split(':')[2] === 'o');
    const hasAppCpe   = cpes.some(c => c.split(':')[2] === 'a');
    const hasOsVendor = OS_VENDORS.some(v => cpes.some(c => c.includes(v)));
    const hasDevKw    = DEV_KEYWORDS.some(kw => desc.includes(kw));

    if ((hasOsCpe || hasOsVendor) && !hasAppCpe && !hasDevKw) return false;
    return true;
  });
}

function deduplicateAndRank(nvdItems, ghItems, postedSet) {
  const merged = [...nvdItems, ...ghItems];
  const map = new Map();
  for (const item of merged) {
    if (!map.has(item.id) || item.source === 'GitHub') {
      map.set(item.id, item);
    }
  }
  return [...map.values()]
    .filter(item => !postedSet.has(item.id))
    .sort((a, b) => b.cvss - a.cvss)
    .slice(0, 10);
}

// ─── LLM 요약 ─────────────────────────────────────────────────────────────────
function buildPrompt(cves, dateStr) {
  return `당신은 7년차 백엔드/풀스택 개발자로, 주니어 개발자(1~2년차)를 위해 주간 보안 취약점 포스트를 씁니다.
도구를 절대 사용하지 마세요. 마크다운 텍스트만 직접 출력하세요.
front matter 없이 본문만 작성하세요.

글쓰기 원칙:
- 이모지 사용 금지
- 문장은 짧고 명확하게
- "왜 위험한가, 내 프로젝트에 어떤 영향인가, 지금 당장 무엇을 해야 하는가" 순으로 설명
- 1~2년차가 읽고 바로 대응 가능한 수준으로

${dateStr} 주간 보안 취약점 포스트 본문을 아래 CVE 데이터로 작성해주세요.

독자: npm, PyPI, Maven 등 라이브러리를 쓰는 풀스택 개발자.

---
[CVE 목록]
${JSON.stringify(cves, null, 2)}
---

다음 섹션 구조를 정확히 따르세요:

## 이번 주 주요 취약점

각 CVE 항목 형식 (심각도 표기: [CRITICAL] / [HIGH] / [MEDIUM], 이모지 사용 금지):

### [{심각도}] {CVE ID} — {영향받는 패키지명}
**CVSS**: {점수} | **영향**: {에코시스템/소프트웨어}
**설명**: 2~3줄 한국어 설명. 공격 벡터, 악용 방법, 영향 범위 포함.
**대응**: 업데이트 버전 또는 임시 회피책
[NVD 상세]({nvdUrl})

CVSS 점수 높은 순으로 정렬. 항목 간 빈 줄 1개.

## 이번 주 보안 트렌드

이번 주 취약점들의 공통 패턴을 개발자 관점에서 3~4줄로 분석.
어떤 기술 스택을 쓰는 개발자가 특히 주의해야 하는지 포함.

규칙:
- 모든 텍스트는 한국어
- CVE ID, 패키지명, 버전 번호, URL, 기술 용어는 영어 유지
- 이모지 사용 금지
- CVSS 점수 높은 순으로 정렬`;
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
function writePost(dateStr, body) {
  const lower = body.toLowerCase();
  const tagCandidates = ['npm', 'python', 'java', 'go', 'ruby', 'spring', 'nodejs',
    'rce', 'xss', 'sqli', 'authentication', 'deserialization', 'ssrf'];
  const tags = ['security', 'cve', 'vulnerability', ...tagCandidates.filter(t => lower.includes(t))];

  const frontMatter = [
    '---',
    `title: "[개발자 보안] ${dateStr} 주간 — 개발자가 주의해야 할 취약점"`,
    `date: ${dateStr} 09:00:00 +0900`,
    `categories: [개발자 보안, CVE]`,
    `tags: [${[...new Set(tags)].join(', ')}]`,
    '---',
    ''
  ].join('\n');

  const filename = `${dateStr}-sec-weekly.md`;
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
  spawnSync('git', ['add', 'scripts/sec-state.json'], opts);

  const commit = spawnSync('git', ['commit', '-m', `feat: 개발자 보안 주간 ${dateStr}`], opts);
  if (commit.status !== 0) throw new Error(`git commit 실패: ${commit.stderr}`);

  // unstaged 변경사항 stash 후 rebase
  const stash = spawnSync('git', ['stash', '--include-untracked'], opts);
  const hasStash = stash.stdout && stash.stdout.includes('Saved');

  const pull = spawnSync('git', ['pull', '--rebase', 'origin', 'main'], opts);
  if (pull.status !== 0) {
    if (hasStash) spawnSync('git', ['stash', 'pop'], opts);
    throw new Error(`git pull --rebase 실패: ${pull.stderr}`);
  }

  if (hasStash) spawnSync('git', ['stash', 'pop'], opts);

  const push = spawnSync('git', ['push', 'origin', 'main'], opts);
  if (push.status !== 0) throw new Error(`git push 실패: ${push.stderr}`);

  console.log('[Git] 배포 완료');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const now     = new Date();
  const kstNow  = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const dateStr = kstNow.toISOString().slice(0, 10);
  const weekKey = getIsoWeek(kstNow);

  console.log(`\n=== 보안 주간 생성: ${dateStr} (${weekKey}) ===`);

  // ─── 중복 방지 ──────────────────────────────────────────────
  const weekFile = path.join(BLOG_DIR, '_posts', `${dateStr}-sec-weekly.md`);
  if (fs.existsSync(weekFile) && !process.argv.includes('--force')) {
    console.log(`[스킵] ${dateStr} 보안 위클리 포스트가 이미 있습니다.`);
    console.log(`재생성하려면 --force 플래그를 사용하세요.`);
    process.exit(0);
  }

  if (DRY_RUN) console.log('[dry-run 모드: git push 생략]');

  const state = loadState();
  const postedSet = new Set(state.postedCves[weekKey] || []);

  const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  console.log('[API] NVD + GitHub Advisories 조회 중...');
  const [nvdItems, ghItems] = await Promise.all([
    fetchNvdCves(since, now).catch(e => { console.error('[NVD 오류]', e.message); return []; }),
    fetchGitHubAdvisories(since).catch(e => { console.error('[GitHub 오류]', e.message); return []; }),
  ]);

  console.log(`[수집] NVD=${nvdItems.length}, GitHub=${ghItems.length}`);

  const filtered = filterDeveloperRelevant([...nvdItems, ...ghItems]);
  console.log(`[필터] 개발자 관련 ${filtered.length}개`);

  const cves = deduplicateAndRank(
    nvdItems.filter(i => filtered.some(f => f.id === i.id)),
    ghItems.filter(i => filtered.some(f => f.id === i.id)),
    postedSet
  );
  console.log(`[최종] ${cves.length}개 CVE 선정`);

  if (cves.length === 0) {
    console.warn('[경고] 이번 주 개발자 관련 신규 취약점이 없습니다. 종료.');
    process.exit(0);
  }

  const prompt = buildPrompt(cves, dateStr);
  console.log('[LLM] 보안 포스트 생성 중...');
  const body     = callLLM(prompt);
  const filename = writePost(dateStr, body);

  // 상태 업데이트
  state.postedCves[weekKey] = [...postedSet, ...cves.map(c => c.id)];
  state.lastRun = now.toISOString();
  saveState(state);

  if (!DRY_RUN) {
    let gitOk = false;
    try {
      gitPush(filename, dateStr);
      gitOk = true;
      console.log(`\n✓ GitHub Pages 배포 완료: https://wowoyong.github.io/posts/${dateStr}-sec-weekly/`);
    } catch (e) {
      console.error(`[Git] 배포 실패 (네이버/티스토리는 계속 진행): ${e.message}`);
    }

    const title = `[개발자 보안] ${dateStr} — 이번 주 주요 취약점`;

    async function publishWithRetry(fn, label) {
      for (let i = 0; i <= PUBLISH_RETRY_COUNT; i++) {
        try { await fn(); return true; }
        catch (e) {
          if (i < PUBLISH_RETRY_COUNT) {
            console.warn(`[${label}] 실패(${i+1}/${PUBLISH_RETRY_COUNT}): ${e.message} — ${PUBLISH_RETRY_DELAY_MS/1000}초 후 재시도`);
            await new Promise(r => setTimeout(r, PUBLISH_RETRY_DELAY_MS));
          } else {
            console.error(`[${label}] 최종 실패 (GitHub Pages는 정상):`, e.message);
            return false;
          }
        }
      }
    }

    const { publishToNaverBlog } = require('./naver-publisher');
    const { publishToTistory }   = require('./tistory-publisher');
    await publishWithRetry(() => publishToNaverBlog(title, body, '개발자 보안'), 'Naver');
    await publishWithRetry(() => publishToTistory(title, body, '개발자 보안'), 'Tistory');

    if (!gitOk) {
      console.warn('\n[경고] GitHub Pages 배포는 실패했습니다. 수동으로 git push를 실행하세요.');
    }
  } else {
    console.log(`\n[dry-run] 파일 생성됨: _posts/${filename} (push 생략)`);
  }
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
