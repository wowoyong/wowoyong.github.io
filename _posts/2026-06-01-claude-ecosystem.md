---
title: "[Claude 생태계] 2026-06-01 — 이번 주 MCP·Skills·플러그인 큐레이션"
date: 2026-06-01 08:00:00 +0900
categories: [AI소식]
tags: [claude-code, mcp, anthropic, plugin, skills, agent, tool]
---
## 이번 주 Claude 생태계 하이라이트

이번 주 흐름은 MCP 서버가 점점 더 “도구 연결”을 넘어 “에이전트 경제” 쪽으로 확장되고 있다는 점입니다.
World Cup 데이터처럼 특정 도메인 지식을 제공하는 MCP도 있고, skill marketplace나 x402 결제 기반 서비스 검색처럼 에이전트가 외부 능력을 찾고 구매하는 실험도 보입니다.
공식 프로젝트 쪽에서는 MCP Inspector, PHP SDK처럼 서버 개발과 검증을 돕는 기반 도구가 계속 중요해지고 있습니다.
Claude Code를 실무에 붙이려면 이제 단순 프롬프트보다 MCP 서버, SDK, 테스트 도구를 함께 보는 습관이 필요합니다.

## MCP 서버

### [zafronix/wc-mcp](https://github.com/zafronix/wc-mcp)

**기능 요약:**
- 1930년부터 모든 FIFA World Cup 데이터를 제공하는 MCP 서버입니다.
- 23개 대회의 스쿼드, 토너먼트 대진, 경기장 고도 정보를 다룹니다.
- 해트트릭 같은 세부 기록도 조회할 수 있습니다.
- Free tier API 기반으로 Claude, MCP client와 연동할 수 있습니다.

**개발자 코멘트:**
스포츠 데이터처럼 구조화된 도메인 지식을 MCP로 노출하는 좋은 예시입니다.
실무에서는 특정 산업 데이터를 AI assistant에 붙일 때 비슷한 패턴을 사용할 수 있습니다.
예를 들어 스포츠 미디어 CMS에서 Claude가 “1998 World Cup 준결승 맥락”을 바로 조회하게 만들 수 있습니다.
주니어가 놓치기 쉬운 점은 MCP가 꼭 개발 도구만 연결하는 프로토콜은 아니라는 점입니다.
도입할 때는 API rate limit, 데이터 출처, 캐싱 전략을 먼저 확인하는 게 좋습니다.

---

### [garasegae/aiskillstore](https://github.com/garasegae/aiskillstore)

**기능 요약:**
- AI agent가 skill을 발견하고 구매하고 통합할 수 있게 하는 MCP 기반 marketplace입니다.
- Claude, hGPT, Gemini 등 7개 이상 플랫폼을 지원합니다.
- Agent-first 방식으로 skill discovery와 integration 흐름을 제공합니다.
- MCP protocol을 통해 외부 skill을 에이전트 워크플로우에 연결합니다.

**개발자 코멘트:**
에이전트가 필요한 기능을 직접 찾고 붙이는 방향을 보여주는 프로젝트입니다.
실무에서는 사내 업무 자동화 agent가 특정 기능을 필요할 때 동적으로 확장하는 구조에 참고할 수 있습니다.
예를 들어 문서 요약 agent가 결재 문서 검토 skill을 찾아 붙이는 식의 워크플로우를 생각해볼 수 있습니다.
주니어는 marketplace라는 단어보다 권한, 비용, 신뢰성 검증이 더 중요하다는 점을 봐야 합니다.
실제 도입 전에는 skill 실행 권한과 데이터 접근 범위를 반드시 분리해야 합니다.

---

### [cinderwright-ai/cinderwright-api](https://github.com/cinderwright-ai/cinderwright-api)

**기능 요약:**
- x402 Discovery Hub를 제공하는 MCP 서버입니다.
- 1450개 이상 서비스를 인덱싱한 agent economy용 검색 엔진입니다.
- Base 네트워크에서 USDC로 x402 결제를 지원합니다.
- MCP를 통해 유료 API와 agent 서비스를 검색하고 사용할 수 있게 합니다.

