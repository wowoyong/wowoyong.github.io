---
title: "[테크 인사이드] 2026-03-18 — 이번 주 엔지니어링 블로그"
date: 2026-03-18 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 11개 글 요약

### [Airbnb] From vendors to vanguard: Airbnb’s hard-won lessons in observability ownership

Airbnb는 observability를 외부 vendor에 많이 의존하면서, 서비스 특성에 맞는 운영 기준과 ownership이 약해지는 문제를 겪은 것으로 보인다. 이 글은 observability를 단순 도구 도입이 아니라 내부 플랫폼, 책임 체계, 팀 주도 운영 방식으로 전환해 해결한 과정을 다룬다. 그 결과 장애 대응력과 시스템 이해도가 높아지고, observability가 비용성 도구가 아니라 핵심 engineering 역량으로 자리잡았다는 교훈을 전한다.

> 📎 원문: [From vendors to vanguard: Airbnb’s hard-won lessons in observability ownership](https://medium.com/airbnb-engineering/from-vendors-to-vanguard-airbnbs-hard-won-lessons-in-observability-ownership-3811bf6c1ac3?source=rss----53c7c27702d5---4)

### [Airbnb] Recommending Travel Destinations to Help Users Explore

Airbnb는 사용자가 갈 곳을 정하지 못한 상태에서 검색을 시작하면 탐색 범위가 넓어져, 원하는 여행지를 찾기 어렵다는 문제가 있었습니다. 이를 해결하기 위해 사용자의 선호와 탐색 맥락을 바탕으로 travel destination을 추천하는 추천 시스템을 도입해, 검색 시작점을 더 쉽게 잡도록 만들었을 가능성이 큽니다. 그 결과 사용자는 더 빠르게 관심 지역을 발견하고, Airbnb는 탐색 경험과 예약 전환율을 함께 개선했을 것으로 보입니다.

> 📎 원문: [Recommending Travel Destinations to Help Users Explore](https://medium.com/airbnb-engineering/recommending-travel-destinations-to-help-users-explore-5fa7a81654fb?source=rss----53c7c27702d5---4)

### [Cloudflare] Standing up for the open Internet: why we appealed Italy’s "Piracy Shield" fine

Cloudflare는 Italy의 Piracy Shield가 사법 심사와 이의제기 절차 없이 private 기업이 30분 안에 사이트와 IP를 차단하게 만들어, 과도한 차단과 Internet 인프라 훼손 문제를 일으킨다고 봤습니다. 그래서 등록과 벌금 부과에 맞서 법적으로 항소했고, 이 제도가 소수 권리자의 이익을 위해 open Internet의 기본 원칙을 침해한다는 점을 공개적으로 문제 삼았습니다. 결과적으로 이 싸움은 단순한 벌금 문제가 아니라, Internet 차단 권한의 투명성·책임성·적법절차를 지키려는 분쟁이라는 점을 강조했습니다.

> 📎 원문: [Standing up for the open Internet: why we appealed Italy’s "Piracy Shield" fine](https://blog.cloudflare.com/standing-up-for-the-open-internet/)

### [Cloudflare] From legacy architecture to Cloudflare One

기존 VPN 중심 구조에서 1,000개 이상 legacy application을 한 번에 옮기는 방식은 설정 오류나 의존성 누락 때문에 서비스 중단을 일으키는 큰 문제가 있었습니다. Cloudflare와 CDW는 application을 복잡도별로 나누어 순차적으로 이전하고, Cloudflare Access로 legacy app을 감싸서 사용자 요청마다 identity와 device posture를 검증하는 Zero Trust 방식으로 해결했습니다. 그 결과 big bang migration 위험을 줄이고, 다운타임 없이 더 안전하고 유연한 SASE 기반 아키텍처로 전환할 수 있게 했습니다.

> 📎 원문: [From legacy architecture to Cloudflare One](https://blog.cloudflare.com/legacy-to-agile-sase/)

### [GitHub] Investing in the people shaping open source and securing the future together

GitHub는 open source를 지탱하는 maintainers와 보안 생태계에 대한 지원이 부족하다는 문제를 짚고, 사람과 커뮤니티에 대한 투자와 협업 강화를 해결책으로 제시한다. 이를 통해 open source의 지속 가능성을 높이고, 더 안전한 소프트웨어 공급망과 장기적인 ecosystem 안정성을 함께 만들겠다는 내용이다.

> 📎 원문: [Investing in the people shaping open source and securing the future together](https://github.blog/security/supply-chain-security/investing-in-the-people-shaping-open-source-and-securing-the-future-together/)

### [GitHub] GitHub for Beginners: Getting started with GitHub Actions

반복적인 build, test, deploy 작업을 수동으로 처리하는 문제가 있었고, GitHub는 이를 GitHub Actions로 자동화하는 방법을 설명합니다. `workflow`를 YAML로 정의하고 `event`, `job`, `runner`, `action` 같은 핵심 개념을 연결해 CI/CD 파이프라인을 구성하는 방식입니다. 그 결과 초보자도 GitHub 저장소 안에서 자동화 흐름을 만들고, 더 일관되고 빠르게 배포와 검증을 수행할 수 있습니다.

> 📎 원문: [GitHub for Beginners: Getting started with GitHub Actions](https://github.blog/developer-skills/github/github-for-beginners-getting-started-with-github-actions/)

### [우아한형제들] 흩어져 있는 AI 자산, &#8216;MCP stdio&#8217;로 헤쳐모여!

여러 저장소와 도구에 흩어진 프롬프트·스킬 같은 AI assets 때문에 최신 버전 관리와 일관된 활용이 어려운 문제가 있었다. 이를 해결하기 위해 우아한형제들은 로컬에 파일을 복제하는 Agent Sync 대신, 중앙 패키지를 stdio 기반 MCP 서버로 연결해 IDE/CLI에서 바로 최신 자산을 쓰는 MCP stdio 방식을 선택했다. 그 결과 자산을 중앙에서 통제하면서도 여러 환경에 일관되게 배포할 수 있었고, 프롬프트를 넘어 tool 호출과 외부 연동까지 확장하기 쉬운 구조를 만들었다.

> 📎 원문: [흩어져 있는 AI 자산, &#8216;MCP stdio&#8217;로 헤쳐모여!](https://techblog.woowahan.com/25986/)

### [우아한형제들] AI로 바뀐 건 업무가 아니라 사람이었습니다

반복 업무에 시간을 많이 쓰지만 AI를 어디서부터 써야 할지 모르는 동료들이 많다는 문제가 있었습니다. 우아한형제들은 참가자가 자신의 실제 업무를 잘게 나누고, 작은 목표부터 직접 AI로 해결해보는 교육 방식을 운영해 이 문제를 풀었습니다. 그 결과 회의록 정리, 파일명 변경, 정책 확인 같은 작업 시간이 크게 줄었고, 업무 방식보다 사람이 스스로 문제를 해결하는 방식이 바뀌었습니다.

> 📎 원문: [AI로 바뀐 건 업무가 아니라 사람이었습니다](https://techblog.woowahan.com/26034/)

### [카카오] 수억 건의 보안 신호 속 진짜 위협 찾기 — AI로 보안 모니터링의 패러다임을 바꾸다

수억 건의 보안 신호에서 사람이 직접 진짜 위협을 가려내기 어려워, 중요한 공격을 놓치거나 대응이 늦어지는 문제가 있었다. 카카오는 AI를 보안 모니터링에 적용해 대량의 이벤트를 분석하고 우선순위를 정리하도록 바꿔, 실제 대응이 필요한 위협을 더 빠르게 식별하는 방향으로 해결했다. 그 결과 보안 관제의 효율과 정확도를 높이고, 기존의 수작업 중심 모니터링 방식을 개선했다.

> 📎 원문: [수억 건의 보안 신호 속 진짜 위협 찾기 — AI로 보안 모니터링의 패러다임을 바꾸다](https://tech.kakao.com/posts/817)

### [카카오] 학생에서 개발자로: 로또 구현부터 레거시 개선까지, 서버의 흐름을 배우다

학생 단계에서는 로또 구현 같은 작은 과제로 서버의 기본 흐름을 이해했지만, 실무에서는 복잡한 legacy code와 운영 환경 때문에 같은 방식이 통하지 않는 문제가 있었다. 글은 기능 구현 경험을 바탕으로 기존 시스템을 읽고, 구조를 개선하고, 협업 속에서 안정적으로 변경하는 방법을 익혀가는 과정을 설명한다. 그 결과 서버 개발은 단순히 코드를 짜는 일이 아니라, 전체 흐름을 이해하고 점진적으로 품질을 높이는 일이라는 점을 보여준다.

> 📎 원문: [학생에서 개발자로: 로또 구현부터 레거시 개선까지, 서버의 흐름을 배우다](https://tech.kakao.com/posts/816)

### [토스] Embracing the Software 3.0 Era

LLM은 강력하지만 코드베이스 접근, 명령 실행, 외부 시스템 연동이 안 돼서 실제 배포 작업에 바로 쓰기 어렵다는 문제가 있었다. 글은 이 한계를 `harness`로 풀었고, Claude Code의 `MCP`, `sub-agent`, `skills`, `slash command`를 각각 기존 Software 1.0의 layered architecture 관점으로 해석해 LLM을 실제로 일하는 agent로 연결했다. 그 결과 새로운 AI 개발 도구를 낯선 개념 묶음이 아니라 익숙한 설계 원칙으로 이해하고, 팀이 더 빠르게 실무에 적용할 수 있다고 설명한다.

> 📎 원문: [Embracing the Software 3.0 Era](https://toss.tech/article/harness-for-team-productivity-eng)
