---
title: "[테크 인사이드] 2026-03-25 — 이번 주 엔지니어링 블로그"
date: 2026-03-25 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 8개 글 요약

### [Airbnb] What COVID did to our forecasting models (and what we built to handle the next shock)

COVID 같은 대형 외부 충격이 발생하자 Airbnb의 기존 forecasting model은 과거 패턴이 더 이상 맞지 않아 수요 예측 정확도가 크게 흔들리는 문제가 있었다. 이를 해결하기 위해 팀은 급격한 환경 변화를 빠르게 반영할 수 있는 forecasting pipeline과 shock 대응용 모델링 방식을 새로 구축한 것으로 보인다. 결과적으로 일시적 이상 상황에서도 예측을 더 안정적으로 운영하고, 다음과 같은 큰 변화에도 더 빠르게 대응할 수 있는 기반을 마련했다.

> 📎 원문: [What COVID did to our forecasting models (and what we built to handle the next shock)](https://medium.com/airbnb-engineering/what-covid-did-to-our-forecasting-models-and-what-we-built-to-handle-the-next-shock-ccbf0e1f7fa9?source=rss----53c7c27702d5---4)

### [Cloudflare] Sandboxing AI agents, 100x faster

AI가 생성한 코드를 직접 실행하면 보안 취약점이 생기고, 이를 막기 위해 쓰던 container는 시작 시간이 느리고 메모리 비용이 커서 대규모 AI agent 운영에 비효율적이었습니다. Cloudflare는 Dynamic Worker Loader로 실행 시점에 Worker를 isolate 기반 sandbox에 동적으로 띄우고, 필요한 API만 주며 인터넷 접근도 차단하는 방식으로 이 문제를 해결했습니다. 그 결과 sandbox 생성 속도는 container 대비 약 100배 빨라지고 메모리 사용량도 크게 줄어, consumer-scale AI agent를 더 안전하고 효율적으로 실행할 수 있게 됐습니다.

> 📎 원문: [Sandboxing AI agents, 100x faster](https://blog.cloudflare.com/dynamic-workers/)

### [Cloudflare] Inside Gen 13: how we built our most powerful server yet

Cloudflare는 FL2로 소프트웨어 스택이 바뀌면서 기존 Gen 12 하드웨어가 새 워크로드와 효율 요구를 충분히 따라가지 못하는 문제가 있었습니다. 이를 해결하기 위해 AMD EPYC Turin 9965 기반으로 CPU 코어 수, DDR5 메모리, PCIe 5.0 NVMe, 100 GbE 네트워크를 모두 키운 Gen 13 서버를 설계했고, FL2 workload에 맞춰 L3 cache보다 병렬 처리와 전력 효율을 우선해 부품을 선택했습니다. 그 결과 Gen 12 대비 최대 2배 throughput, 최대 50% performance per watt 개선, 랙당 최대 60% 높은 처리량을 달성했습니다.

> 📎 원문: [Inside Gen 13: how we built our most powerful server yet](https://blog.cloudflare.com/gen13-config/)

### [GitHub] Building AI-powered GitHub issue triage with the Copilot SDK

GitHub는 많은 issue를 사람이 직접 분류하고 우선순위를 정하는 과정이 느리고 일관되지 않은 문제가 있었고, 이를 해결하기 위해 Copilot SDK로 issue 내용을 이해해 분류·요약·라우팅하는 AI triage workflow를 구축했습니다. 그 결과 반복적인 triage 작업을 줄이고, maintainer가 더 빠르게 중요한 issue를 처리할 수 있게 해 운영 효율과 대응 속도를 높였습니다.

> 📎 원문: [Building AI-powered GitHub issue triage with the Copilot SDK](https://github.blog/ai-and-ml/github-copilot/building-ai-powered-github-issue-triage-with-the-copilot-sdk/)

### [GitHub] GitHub expands application security coverage with AI‑powered detections

기존의 rule 기반 탐지만으로는 다양한 application security 취약점을 충분히 잡기 어려운 문제가 있었다. GitHub는 AI-powered detections를 적용해 더 넓은 코드 패턴과 보안 이슈를 자동으로 탐지하도록 범위를 확장했다. 그 결과 개발자는 GitHub 안에서 더 많은 취약점을 더 이른 시점에 발견하고 대응할 수 있게 됐다.

> 📎 원문: [GitHub expands application security coverage with AI‑powered detections](https://github.blog/security/application-security/github-expands-application-security-coverage-with-ai-powered-detections/)

### [우아한형제들] pnpm 모노레포에서 React 19 마이그레이션하기: 숨겨진 호이스팅 레이어가 만든 타입 충돌 트러블슈팅

React 19로 일부 앱만 단계적으로 올리기 위해 pnpm catalogs로 워크스페이스별 의존성을 분리했지만, pnpm의 숨겨진 hoisting layer 때문에 React 18 앱이 React 19의 `@types/react`를 참조하면서 대량의 타입 충돌이 발생했습니다. 원인을 `node_modules`의 3단 구조와 hoisting 동작에서 찾았고, 타입 패키지가 섞이지 않도록 의존성 해석 경로와 hoisting 설정을 조정해 앱별 React 타입을 확실히 격리했습니다. 그 결과 모노레포에서 React 18과 React 19를 안전하게 공존시키며 점진적 마이그레이션이 가능해졌습니다.

> 📎 원문: [pnpm 모노레포에서 React 19 마이그레이션하기: 숨겨진 호이스팅 레이어가 만든 타입 충돌 트러블슈팅](https://techblog.woowahan.com/26128/)

### [우아한형제들] 별점 뒤에 숨겨진 리뷰의 온도, LLM으로 한 끗 차이가 다른 추천 만들기

기존 별점은 대부분 5점에 몰려 있어 가게 간 차이를 구분하기 어려웠고, 사용자는 결국 리뷰 텍스트를 직접 읽으며 신뢰도를 다시 판단해야 했습니다. 이를 해결하기 위해 배달의민족은 LLM-as-a-Judge로 리뷰의 진정성과 추천 강도를 자동 점수화하고, 그 결과를 ELECTRA 기반 경량 모델에 knowledge distillation해 대규모 리뷰를 실시간으로 처리할 수 있게 만들었습니다. 그 결과 별점만으로 보이지 않던 리뷰의 질 차이를 추천에 반영해, 더 분별력 있는 맛집 추천이 가능해졌습니다.

> 📎 원문: [별점 뒤에 숨겨진 리뷰의 온도, LLM으로 한 끗 차이가 다른 추천 만들기](https://techblog.woowahan.com/25888/)

### [토스] LLM을 이용한 서비스 취약점 분석 자동화 #2

대용량 소스코드를 LLM에 그대로 넘기면 필요한 코드를 정확히 찾지 못하고 토큰만 낭비하는 문제가 있었습니다. 이를 해결하기 위해 Toss는 ctags와 tree-sitter로 코드를 미리 인덱싱한 MCP 서버를 만들고, `find_references`, `read_definition`, `read_source`, `get_project_structure` 같은 도구로 AI가 필요한 심볼과 주변 문맥을 정확히 읽게 했습니다. 그 결과 원격 환경에서도 IDE처럼 코드 탐색이 가능해졌고, 서비스 취약점 분석 자동화를 더 정밀하게 고도화할 수 있었습니다.

> 📎 원문: [LLM을 이용한 서비스 취약점 분석 자동화 #2](https://toss.tech/article/vulnerability-analysis-automation-2)
