# Reddit Claude Digest — 설계 문서

> 작성일: 2026-03-17

## 개요

Reddit의 r/ClaudeAI, r/anthropic에서 Claude/Anthropic 관련 핫이슈를 매일 자동 수집하여, 시니어 개발자 관점에서 카테고리별 분석 포스트를 생성하는 자동화 스크립트.

기존 `daily-digest.js`(HN/GitHub/YouTube 기반 AI 데일리)와 독립된 포스트로 운영.

## 대상 서브레딧

- r/ClaudeAI — Claude 사용자 커뮤니티
- r/anthropic — Anthropic 공식/일반 커뮤니티

## 데이터 수집

### API 방식

Reddit 공개 JSON API 사용 (인증 불필요, 하루 1회 실행에 rate limit 문제 없음).

**User-Agent 헤더 필수**: `RedditClaudeDigest/1.0 (+https://wowoyong.github.io)` — Reddit은 User-Agent 없는 요청을 403/429로 거부할 수 있음.

**향후 리스크**: 비인증 JSON API가 제한될 가능성 있음. 필요 시 Reddit OAuth 앱 등록(무료)으로 전환 가능.

### 엔드포인트 (서브레딧당 2개, 총 4개 요청)

- `https://www.reddit.com/r/{sub}/hot.json?limit=15` — 실시간 트렌드
- `https://www.reddit.com/r/{sub}/top.json?t=day&limit=15` — 전일 검증된 인기글

### 수집 필드

| 필드 | 용도 |
|------|------|
| `id` | 중복 추적 |
| `title` | 제목 |
| `selftext` | 본문 (self post, 최대 2000자 truncate) |
| `url` | 링크 (link post) |
| `score` | 업보트 수 |
| `num_comments` | 댓글 수 |
| `permalink` | 원문 링크 |
| `created_utc` | 작성 시간 |
| `link_flair_text` | 플레어 (카테고리 힌트, null 가능 — null 시 생략) |
| `subreddit` | 출처 서브레딧 |

### 중복 제거 (Hot/Top 간)

동일 포스트가 Hot과 Top에 모두 등장할 수 있으므로, `id` 기준으로 Map에 병합.

## 중복 방지 (전날 대비)

### 파일: `scripts/data/reddit-seen.json`

```json
{
  "seen": {
    "abc123": "2026-03-17",
    "def456": "2026-03-16"
  },
  "lastRun": "2026-03-17"
}
```

### 로직

1. 수집한 포스트 중 `seen`에 이미 있는 ID는 제외
2. 최종 선정된 포스트 ID를 `seen`에 추가 (날짜와 함께)
3. 7일 이상 지난 항목은 자동 정리 (파일 비대화 방지)
4. 필터 후 포스트가 3개 미만이면 seen 만료를 3일로 단축해서 재수집 허용

## 랭킹 및 선정

### 가중 점수

```
score = (upvotes × 1.0) + (num_comments × 2.0) + (recency_bonus)
```

- 댓글 가중치 2배: 댓글이 많다 = 토론 가치가 높다
- recency_bonus: 6시간 이내 포스트에 +50점 (신선한 이슈 우대)

### 선정 기준

- 상위 5~7개 포스트 (중복 제거 + seen 필터 후)
- 3개 미만 시 seen 만료 단축 적용

## LLM 콘텐츠 생성

### 프롬프트 구성

1. **페르소나**: 5년차 이상 시니어 개발자, Claude/AI 생태계에 정통
2. **입력 데이터**: 선정된 포스트들을 JSON으로 전달 (title, selftext, score, num_comments, permalink, subreddit, flair)
3. **출력 지시**:
   - 카테고리별 분류: 신기능/업데이트, 버그/이슈, 팁/활용법, 심층 토론, 생태계/서드파티
   - 각 포스트: 핵심 요약 + 왜 주목할 만한지 시니어 관점 코멘트 + 원문 링크
   - 하단에 "오늘의 Reddit 온도" — 커뮤니티 전반 분위기 한줄 요약

### 모델

`claude-haiku-4-5-20251001` 하드코딩 (기존 스크립트 패턴 동일)

## 출력 포맷

### 프론트매터

```yaml
---
title: "[Reddit 클로드] {LLM 생성 제목} - {날짜}"
categories: [Reddit 클로드]
tags: [claude, anthropic, reddit, ...]
---
```

### 파일명

`_posts/{YYYY-MM-DD}-reddit-claude.md`

### Git 커밋 메시지

`feat: Reddit 클로드 {YYYY-MM-DD}`

## 실행 흐름

```
reddit-digest.js 실행
│
├─ 1. config.env 로드
├─ 2. reddit-seen.json 로드 + 7일 초과 항목 정리
├─ 3. 데이터 수집 (병렬)
│    ├─ r/ClaudeAI/hot.json
│    ├─ r/ClaudeAI/top.json?t=day
│    ├─ r/anthropic/hot.json
│    └─ r/anthropic/top.json?t=day
├─ 4. ID 기준 병합 + seen 필터링
├─ 5. 가중 점수 랭킹 → 상위 5~7개 선정
├─ 6. Claude API로 포스트 생성 (카테고리 분류 + 분석)
├─ 7. _posts/{date}-reddit-claude.md 파일 작성
├─ 8. reddit-seen.json 업데이트 (선정된 ID 추가)
├─ 9. Git workflow (add 포스트 + seen.json → commit → stash → pull --rebase → push)
└─ 10. Naver + Tistory 퍼블리싱 (publishWithRetry 패턴, PUBLISH_RETRY_COUNT/DELAY_MS 사용)
```

## 가드 (기존 패턴 준수)

- **파일 존재 체크**: `_posts/{date}-reddit-claude.md`가 이미 존재하면 스킵 (재실행 안전)
- **`--force` 플래그**: 파일 존재 체크 무시, 강제 재생성
- **`--dry-run` 플래그**: Git push + 퍼블리싱 스킵

## 에러 처리

- Reddit API 실패 → 재시도 1회 (2초 대기), 실패 시 해당 엔드포인트 스킵
- 수집 결과 0건 → 로그 출력 후 종료 (포스트 미생성)
- Claude CLI 실패 → process.exit(1) (기존 패턴 동일)
- `LLM_PROVIDER=codex` 폴백 지원 (기존 패턴 동일)

## config.env 추가 항목

기존 설정 그대로 사용. 별도 Reddit 인증 키 불필요.

## 퍼블리싱

- Naver 카테고리: `Reddit 클로드` (스크립트 내 하드코딩)
- Tistory 카테고리: `Reddit 클로드` (스크립트 내 하드코딩)
- `publishWithRetry()` 패턴 사용 (`PUBLISH_RETRY_COUNT`, `PUBLISH_RETRY_DELAY_MS` 참조)
- `publish-state.json` 기반 플랫폼별 발행 추적
