# wowoyong.github.io

> AI 데일리 블로그 — 풀스택 개발자를 위한 AI 뉴스와 GitHub 하이라이트 자동 수집·정리

## 개요

`wowoyong.github.io`는 Jekyll 기반의 개인 기술 블로그입니다. 매일 Hacker News, GitHub Trending, YouTube에서 AI 관련 뉴스와 주목할 만한 오픈소스 프로젝트를 자동으로 수집하고, Claude AI를 통해 풀스택 개발자 관점으로 요약·정리하여 포스트를 자동 생성합니다. 생성된 포스트는 GitHub Pages에 자동 배포되며, 선택적으로 네이버 블로그와 티스토리에도 동시 발행됩니다.

## 주요 기능

- Hacker News, GitHub, YouTube에서 AI 관련 콘텐츠 자동 수집
- Claude AI(claude-haiku)를 활용한 풀스택 개발자 관점 한국어 요약
- Jekyll + Chirpy 테마 기반 포스트 자동 생성 및 GitHub Pages 배포
- 네이버 블로그, 티스토리 자동 크로스 포스팅 (Playwright 기반)
- GitHub Actions를 통한 자동 빌드·배포 파이프라인

## 기술 스택

- **블로그 엔진**: Jekyll (Chirpy 테마)
- **자동화 스크립트**: Node.js
- **AI 요약**: Anthropic Claude API (claude-haiku-4-5)
- **크로스 포스팅**: Playwright (네이버 블로그, 티스토리)
- **배포**: GitHub Pages, GitHub Actions

## 설치 및 실행

```bash
# Ruby 및 Bundler 필요
bundle install

# 로컬 개발 서버 실행
bundle exec jekyll serve

# AI 데일리 포스트 자동 생성
node scripts/daily-digest.js

# dry-run 모드 (git push 생략)
node scripts/daily-digest.js --dry-run
```

## 환경 변수

`scripts/config.env` 파일을 생성하여 아래 값을 설정합니다:

```
YOUTUBE_API_KEY=     # YouTube Data API v3 키 (선택)
```

Anthropic Claude CLI(`claude-code`)가 시스템에 설치되어 있어야 합니다.

## 프로젝트 구조

```
wowoyong.github.io/
├── _config.yml              # Jekyll 설정 (사이트명, 언어, 테마 등)
├── _posts/                  # 자동 생성된 포스트 저장 디렉토리
├── _tabs/                   # 블로그 탭 페이지 (About, Archives 등)
├── assets/                  # 이미지, CSS 등 정적 자산
├── scripts/
│   ├── daily-digest.js      # AI 데일리 포스트 자동 생성 메인 스크립트
│   ├── naver-publisher.js   # 네이버 블로그 자동 발행 (Playwright)
│   ├── tistory-publisher.js # 티스토리 자동 발행 (Playwright)
│   └── session-keepalive.js # 로그인 세션 유지 유틸리티
└── .github/workflows/
    └── pages-deploy.yml     # GitHub Pages 자동 배포 워크플로우
```
