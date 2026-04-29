---
title: "[테크 인사이드] 2026-04-29 — 이번 주 엔지니어링 블로그"
date: 2026-04-29 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 8개 글 요약

### [Airbnb] Skipper: Building Airbnb’s embedded workflow engine

Airbnb는 보험 청구처럼 오래 걸리는 업무 흐름에서 서버 장애가 나면 중복 처리, 상태 꼬임, 재시도 로직 분산 같은 durable execution 문제가 생겼고, 기존 외부 workflow engine은 운영 복잡도와 강한 인프라 의존성 때문에 맞지 않았습니다. 그래서 서비스 안에 직접 넣어 쓸 수 있는 경량 embedded workflow engine인 Skipper를 만들어, 재시도·상태 관리·비동기 흐름 제어를 공통화하고 흩어진 비즈니스 로직을 한곳에 모았습니다. 그 결과 보험, 결제, 미디어 처리, 인프라 자동화 같은 핵심 workflow를 더 안정적으로 실행하면서도 외부 orchestration cluster 없이 운영할 수 있게 됐습니다.

> 📎 원문: [Skipper: Building Airbnb’s embedded workflow engine](https://medium.com/airbnb-engineering/skipper-building-airbnbs-embedded-workflow-engine-f6c34552146f?source=rss----53c7c27702d5---4)

### [Cloudflare] Shutdowns, power outages, and conflict: a review of Q1 2026 Internet disruptions

Cloudflare는 2026년 1분기에 Uganda와 Iran의 정부 주도 Internet shutdown, Cuba의 대규모 power outage, Ukraine와 Middle East의 conflict 등으로 다양한 Internet 장애가 발생했다고 정리했다. 각 장애는 Cloudflare Radar와 traffic 데이터를 통해 확인됐고, 원인은 정부 통제, 전력망 붕괴, 군사 행동, 기상 악화, cable 손상, 통신사 기술 문제로 나뉘었다. 결과적으로 2025년 같은 기간보다 더 길고 광범위한 국가 단위 장애가 늘었고, Internet 안정성이 정치·전력·물리 인프라에 크게 영향을 받는다는 점이 드러났다.

> 📎 원문: [Shutdowns, power outages, and conflict: a review of Q1 2026 Internet disruptions](https://blog.cloudflare.com/q1-2026-internet-disruption-summary/)

### [Cloudflare] Making Rust Workers reliable: panic and abort recovery in wasm‑bindgen

Rust Workers에서는 panic이나 abort가 나면 WebAssembly 런타임 상태가 망가져, 한 요청의 실패가 다른 요청이나 이후 요청까지 전파되는 문제가 있었다. Cloudflare는 wasm-bindgen에 panic=unwind와 abort recovery를 도입해, panic은 상태를 최대한 유지한 채 복구하고 abort 이후에는 Rust 코드가 다시 잘못 실행되지 않도록 막았다. 그 결과 Rust Workers의 안정성이 높아졌고, 일부 요청의 오류가 Worker 전체 장애로 번지는 문제를 줄였다.

> 📎 원문: [Making Rust Workers reliable: panic and abort recovery in wasm‑bindgen](https://blog.cloudflare.com/making-rust-workers-reliable/)

### [GitHub] GitHub for Beginners: Getting started with Markdown

GitHub를 처음 쓰는 개발자는 README, issue, PR에서 내용을 깔끔하게 정리하지 못하는 문제가 있는데, 이 글은 Markdown의 기본 문법과 GitHub에서 자주 쓰는 작성 방식을 예시로 설명해 이를 해결합니다. 그 결과 초보자도 문서를 더 읽기 쉽게 작성하고, 협업 과정에서 의도를 더 명확하게 전달할 수 있게 됩니다.

> 📎 원문: [GitHub for Beginners: Getting started with Markdown](https://github.blog/developer-skills/github/github-for-beginners-getting-started-with-markdown/)

### [GitHub] Securing the git push pipeline: Responding to a critical remote code execution vulnerability

GitHub는 `git push` 처리 파이프라인에서 원격 코드 실행이 가능한 치명적 취약점을 발견했고, 서버 측에서 사용자 입력과 Git 처리 경계를 충분히 격리하지 못하는 문제가 있었습니다. 이를 해결하기 위해 취약한 실행 경로를 차단하고, `git push` 과정의 검증·격리·방어 로직을 강화해 악성 코드가 내부 시스템까지 실행되지 않도록 막았습니다. 그 결과 실제 서비스 영향 범위를 빠르게 줄였고, 이후에도 같은 계열의 공격에 더 강한 push 파이프라인을 갖추게 됐습니다.

> 📎 원문: [Securing the git push pipeline: Responding to a critical remote code execution vulnerability](https://github.blog/security/securing-the-git-push-pipeline-responding-to-a-critical-remote-code-execution-vulnerability/)

### [카카오] 카카오톡 예약하기에서 그려 본 캘린더

제공된 본문에는 실제 글 내용이 없어, 카카오톡 예약하기에서 캘린더를 직접 구현한 사례라는 점만 파악된다. 예약 서비스에 맞는 캘린더를 설계하고 그 과정의 문제와 해결 방법, 적용 결과를 다룬 글로 보이지만 구체적인 기술 내용은 확인할 수 없다.

> 📎 원문: [카카오톡 예약하기에서 그려 본 캘린더](https://tech.kakao.com/posts/820)

### [토스] Why We Adopted Post-Quantum Cryptography a Decade Before Quantum Computers Arrive

토스는 20년 넘은 PG legacy system과 수만 개 가맹점의 오래된 서버 환경 때문에 TLS 업그레이드나 약한 cipher 제거 같은 보안 개선을 쉽게 적용하지 못했습니다. 그래서 보안 정책을 한 번에 강제하지 않고, 가맹점이 따라올 수 있게 문서와 전환 과정을 오래 설계하면서 기존 암호 체계의 한계를 대비해 Post-Quantum Cryptography까지 미리 도입했습니다. 결과적으로 안정성을 해치지 않으면서 보안 기준을 높였고, 미래의 quantum computing 위협에도 더 일찍 대비할 수 있는 기반을 만들었습니다.

> 📎 원문: [Why We Adopted Post-Quantum Cryptography a Decade Before Quantum Computers Arrive](https://toss.tech/article/post-quantum-cryptography-eng)

### [토스] StarRocks 운영기: Resource Group으로 멀티테넌트 워크로드 격리하기

토스는 StarRocks 한 클러스터에서 서비스 조회, 배치, 적재, 대시보드 쿼리가 함께 돌아가면서 중요한 서비스 쿼리가 다른 작업에 밀릴 수 있는 문제가 있었습니다. 이를 해결하려고 Resource Group으로 워크로드를 나누고 `cpu_weight`로 기본 우선순위를 설계해 CPU 경합 시 서비스 쿼리를 먼저 보호했으며, 꼭 필요한 경우에는 `exclusive_cpu_cores`로 특정 그룹에 전용 CPU 코어까지 할당했습니다. 그 결과 멀티테넌트 환경에서도 쿼리 성격에 맞게 리소스를 격리하고 SLA를 더 안정적으로 지킬 수 있었지만, 설정 간 의존성을 잘못 이해하면 기대와 다르게 동작할 수 있다는 점도 확인했습니다.

> 📎 원문: [StarRocks 운영기: Resource Group으로 멀티테넌트 워크로드 격리하기](https://toss.tech/article/operating-starrocks-1)
