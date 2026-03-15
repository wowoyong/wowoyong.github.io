---
title: "[Claude 생태계] 2026-03-16 — 이번 주 MCP·Skills·플러그인 큐레이션"
date: 2026-03-16 08:00:00 +0900
categories: [AI소식]
tags: [claude-code, mcp, anthropic, skills, agent, tool]
---
## 이번 주 Claude 생태계 하이라이트

이번 주 흐름은 한마디로 정리하면 "도구를 더 잘 찾고, 연결하고, 운영하는 방향"입니다.  
MCP 서버 쪽에서는 단일 기능 서버보다 레지스트리, 카탈로그, 에이전트 탐색, 지식 그래프처럼 워크플로우 전체를 받쳐주는 인프라형 도구가 많이 보입니다.  
Claude Code 활용 프로젝트에서는 Anthropic 공식 저장소가 여전히 강한 기준점을 만들고 있습니다.  
주니어 개발자 관점에서는 "모델 성능"보다 "컨텍스트를 어떻게 쌓고, 어떤 도구를 안전하게 붙이고, 반복 가능한 작업 흐름으로 바꾸는가"가 더 중요한 주제입니다.

## MCP 서버

### [arikusi/deepseek-mcp-server](https://github.com/arikusi/deepseek-mcp-server)

**기능 요약:**
- DeepSeek AI를 MCP 서버 형태로 연결해 채팅과 추론 기능을 제공하는 도구입니다.
- multi-turn session, function calling, thinking mode, cost tracking을 지원합니다.
- DeepSeek AI 연동 중심이며 Apple, Windows, Linux 환경 사용을 전제로 소개됩니다.

**개발자 코멘트:**
DeepSeek를 Claude Code 워크플로우 안에서 실험해볼 수 있다는 점이 눈에 띕니다.  
여러 모델을 비교하거나 특정 작업만 별도 모델에 위임하는 실무 흐름에서 유용합니다.  
예를 들면 코드 생성은 Claude로 하고, 긴 reasoning 실험은 DeepSeek MCP로 분리해 비용과 결과를 비교할 수 있습니다.  
주니어가 놓치기 쉬운 포인트는 모델을 붙이는 것보다 session 관리와 비용 추적이 더 중요하다는 점입니다.  
실무 도입 시에는 function calling 결과의 일관성과 thinking mode 사용 시 응답 시간 증가를 같이 확인해야 합니다.

### [duaraghav8/MCPJungle](https://github.com/duaraghav8/MCPJungle)

**기능 요약:**
- 엔터프라이즈 AI 에이전트를 위한 self-hosted MCP Server registry입니다.
- MCP 서버를 조직 내부에서 등록하고 관리하는 용도로 보입니다.
- self-hosted 운영을 전제로 하며 기업 환경 배포에 초점이 있습니다.

**개발자 코멘트:**
MCP가 늘어날수록 "무슨 서버를 어디서 관리할 것인가"가 바로 운영 이슈가 됩니다.  
여러 팀이 같은 에이전트 인프라를 쓰는 조직에서는 공용 레지스트리가 특히 중요합니다.  
예를 들면 사내 문서 검색 MCP, 배포 MCP, 이슈 트래커 MCP를 한 곳에 등록해 표준 진입점을 만들 수 있습니다.  
주니어는 새 MCP를 만드는 일보다 이미 있는 MCP를 안전하게 검색하고 재사용하는 일이 더 자주 생긴다는 점을 기억하면 좋습니다.  
실무에서는 인증 방식, 버전 정책, 폐기된 서버 처리 기준을 먼저 정해두는 편이 낫습니다.

### [edgarriba/prolink](https://github.com/edgarriba/prolink)

**기능 요약:**
- AI agent 간 discovery, negotiation, transaction을 지원하는 MCP-native middleware입니다.
- agent-to-agent marketplace 성격의 연결 계층을 제공합니다.
- Python 기반으로 보이며 클라우드와 self-hosted 환경을 함께 겨냥합니다.

**개발자 코멘트:**
이 프로젝트는 MCP를 단순 툴 호출이 아니라 에이전트 간 거래와 협업 계층으로 확장해서 보여줍니다.  
단일 에이전트로 끝나지 않고 역할이 다른 에이전트를 연결하려는 실무 흐름과 맞닿아 있습니다.  
예를 들면 요구사항 분석 에이전트가 구현 에이전트를 찾고, 다시 테스트 에이전트와 연결하는 흐름을 설계할 수 있습니다.  
주니어가 놓치기 쉬운 포인트는 에이전트 수가 늘수록 프롬프트보다 프로토콜과 책임 경계가 더 중요해진다는 점입니다.  
실무 도입 시에는 negotiation 규칙, 실패 처리, 비용 분배 같은 운영 정책이 먼저 필요합니다.

