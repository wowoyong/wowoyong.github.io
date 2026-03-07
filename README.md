# wowoyong.github.io

Jekyll(Chirpy) 기반 블로그 저장소이며, AI 데일리 포스트를 생성해 GitHub Pages에 배포하고 필요하면 네이버 블로그와 티스토리까지 자동 발행하는 스크립트를 포함합니다.

## 구성

- Jekyll 블로그 본문은 `_posts/`에 저장됩니다.
- 메인 자동화는 [`scripts/daily-digest.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/daily-digest.js)입니다.
- 외부 블로그 발행은 [`scripts/naver-publisher.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/naver-publisher.js), [`scripts/tistory-publisher.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/tistory-publisher.js)에서 처리합니다.
- 로그인 세션 유지 자동화는 [`scripts/session-keepalive.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/session-keepalive.js)에서 처리합니다.

## 동작 흐름

`scripts/daily-digest.js`는 아래 순서로 실행됩니다.

1. 최근 AI 관련 데이터를 수집합니다.
   - Hacker News
   - GitHub repository search
   - YouTube Data API (설정된 경우)
2. Claude CLI를 호출해 한국어 요약 본문을 생성합니다.
3. Jekyll 포스트를 `_posts/YYYY-MM-DD-ai-daily.md`로 저장합니다.
4. `--dry-run`이 아니면 git commit/push로 GitHub Pages 배포를 진행합니다.
5. 이후 네이버 블로그 발행을 시도합니다.
6. 이후 티스토리 발행을 시도합니다.

네이버/티스토리 발행 실패는 GitHub Pages 배포를 중단시키지 않도록 `try/catch`로 분리되어 있습니다.

## 설치

기본 의존성은 `playwright`입니다.

```bash
npm install
npx playwright install chromium
```

Jekyll 로컬 실행은 이 저장소의 Ruby/Jekyll 설정을 따르되, 자동 발행 스크립트는 Node.js 환경이 별도로 필요합니다.

## 환경변수

스크립트들은 `scripts/config.env`를 읽고, 이미 셸에 설정된 값이 있으면 그 값을 우선 사용합니다.
기본 템플릿은 [`scripts/config.env.example`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/config.env.example)에 정리해두었습니다.

주요 키는 아래와 같습니다.

```dotenv
YOUTUBE_API_KEY=

NAVER_ID=
NAVER_PW=
NAVER_BLOG_ID=
NAVER_CATEGORY=

KAKAO_EMAIL=
KAKAO_PW=
TISTORY_BLOG=
TISTORY_CATEGORY=
```

예시 파일에 있는 주석까지 포함한 형태는 [`scripts/config.env.example`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/config.env.example)에서 확인할 수 있습니다.

용도:

- `YOUTUBE_API_KEY`: YouTube 추천 영상 수집에 사용합니다. 없으면 YouTube 수집은 건너뜁니다.
- `NAVER_ID`, `NAVER_PW`: 네이버 로그인 계정입니다.
- `NAVER_BLOG_ID`: 네이버 블로그 글쓰기 URL에 쓰는 블로그 ID입니다.
- `NAVER_CATEGORY`: 네이버 발행 시 선택할 카테고리입니다.
- `KAKAO_EMAIL`, `KAKAO_PW`: 티스토리 로그인용 카카오 계정입니다.
- `TISTORY_BLOG`: 티스토리 블로그 서브도메인입니다. `https://{blog}.tistory.com`의 `{blog}` 값입니다.
- `TISTORY_CATEGORY`: 티스토리 발행 시 선택할 카테고리입니다.

## 카테고리 선택 방식

네이버와 티스토리 모두 카테고리 값을 문자열로 받아 발행 직전에 선택합니다.

### 네이버

- `NAVER_CATEGORY`를 사용합니다.
- 값에 `/`가 포함되면 마지막 조각만 실제 비교값으로 사용합니다.
  - 예: `이것저것/제품리뷰` -> `제품리뷰`
- 발행 패널에서 카테고리 UI를 연 뒤, 목록 항목 텍스트에 해당 값이 포함(`includes`)되면 클릭합니다.

주의:

- 부분 일치 기준이라 비슷한 이름의 카테고리가 여러 개면 먼저 일치한 항목이 선택될 수 있습니다.
- 현재 셀렉터는 `button[class*="publish_btn"]`, `[class*="option_category"]`, `li[class*="item__"]`, `button[class*="confirm_btn"]` 같은 클래스 부분 일치에 의존합니다.
- 네이버 에디터 UI의 클래스 prefix가 바뀌면 카테고리 선택뿐 아니라 발행 버튼 탐색도 함께 깨질 수 있습니다.

