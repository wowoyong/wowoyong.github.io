# Claude 생태계 주간 큐레이션 + AI 데일리 업그레이드 설계

**날짜:** 2026-03-10
**상태:** 승인됨

---

## 개요

GitHub에서 Claude Code 관련 플러그인, Skills, MCP 서버를 매주 자동으로 크롤링하여 블로그에 포스팅하는 자동화 스크립트를 신규 생성한다. 동시에 기존 AI 데일리 스크립트의 프롬프트를 업그레이드하여 더 깊이 있는 요약과 개발자 관점 코멘트를 제공한다.

---

## 작업 범위

### 1. `scripts/claude-ecosystem-weekly.js` — 신규 생성
### 2. `scripts/daily-digest.js` — 프롬프트 업그레이드

---

## 1. claude-ecosystem-weekly.js 설계

### 아키텍처

```
데이터 수집 (병렬)
  ├── GitHub API 검색 (카테고리별 4개 쿼리)
  ├── awesome-mcp-servers README 파싱 (punkpeye/awesome-mcp-servers)
  ├── awesome-claude-code README 파싱 (hesreallyhim/awesome-claude-code 등)
  └── Anthropic 공식 org 신규 레포 추적 (anthropics, modelcontextprotocol)

     ↓

중복 제거 (scripts/claude-ecosystem-state.json 참조 및 업데이트)

     ↓

Claude/Codex로 카테고리별 요약 생성

     ↓

Jekyll 포스트 생성 (_posts/YYYY-MM-DD-claude-ecosystem.md)

     ↓

Naver + Tistory 발행 (기존 publisher 재사용)
```

### 카테고리 및 검색 쿼리

| 카테고리 | GitHub 검색 키워드 |
|---------|------------------|
| MCP 서버 | `topic:mcp-server`, `mcp-server claude`, `model-context-protocol` |
| Skills / Slash Commands | `topic:claude-code-skills`, `claude-code slash-command`, `claude code skill` |
| Plugins / Extensions | `topic:claude-code`, `claude-code plugin extension`, `claude code tool` |
| Claude Code 활용 프로젝트 | `built-with-claude-code`, `claude-code automation`, `claude code agent` |

- 카테고리별 최대 10개, star 순 정렬
- `claude-ecosystem-state.json`에 기록된 레포는 제외 (중복 방지)

### 포스트 형식

**파일명:** `_posts/YYYY-MM-DD-claude-ecosystem.md`

```markdown
---
title: "[Claude 생태계] YYYY-MM-DD — 이번 주 MCP·Skills·플러그인 큐레이션"
date: YYYY-MM-DD 08:00:00 +0900
categories: [AI소식]
tags: [claude-code, mcp, plugin, skills, anthropic]
---

## 이번 주 Claude 생태계 하이라이트

### MCP 서버

**레포명** — ⭐ 1.2k
한 줄 태그라인

기능 요약:
- 무엇을 하는 도구인지
- 주요 기능 3~4가지
- 지원 환경/언어/연동 서비스

개발자 코멘트:
왜 이 도구가 주목할 만한지, 어떤 워크플로우에 유용한지,
실제로 어떻게 활용할 수 있는지 개발자 관점에서 설명.
시니어가 주니어에게 설명해주듯, 기술 용어는 그대로 쓰되
왜 중요한지, 어떤 상황에 쓰면 좋은지를 같이 짚어줌.

> 📎 [GitHub 링크]

(반복...)

### Skills / Slash Commands
...

### Plugins / Extensions
...

### Claude Code 활용 프로젝트
...
```

### 페르소나

> 5년차 이상 시니어 풀스택 개발자가 주니어 팀원에게 설명해주듯 작성한다.
> 기술 용어는 그대로 쓰되 왜 중요한지, 어떤 상황에서 쓰면 좋은지를 같이 설명한다.
> 과한 친절함이나 설교 없이, 실무에서 바로 써먹을 수 있는 정보 위주로 작성한다.
> 이모지 사용 금지. 영어 레포도 한국어로 설명한다.

### 발행 플로우

1. Jekyll 포스트 생성 → git commit & push (GitHub Pages 자동 배포)
2. `naver-publisher.js` → 카테고리: AI소식
3. `tistory-publisher.js` → 카테고리: AI소식
4. 에러 시 재시도 2회 (기존 `PUBLISH_RETRY_COUNT` 재사용)

### 크론탭

```
0 8 * * 1   # 매주 월요일 오전 8시
```

### 상태 파일: `scripts/claude-ecosystem-state.json`

```json
{
  "lastRun": "2026-03-10T08:00:00+09:00",
  "seenRepos": ["owner/repo-name", ...]
}
```

---

## 2. daily-digest.js 프롬프트 업그레이드

### 변경 내용

기존의 2~3줄 짧은 코멘트 방식을 아래 형식으로 확장한다.

**현재 형식:**
```
제목
2~3줄 코멘트
📎 원문 링크
```

**변경 후 형식:**
```
제목 (GitHub인 경우 ⭐ star수 표기)

기능/내용 요약 (5줄):
- 무엇에 관한 소식인지
- 핵심 기능/변경사항 2~3가지
- 관련 기술 스택 또는 배경

개발자 코멘트 (5줄):
왜 주목해야 하는지, 실무에 어떤 영향을 줄 수 있는지
시니어 개발자 관점에서 주니어도 이해할 수 있게 설명.

📎 원문 링크
```

### 페르소나 (동일)

> 5년차 이상 시니어 풀스택 개발자가 주니어 팀원에게 설명해주듯 작성한다.
> 기술 용어는 그대로 쓰되 왜 중요한지, 어떤 상황에서 쓰면 좋은지를 같이 설명한다.
> 과한 친절함이나 설교 없이, 실무에서 바로 써먹을 수 있는 정보 위주로 작성한다.
> 이모지 사용 금지 (링크 앞 📎 제외).

---

## 파일 목록

| 파일 | 작업 |
|------|------|
| `scripts/claude-ecosystem-weekly.js` | 신규 생성 |
| `scripts/claude-ecosystem-state.json` | 신규 생성 (초기 빈 상태) |
| `scripts/daily-digest.js` | 프롬프트 섹션 수정 |