### [entire-vc/evc-spark-mcp](https://github.com/entire-vc/evc-spark-mcp)

**기능 요약:**
- 4500개 이상의 자산에서 AI agents, skills, prompts, bundles, MCP connectors를 검색하는 카탈로그 서버입니다.
- discovery 중심의 MCP 서버로 큐레이션된 자산 탐색을 지원합니다.
- 클라우드와 self-hosted 환경을 지원하는 형태로 소개됩니다.

**개발자 코멘트:**
MCP 생태계가 커질수록 좋은 도구를 직접 찾는 비용이 빠르게 커지는데, 이 서버는 그 문제를 정면으로 다룹니다.  
새 기능을 직접 만들기 전에 이미 존재하는 agent나 prompt를 찾는 실무 흐름에서 가치가 있습니다.  
예를 들면 사내 실험용 에이전트를 만들기 전에 유사한 connector와 skill 조합을 먼저 검색해 초기 시간을 줄일 수 있습니다.  
주니어는 "직접 구현"이 항상 빠른 길이 아니라는 점을 자주 놓칩니다.  
실무에서는 카탈로그 품질과 업데이트 주기를 확인하고, 검색 결과를 그대로 신뢰하지 말고 검증 단계를 두는 것이 좋습니다.

### [glenngillen/mcpmcp-server](https://github.com/glenngillen/mcpmcp-server)

**기능 요약:**
- 사용할 수 있는 MCP 서버 목록을 클라이언트에서 질의할 수 있게 해주는 목록형 서버입니다.
- 일상 워크플로우 개선을 위한 MCP 검색 진입점 역할을 합니다.
- 클라우드 기반 사용을 중심으로 Apple, Windows, Linux 환경을 겨냥합니다.

**개발자 코멘트:**
이 프로젝트는 화려한 기능보다 "어떤 MCP를 쓸 수 있는지 먼저 보여주는 일"에 집중합니다.  
툴이 늘어난 환경에서는 실행보다 발견이 먼저 병목이 되기 때문에 실무적으로 의미가 있습니다.  
예를 들면 온보딩 중인 개발자가 현재 팀 환경에서 허용된 MCP 서버를 바로 확인하는 용도로 쓸 수 있습니다.  
주니어는 새로운 서버를 추가하는 순간 문서화와 검색성도 같이 관리해야 한다는 점을 놓치기 쉽습니다.  
실무에서는 목록 정확도와 접근 권한 범위를 항상 같이 관리해야 혼선을 줄일 수 있습니다.

### [carlosahumada89/govrider-mcp-server](https://github.com/carlosahumada89/govrider-mcp-server)

**기능 요약:**
- 정부 입찰, RFP, grant, framework 데이터와 기술 제품 또는 컨설팅 서비스를 매칭하는 MCP 서버입니다.
- 25개 이상의 공식 소스에서 live tender 정보를 다루는 것이 핵심입니다.
- 클라우드 환경 중심의 데이터 매칭 서비스로 소개됩니다.

**개발자 코멘트:**
일반 개발 도구가 아니라 비즈니스 기회 탐색까지 MCP로 확장된 사례라는 점에서 흥미롭습니다.  
개발 조직이 기술 검토뿐 아니라 사업 개발 자동화까지 다루는 환경에서 바로 실무 가치가 생깁니다.  
예를 들면 공공 입찰 조건을 읽고 우리 제품 스택과 맞는 기회를 선별하는 보조 에이전트를 만들 수 있습니다.  
주니어는 이런 도구가 "검색"이 아니라 "의사결정 보조"에 더 가깝다는 점을 이해하면 좋습니다.  
실무에서는 데이터 최신성, 국가별 조달 규정 차이, 잘못된 매칭에 대한 검수 절차를 반드시 두어야 합니다.

### [gzoonet/cortex](https://github.com/gzoonet/cortex)

**기능 요약:**
- 프로젝트 파일을 감시하고 LLM으로 엔티티와 관계를 추출해 knowledge graph를 만드는 local-first 도구입니다.
- 웹 대시보드와 CLI를 제공하며 get_status, list_projects, find_entity, query_cortex 같은 MCP 도구를 지원합니다.
- 로컬 환경 중심의 개발자용 knowledge graph 시스템입니다.