**개발자 코멘트:**
MCP가 API 호출을 넘어 결제 가능한 서비스 탐색 레이어로 확장되는 흐름을 보여줍니다.
실무에서는 외부 데이터 API나 자동화 서비스를 agent가 필요할 때 찾아 쓰는 구조에 연결될 수 있습니다.
예를 들어 리서치 agent가 유료 데이터 소스를 검색하고 소액 결제 후 결과를 받아오는 구성이 가능합니다.
주니어가 놓치기 쉬운 점은 결제가 붙는 순간 observability와 승인 플로우가 필수라는 점입니다.
팀에 도입할 때는 자동 결제 한도, 감사 로그, 실패 시 fallback 정책을 먼저 설계해야 합니다.

---

## Claude Code 활용 프로젝트

### [modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector) — 9942 stars

**기능 요약:**
- MCP 서버를 시각적으로 테스트할 수 있는 공식 도구입니다.
- MCP 서버 연결 상태와 tool 호출 결과를 확인할 수 있습니다.
- 개발 중인 MCP 서버의 request, response 흐름을 디버깅하는 데 유용합니다.
- TypeScript 기반이며 MCP 서버 개발 워크플로우와 잘 맞습니다.

**개발자 코멘트:**
MCP 서버를 만들 때 가장 먼저 익숙해져야 할 검증 도구에 가깝습니다.
실무에서는 Claude Code에 붙이기 전에 MCP 서버가 기대한 스키마와 응답을 내는지 확인할 때 씁니다.
예를 들어 사내 Jira MCP 서버를 만든 뒤 Inspector로 ticket 검색 tool이 정상 동작하는지 검증할 수 있습니다.
주니어는 Claude에서 안 된다고 바로 프롬프트를 고치기보다 서버 응답부터 분리해서 봐야 합니다.
도입할 때는 로컬 개발 환경에서 Inspector를 기본 디버깅 루틴에 포함시키는 게 좋습니다.

---

### [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) — 7902 stars

**기능 요약:**
- 법률 업무용 Claude plugin suite입니다.
- legal workflow에 맞춘 도구와 자동화 흐름을 제공합니다.
- 문서 검토, 법률 리서치, 업무 보조 같은 시나리오에 사용할 수 있습니다.
- Python 기반으로 구성된 공식 프로젝트입니다.

**개발자 코멘트:**
Claude 생태계가 범용 코딩 도구에서 산업별 workflow로 확장되는 흐름을 보여줍니다.
실무에서는 법무, 컴플라이언스, 계약 검토처럼 도메인 리스크가 큰 업무에 AI를 붙일 때 참고할 수 있습니다.
예를 들어 계약서 초안을 Claude가 검토하고 누락 조항 후보를 정리하는 workflow를 만들 수 있습니다.
주니어는 “법률 AI”를 단순 텍스트 요약으로 보면 안 되고 책임 경계와 human review를 같이 봐야 합니다.
도입 시에는 결과를 자동 확정하지 말고 검토자 승인과 변경 이력을 남기는 구조가 필요합니다.

---

### [modelcontextprotocol/php-sdk](https://github.com/modelcontextprotocol/php-sdk) — 1523 stars

**기능 요약:**
- MCP server와 client를 만들기 위한 공식 PHP SDK입니다.
- The PHP Foundation과 협업해 관리되는 프로젝트입니다.
- PHP 환경에서 MCP protocol 구현 부담을 줄여줍니다.
- 기존 PHP 백엔드와 Claude, MCP client를 연결할 때 사용할 수 있습니다.

**개발자 코멘트:**
MCP가 JavaScript나 Python 중심을 넘어 기존 웹 백엔드 생태계로 들어오고 있다는 신호입니다.
실무에서는 Laravel, Symfony, WordPress 기반 시스템에 Claude 연동을 붙일 때 특히 의미가 있습니다.
예를 들어 Laravel admin의 주문 조회 기능을 MCP server로 노출해 Claude Code에서 운영 질의를 처리하게 만들 수 있습니다.
주니어는 SDK가 있다고 바로 비즈니스 로직을 모두 tool로 열면 안 된다는 점을 기억해야 합니다.
도입할 때는 인증, 권한 체크, 입력 검증을 기존 API와 같은 수준으로 적용해야 합니다.