---
title: "[테크 인사이드] 2026-06-03 — 이번 주 엔지니어링 블로그"
date: 2026-06-03 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 5개 글 요약

### [Airbnb] When history fails you, borrow from geography

Airbnb는 COVID 이후 각 여행 corridor의 회복 시점이 달라 과거 데이터만으로는 수요 예측이 크게 빗나가는 문제가 있었다. 지역별 booking lead time 같은 회복 신호를 비교해, 먼저 회복한 지역의 패턴을 데이터가 부족한 지역의 prior로 전달하는 방식으로 해결했다. 그 결과 local data가 부족한 corridor에서도 더 안정적인 forecast를 만들 수 있었다.

> 📎 원문: [When history fails you, borrow from geography](https://medium.com/airbnb-engineering/when-history-fails-you-borrow-from-geography-915a72b91b5c?source=rss----53c7c27702d5---4)

### [Cloudflare] How we reduced core unit boot time from hours to minutes

Cloudflare는 firmware 업데이트 후 일부 core bare metal 서버가 UEFI boot 과정에서 몇 분이 아니라 최대 4시간씩 멈추는 문제를 겪었습니다. 원인은 UEFI가 사용 가능한 모든 network boot interface를 선형으로 탐색하며 timeout을 반복하는 firmware 특성이었습니다. Cloudflare는 boot 경로를 자동화하고 불필요한 interface 탐색을 줄여 전체 boot 및 upgrade 시간을 다시 몇 분 수준으로 단축했습니다.

> 📎 원문: [How we reduced core unit boot time from hours to minutes](https://blog.cloudflare.com/optimizing-core-unit-boot-time/)

### [Cloudflare] How we built Cloudflare's data platform and an AI agent on top of it

Cloudflare는 데이터가 여러 DB, ClickHouse, Kafka, BigQuery 등에 흩어져 있어 간단한 분석도 시스템별 지식과 권한, 데이터 신선도 확인이 필요했다. 이를 해결하기 위해 모든 데이터를 하나의 SQL 인터페이스로 조회하는 Town Lake를 만들고, 그 위에 자연어 질문을 SQL로 바꿔 검증 가능한 답을 주는 AI agent Skipper를 구축했다. 결과적으로 직원들은 복잡한 데이터 위치를 몰라도 신선하고 정확한 내부 데이터를 빠르게 조회할 수 있게 됐다.

> 📎 원문: [How we built Cloudflare's data platform and an AI agent on top of it](https://blog.cloudflare.com/our-unified-data-platform/)

### [GitHub] GitHub Copilot app: The agent-native desktop experience

GitHub는 AI agent가 IDE 안에만 있으면 여러 도구와 작업 흐름을 오가며 개발하기 어렵다고 봤습니다. 이를 해결하기 위해 GitHub Copilot app을 desktop 환경에 통합해 repository, terminal, editor, GitHub 작업을 한곳에서 이어서 처리하도록 만들었습니다. 결과적으로 개발자는 agent와 더 자연스럽게 협업하고, 코드 작성부터 변경 검토까지의 흐름을 줄일 수 있습니다.

> 📎 원문: [GitHub Copilot app: The agent-native desktop experience](https://github.blog/news-insights/product-news/github-copilot-app-the-agent-native-desktop-experience/)

### [GitHub] Still a developer. Just outside. Our latest GitHub Shop collection is here.

GitHub의 새 Shop collection을 소개하는 글로, 개발자가 실외에서도 편하게 사용할 수 있는 의류와 굿즈를 제공하려는 내용입니다. 기술적 문제 해결 사례나 아키텍처 개선 내용은 없으며, 결과적으로 GitHub 브랜드 상품 라인업이 확장되었다는 소식입니다.

> 📎 원문: [Still a developer. Just outside. Our latest GitHub Shop collection is here.](https://github.blog/news-insights/company-news/still-a-developer-just-outside-our-latest-github-shop-collection-is-here/)
