---
title: "[테크 인사이드] 2026-04-01 — 이번 주 엔지니어링 블로그"
date: 2026-04-01 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 5개 글 요약

### [Cloudflare] Introducing Programmable Flow Protection: custom DDoS mitigation logic for Magic Transit customers

Cloudflare는 기존 DDoS 방어가 잘 알려진 UDP 프로토콜에는 강했지만, custom·proprietary UDP 프로토콜은 구조를 몰라 정상 트래픽과 공격 트래픽을 구분하기 어려운 문제가 있었습니다. 이를 해결하려고 Magic Transit 고객이 직접 eBPF 프로그램으로 패킷 판별 로직을 작성하면 Cloudflare 글로벌 네트워크에서 그 로직을 실행해 bad packet을 drop하거나 challenge할 수 있게 했습니다. 그 결과 custom UDP 서비스도 더 정교하고 stateful하게 보호할 수 있어, 단순 차단이나 rate limiting보다 정상 사용자의 피해를 줄이면서 대규모 DDoS 대응력을 높였습니다.

> 📎 원문: [Introducing Programmable Flow Protection: custom DDoS mitigation logic for Magic Transit customers](https://blog.cloudflare.com/programmable-flow-protection/)

### [Cloudflare] Cloudflare Client-Side Security: smarter detection, now open to everyone

Client-side skimming은 페이지를 망가뜨리지 않고도 악성 JavaScript 한 줄로 개인정보와 결제 정보를 훔칠 수 있는데, 기존에는 수많은 script 변경을 사람이 직접 추적하기 어려운 문제가 있었습니다. Cloudflare는 CSP 기반 browser reporting으로 지연 없이 script 신호를 수집하고, AST 분석에 LLM 평가를 더해 악성 의도를 더 정확하게 탐지하도록 Client-Side Security를 개선했습니다. 그 결과 고급 기능을 self-serve 고객까지 확대했고, 무료 번들에도 domain-based threat intelligence를 제공해 더 많은 사용자가 낮은 운영 부담으로 client-side 공격을 탐지할 수 있게 했습니다.

> 📎 원문: [Cloudflare Client-Side Security: smarter detection, now open to everyone](https://blog.cloudflare.com/client-side-security-open-to-everyone/)

### [GitHub] Agent-driven development in Copilot Applied Science

Copilot Applied Science 팀은 반복적인 개발 작업과 실험 코드 관리가 비효율적이라는 문제를 겪었고, 이를 줄이기 위해 Copilot 같은 agent를 개발 흐름에 직접 넣는 방식으로 작업을 바꿨습니다. agent가 코드 작성, 수정, 탐색 같은 일을 맡으면서 연구자와 개발자는 더 중요한 판단과 검증에 집중할 수 있게 되었고, 전체 개발 속도와 실험 생산성이 좋아졌습니다.

> 📎 원문: [Agent-driven development in Copilot Applied Science](https://github.blog/ai-and-ml/github-copilot/agent-driven-development-in-copilot-applied-science/)

### [GitHub] GitHub for Beginners: Getting started with GitHub security

개발 과정에서 보안 설정을 뒤로 미루면 취약점과 의존성 위험을 놓치기 쉽다는 문제가 있었다. 이 글은 GitHub의 Dependabot, secret scanning, code scanning 같은 기능으로 저장소 보안을 초기에 설정하고, Pull request와 함께 점검하는 방법을 설명한다. 그 결과 주니어 개발자도 GitHub 안에서 보안을 일찍 적용해 위험을 빠르게 발견하고 수정할 수 있다.

> 📎 원문: [GitHub for Beginners: Getting started with GitHub security](https://github.blog/developer-skills/github/github-for-beginners-getting-started-with-github-security/)

### [토스] Metric Review, 실행을 이끌다

토스플레이스는 분석 결과와 실행 사이의 간격이 큰 문제가 있었고, 이를 줄이기 위해 OKR과 연결된 Metric Hierarchy를 바탕으로 매주 Metric Review를 운영했습니다. 데이터 분석가는 지표 변화만 보는 데서 끝나지 않고 EDA로 원인을 파고들며 가설, 인사이트, 실행 액션까지 연결하는 Metric Owner 역할을 맡았습니다. 그 결과 조직이 같은 지표를 기준으로 협업하게 됐고, 제품 목표 달성, POS 확산 가속, SCM 최적화와 비용 절감 같은 실제 성과로 이어졌습니다.

> 📎 원문: [Metric Review, 실행을 이끌다](https://toss.tech/article/place-metric-review)