**개발자 코멘트:**
코드베이스를 단순 텍스트 검색이 아니라 구조화된 그래프로 다룬다는 점이 실무적으로 매우 중요합니다.  
규모가 큰 저장소에서 함수, 모듈, 도메인 관계를 빠르게 파악해야 하는 상황에 잘 맞습니다.  
예를 들면 신규 입사자가 특정 결제 로직과 연관된 엔티티를 graph query로 한 번에 추적할 수 있습니다.  
주니어는 LLM이 답을 잘하는 것보다 소스 구조를 어떻게 축적해두느냐가 훨씬 큰 생산성 차이를 만든다는 점을 기억하면 좋습니다.  
실무에서는 파일 watcher 범위, 인덱싱 비용, 민감한 코드가 외부 LLM으로 나가는지 여부를 먼저 점검해야 합니다.

### [hamflx/imagen3-mcp](https://github.com/hamflx/imagen3-mcp)

**기능 요약:**
- Google's Imagen 3.0 API를 MCP로 연결해 이미지 생성 기능을 제공하는 도구입니다.
- photography, artistic, photorealistic 제어를 포함한 고품질 이미지 생성이 핵심입니다.
- 로컬 실행과 Apple, Windows, Linux 환경 사용을 전제로 하며 Google Imagen API를 연동합니다.

**개발자 코멘트:**
텍스트 중심의 Claude Code 생태계에 시각 생성 워크플로우를 붙일 수 있다는 점이 포인트입니다.  
프론트엔드 시안, 마케팅 에셋, 문서용 이미지 초안이 필요한 실무에서 바로 연결할 수 있습니다.  
예를 들면 랜딩 페이지 초안을 만든 뒤 같은 세션에서 hero image를 생성하도록 MCP 툴 체인을 구성할 수 있습니다.  
주니어는 이미지 생성도 결국 API 비용, 저작권, 프롬프트 재현성 관리가 필요한 개발 작업이라는 점을 놓치기 쉽습니다.  
실무에서는 생성물 사용 정책과 브랜드 가이드 일치 여부를 별도로 검수해야 합니다.

### [hashgraph-online/hashnet-mcp-js](https://github.com/hashgraph-online/hashnet-mcp-js)

**기능 요약:**
- Hashgraph network 상에서 AI agent를 discover, register, chat 할 수 있게 하는 MCP 서버입니다.
- Registry Broker 역할을 통해 에이전트 등록과 탐색을 지원합니다.
- JavaScript 기반으로 보이며 클라우드 중심 사용과 다중 OS 환경을 겨냥합니다.

**개발자 코멘트:**
에이전트 등록과 탐색을 네트워크 레벨에서 다루려는 시도라는 점에서 생태계 확장성이 큽니다.  
분산된 에이전트 환경이나 외부 파트너 에이전트와 연결하려는 상황에서 의미가 있습니다.  
예를 들면 특정 분석 에이전트를 네트워크에 등록해 다른 팀이나 서비스가 찾아 쓰게 만드는 구조를 실험할 수 있습니다.  
주니어는 에이전트 품질보다 먼저 신원 확인과 신뢰 모델이 필요하다는 점을 자주 간과합니다.  
실무에서는 등록된 에이전트의 진위, 권한 범위, 네트워크 장애 시 대체 경로를 반드시 설계해야 합니다.

### [isaac-levine/forage](https://github.com/isaac-levine/forage)

**기능 요약:**
- AI agent를 위한 self-improving tool discovery 시스템입니다.
- registry를 검색하고 MCP 서버를 subprocess로 설치하며 세션 간 tool knowledge를 유지합니다.
- 로컬 환경 중심이며 Apple, Windows, Linux에서 동작하는 형태로 소개됩니다.

**개발자 코멘트:**
이 프로젝트는 도구를 한 번 찾고 끝내는 것이 아니라 에이전트가 점점 더 잘 찾게 만든다는 점이 핵심입니다.  
반복 작업이 많은 개발 환경에서 tool discovery 비용을 줄이는 데 직접 도움이 됩니다.  
예를 들면 처음에는 수동으로 선택하던 MCP를 이후에는 이전 사용 기록과 지식을 바탕으로 자동 추천하게 만들 수 있습니다.  
주니어는 설치 자동화가 편해 보여도 subprocess 실행은 보안과 안정성 이슈를 바로 동반한다는 점을 기억해야 합니다.  
실무에서는 설치 가능한 서버의 allowlist를 두고, 세션 간 저장되는 tool knowledge의 품질도 주기적으로 정리하는 편이 좋습니다.

## Claude Code 활용 프로젝트

### [anthropics/original_performance_takehome](https://github.com/anthropics/original_performance_takehome) — ⭐ 3623

**기능 요약:**
- Anthropic의 original performance take-home 과제를 공개한 저장소입니다.
- 실제 성능 평가 스타일의 문제를 직접 풀어보는 용도로 활용할 수 있습니다.
- Python 기반 프로젝트입니다.