### 티스토리

- `TISTORY_CATEGORY`를 사용합니다.
- 값에 `/`가 포함되면 마지막 조각만 실제 비교값으로 사용합니다.
  - 예: `일상/리뷰` -> `리뷰`
- 카테고리 UI를 연 뒤, 화면 내 텍스트가 정확히 일치하거나 `- 카테고리명`과 일치하면 클릭합니다.

주의:

- 정확 일치 기준이라 네이버보다 덜 모호하지만, 에디터 DOM 구조가 바뀌면 탐색 로직이 깨질 수 있습니다.
- 현재 셀렉터는 `#category-btn`, `#post-title-inp`, `iframe#editor-tistory_ifr`, `#publish-layer-btn`, `#open20`, `#publish-btn` 같은 고정 ID에 의존합니다.
- 카테고리 탐색은 카테고리 목록 컨테이너를 좁게 잡지 않고 `span, a, li, div, p` 전체를 순회하므로, 동일 텍스트가 화면 다른 영역에 있으면 오탐 가능성이 있습니다.

## 선택자 리스크

자동 발행 스크립트는 Playwright로 현재 웹 UI를 직접 조작하므로, UI 변경에 취약합니다.

- 네이버: SmartEditor ONE DOM과 클래스명 일부에 직접 의존합니다. 특히 클래스 부분 일치 기반 셀렉터는 내부 CSS 모듈 이름이 바뀌면 바로 실패합니다.
- 네이버: 본문 입력은 클립보드 붙여넣기(`Meta+V`)에 의존하므로, 브라우저 권한/포커스 상태에 따라 실패할 수 있습니다.
- 티스토리: TinyMCE iframe ID와 전역 `tinymce.activeEditor`에 의존합니다. 에디터 교체나 iframe 구조 변경 시 깨질 가능성이 큽니다.
- 티스토리: 카테고리 선택은 화면의 넓은 범위를 순회해 텍스트를 찾는 방식이라, 동일 문구가 다른 요소에 나타나면 잘못 클릭할 수 있습니다.
- 공통: 로그인 팝업, 초안 복구 팝업, 도움말 패널 등 보조 UI가 바뀌면 발행 전에 흐름이 막힐 수 있습니다.

## 실행 방법

### 1. AI 데일리 생성 + GitHub Pages 배포 + 외부 블로그 발행

```bash
npm run daily
```

`--dry-run`을 붙이면 포스트 파일만 만들고 git push 및 외부 발행은 하지 않습니다.

```bash
npm run daily:dry
```

### 2. 네이버 블로그 단독 테스트 발행

```bash
npm run publish:naver:test
```

이 스크립트는 Playwright로 로그인 세션을 복원하거나 로그인한 뒤, 테스트 제목/본문을 작성하고 발행합니다.

### 3. 티스토리 단독 테스트 발행

```bash
npm run publish:tistory:test
```

티스토리는 카카오 로그인 흐름을 따르며, 세션이 만료되면 2단계 인증 승인이 필요할 수 있습니다.

### 4. 로그인 세션 유지

```bash
npm run session:keepalive
```

역할:

- 네이버: 세션이 만료되면 ID/PW로 자동 재로그인 시도
- 티스토리: 쿠키 기반 세션 확인 및 유지, 만료 시 경고

## 파일 참고

- [`scripts/daily-digest.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/daily-digest.js): 메인 수집/요약/저장/배포 흐름
- [`scripts/naver-publisher.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/naver-publisher.js): 네이버 블로그 발행 자동화
- [`scripts/tistory-publisher.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/tistory-publisher.js): 티스토리 발행 자동화
- [`scripts/session-keepalive.js`](/Users/jojaeyong/WebstormProjects/wowoyong.github.io/scripts/session-keepalive.js): 세션 상태 점검 및 쿠키 갱신

## 운영 메모

- Playwright는 `headless: false`로 실행되므로 브라우저 창이 실제로 열립니다.
- 네이버와 티스토리 모두 사이트 UI가 바뀌면 셀렉터가 쉽게 깨질 수 있습니다.
- `scripts/` 아래 쿠키/로그 파일은 로컬 실행 상태를 반영하므로, 공유 전에는 민감 정보 포함 여부를 확인하는 편이 안전합니다.
- `scripts/daily-digest.js`에는 로컬 경로와 외부 CLI 경로가 하드코딩되어 있어, 다른 환경으로 옮길 때는 경로 수정이 필요합니다.
- Playwright 브라우저가 아직 설치되지 않았다면 `npm run playwright:install`로 Chromium을 먼저 설치하면 됩니다.
