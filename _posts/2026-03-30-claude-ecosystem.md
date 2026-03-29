---
title: "[Claude 생태계] 2026-03-30 — 이번 주 MCP·Skills·플러그인 큐레이션"
date: 2026-03-30 08:00:00 +0900
categories: [AI소식]
tags: [claude-code, mcp, anthropic, skills, automation, agent]
---
## 이번 주 Claude 생태계 하이라이트

이번 주 Claude Code 생태계는 두 축이 뚜렷합니다.
하나는 Skills를 중심으로 에이전트의 역할을 더 세분화하고, 반복 작업을 자동화하는 흐름입니다.
다른 하나는 Claude Code를 단일 보조 도구가 아니라, 여러 agent와 hook, SDK를 엮는 실행 플랫폼으로 확장하는 흐름입니다.
실무 관점에서는 "잘 쓰는 프롬프트"보다 "재사용 가능한 workflow를 어떻게 구조화할 것인가"가 더 중요한 주제가 되고 있습니다.

## Skills / Slash Commands

### [wanshuiyin/Auto-claude-code-research-in-sleep](https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep) — ⭐ 4651

**기능 요약:**
- Markdown 기반 skill만으로 자율적인 ML research workflow를 구성하는 도구입니다.
- cross-model review loop, idea discovery, experiment automation 같은 연구 자동화 흐름을 지원합니다.
- Claude Code, Codex, OpenClaw 등 여러 LLM agent 환경에서 lock-in 없이 사용할 수 있습니다.

**개발자 코멘트:**
이 레포가 주목할 만한 이유는 skill 자체를 아주 가볍게 유지하면서도 연구 자동화의 밀도를 높였기 때문입니다.
실무에서는 새로운 모델 실험 아이디어를 정리하거나, 논문 리뷰와 실험 계획 초안을 반복적으로 만드는 흐름에 잘 맞습니다.
예를 들어 팀이 새로운 ranking 모델을 검토할 때, 관련 논문 요약, 비교 포인트 정리, 다음 실험 가설 도출까지 하나의 skill 체인으로 만들 수 있습니다.
주니어가 놓치기 쉬운 포인트는 자동화 범위가 넓을수록 결과 품질보다 검증 루프 설계가 더 중요하다는 점입니다.
실무에 넣을 때는 실험 로그 형식, 산출물 저장 규칙, 사람 검토 지점을 먼저 정한 뒤 붙이는 편이 안전합니다.

### [trailofbits/skills](https://github.com/trailofbits/skills)

**기능 요약:**
- 보안 중심 코드 감사와 취약점 탐지를 위한 skill 모음입니다.
- CodeQL, Semgrep, variant analysis, differential code review, fix verification 흐름을 포함합니다.
- 보안 분석 workflow에 맞춰 재사용 가능한 audit skill 세트를 제공합니다.

**개발자 코멘트:**
이 레포가 중요한 이유는 Claude Code skill이 단순 생산성 도구를 넘어서 전문 보안 워크플로우까지 확장될 수 있음을 보여주기 때문입니다.
실무에서는 PR 리뷰, 취약점 재현, 패치 검증, 유사 패턴 탐색 같은 보안 점검 작업을 더 일관되게 만들 때 유용합니다.
예를 들어 인증 우회 취약점 하나를 찾은 뒤, 같은 패턴이 다른 서비스에도 있는지 codebase 전체를 variant analysis로 확장할 수 있습니다.
주니어가 자주 놓치는 부분은 보안 skill이 결과를 대신 판단해주는 것이 아니라, 조사 범위와 우선순위를 더 빨리 좁혀주는 도구라는 점입니다.
실무 도입 시에는 false positive 처리 기준과 최종 human review 책임 구간을 분명히 나눠야 합니다.

## Claude Code 활용 프로젝트

### [anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) — ⭐ 3043

**기능 요약:**
- Anthropic API를 Python에서 안정적으로 사용할 수 있게 해주는 공식 SDK입니다.
- Claude 호출, 메시지 처리, 애플리케이션 연동을 위한 기본 개발 인터페이스를 제공합니다.
- Python 환경에서 Claude 기반 서비스와 자동화 스크립트를 구현할 때 사용됩니다.

**개발자 코멘트:**
공식 SDK가 계속 관리되고 있다는 점은 Claude 기반 기능을 제품 코드에 붙일 때 가장 먼저 확인해야 할 신호입니다.
실무에서는 사내 도구, 챗봇, 문서 요약 파이프라인, 코드 분석 백엔드를 만들 때 SDK가 가장 직접적인 진입점이 됩니다.
예를 들어 운영팀 문의를 자동 분류하는 내부 API를 만들 때 Claude 호출부를 이 SDK로 감싸면 인증과 요청 구조를 표준화하기 쉽습니다.
주니어가 놓치기 쉬운 포인트는 SDK를 쓰는 것만으로 운영 품질이 확보되는 것은 아니라는 점입니다.
실무에서는 timeout, retry, rate limit, logging, prompt versioning까지 함께 설계해야 장애를 줄일 수 있습니다.

### [vibeeval/vibecosystem](https://github.com/vibeeval/vibecosystem) — ⭐ 316

**기능 요약:**
- Claude Code 위에 다수의 agent, skill, hook를 얹어 AI software team 구조를 구현한 프로젝트입니다.
- 134 agents, 246 skills, 53 hooks를 조합해 multi-agent swarm과 self-learning 흐름을 지향합니다.
- Claude Code 기반으로 cross-project training과 대규모 자동화 팀 구성을 시도합니다.

**개발자 코멘트:**
이 프로젝트가 흥미로운 이유는 Claude Code를 개인 보조 도구가 아니라 협업형 실행 레이어로 해석하고 있기 때문입니다.
실무에서는 하나의 agent에 모든 책임을 몰아주기보다, 역할별 agent를 분리해 설계, 구현, 검토를 나누는 방식에 참고가 됩니다.
예를 들어 feature 개발 agent, 테스트 agent, 리뷰 agent, 문서화 agent를 분리하면 작업 추적과 실패 원인 분석이 더 쉬워집니다.
주니어가 놓치기 쉬운 포인트는 agent 수가 많다고 생산성이 자동으로 오르지는 않는다는 점입니다.
실무 도입 시에는 agent 간 책임 경계, 산출물 포맷, 충돌 해결 규칙을 먼저 정하지 않으면 오히려 관리 비용이 커집니다.