**개발자 코멘트:**
Claude Code를 잘 쓰려면 도구 사용법보다 문제 해결 기준을 먼저 보는 것이 도움이 되는데, 이 저장소가 그 역할을 합니다.  
채용 과제처럼 보이지만 실제로는 에이전트가 어느 수준까지 작업을 밀어붙일 수 있는지 감을 잡는 데 유용합니다.  
예를 들면 주니어가 Claude Code와 함께 과제를 풀면서 어디까지 자동화되고 어디서 사람이 개입해야 하는지 학습할 수 있습니다.  
주니어는 정답만 보려 하기 쉬운데, 더 중요한 것은 문제 분해와 검증 루프를 어떻게 설계하는지입니다.  
실무에서는 이 저장소를 팀 스터디 과제로 써도 좋지만, 풀이보다 평가 기준과 실패 원인을 같이 리뷰하는 편이 훨씬 효과적입니다.

### [anthropics/claudes-c-compiler](https://github.com/anthropics/claudes-c-compiler) — ⭐ 2529

**기능 요약:**
- Claude Opus 4.6이 작성한 dependency-free C compiler를 담은 저장소입니다.
- x86, ARM, RISC-V 백엔드를 지원하며 booting Linux kernel 컴파일이 가능하다고 소개됩니다.
- Rust 기반 컴파일러 프로젝트입니다.

**개발자 코멘트:**
이 프로젝트는 "LLM이 어디까지 복잡한 시스템 소프트웨어를 만들 수 있는가"에 대한 강한 사례입니다.  
실무에서는 그대로 복제하기보다, 복잡한 구현도 적절한 제약과 검증 아래에서는 충분히 분할 생성할 수 있다는 힌트로 보는 편이 맞습니다.  
예를 들면 사내 DSL parser나 코드 생성기처럼 좁지만 복잡한 영역에서 Claude Code 활용 가능성을 점검할 수 있습니다.  
주니어는 결과물의 화제성에만 집중하기 쉬운데, 더 중요한 것은 테스트와 타깃 아키텍처별 검증 체계입니다.  
실무 도입 시에는 "모델이 만들었다"보다 "누가 어떤 기준으로 검토했는가"를 더 엄격하게 봐야 합니다.

### [anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript) — ⭐ 1717

**기능 요약:**
- Anthropic API를 TypeScript에서 사용할 수 있게 해주는 공식 SDK입니다.
- safety-first language model API 접근을 위한 기본 진입점 역할을 합니다.
- TypeScript 환경에서 Anthropic API 연동에 사용됩니다.

**개발자 코멘트:**
Claude 생태계를 실제 제품에 붙일 때 가장 기본이 되는 저장소라서 계속 체크할 가치가 있습니다.  
Claude Code 실험을 웹 서비스, 백엔드 배치, 사내 도구로 옮기는 순간 SDK 이해도가 바로 생산성 차이로 이어집니다.  
예를 들면 Next.js 백엔드에서 prompt 실행, tool use, 응답 스트리밍을 안정적으로 붙이는 출발점으로 삼을 수 있습니다.  
주니어는 SDK를 단순 래퍼로 보기 쉬운데, 버전 변경에 따라 메시지 포맷과 에러 처리 방식이 달라질 수 있다는 점을 봐야 합니다.  
실무에서는 샘플 코드만 따라가지 말고 재시도 전략, rate limit 대응, 로깅 구조를 초기에 같이 설계하는 것이 좋습니다.

### [0xranx/OpenContext](https://github.com/0xranx/OpenContext) — ⭐ 422

**기능 요약:**
- AI agents와 assistants를 위한 personal context store입니다.
- Codex, Claude, OpenCode 같은 coding agent CLI와 함께 프로젝트 지식을 캡처, 검색, 재사용할 수 있습니다.
- JavaScript 기반이며 desktop GUI와 built-in Skills/tools, MCP 연동을 제공합니다.

**개발자 코멘트:**
컨텍스트를 매번 다시 설명하는 비용이 큰 팀이라면 이런 도구의 가치가 빠르게 체감됩니다.  
여러 저장소와 여러 에이전트를 넘나드는 실무에서는 코드 생성 능력보다 컨텍스트 재사용 능력이 더 중요해질 때가 많습니다.  
예를 들면 장애 대응 중 발견한 원인, 배포 메모, 서비스 구조 메모를 저장해 다음 세션의 Claude Code가 바로 이어받게 만들 수 있습니다.  
주니어는 프롬프트를 잘 쓰는 것에 집중하지만, 실제로는 좋은 컨텍스트 저장소가 더 큰 생산성 레버가 됩니다.  
실무에서는 오래된 컨텍스트가 오답의 근원이 되기 쉬우니, 저장만 하지 말고 만료 규칙과 검수 기준을 같이 운영해야 합니다.