---
title: "[테크 인사이드] 2026-04-22 — 이번 주 엔지니어링 블로그"
date: 2026-04-22 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 7개 글 요약

### [Airbnb] Building a fault-tolerant metrics storage system at Airbnb

Airbnb는 대규모 서비스에서 metrics를 안정적으로 저장해야 했지만, 장애가 나면 데이터 유실이나 지연이 생기는 문제가 있었던 것으로 보입니다. 이를 해결하기 위해 일부 시스템이 실패해도 계속 동작하는 fault-tolerant storage architecture를 설계하고, 데이터 복제·복구·우회 처리 같은 안정성 장치를 강화했을 가능성이 큽니다. 그 결과 metrics 수집과 저장의 신뢰성이 높아지고, 운영 중 장애가 발생해도 모니터링 품질을 더 안정적으로 유지할 수 있게 된 글로 이해하면 됩니다.

> 📎 원문: [Building a fault-tolerant metrics storage system at Airbnb](https://medium.com/airbnb-engineering/building-a-fault-tolerant-metrics-storage-system-at-airbnb-26a01a6e7017?source=rss----53c7c27702d5---4)

### [Cloudflare] Moving past bots vs. humans

Cloudflare는 기존의 bot vs. human 구분만으로는 공격, 과도한 crawler 트래픽, 비정상 로그인, 광고 악용 같은 실제 문제를 제대로 막기 어렵다고 봤습니다. 그래서 단순히 사람이냐 봇이냐를 판단하는 대신, automation 여부와 요청의 intent·behavior를 함께 분석하는 방향으로 웹 보호 방식을 바꿔야 한다고 설명합니다. 결과적으로 앞으로의 보안 시스템은 wanted bots와 unwanted humans가 섞인 환경에서도, 누가 아니라 어떤 행동을 하는지 기준으로 더 정확하게 제어해야 합니다.

> 📎 원문: [Moving past bots vs. humans](https://blog.cloudflare.com/past-bots-and-humans/)

### [Cloudflare] Building the agentic cloud: everything we launched during Agents Week 2026

기존 클라우드는 여러 agent가 동시에 오래 실행되는 환경을 감당하기 어려웠고, agent가 만든 코드와 데이터, 실행 환경, 보안까지 한 번에 다루기 어렵다는 문제가 있었습니다. Cloudflare는 이를 해결하기 위해 Git-compatible versioned storage인 Artifacts, 지속적이고 격리된 실행 환경인 Sandboxes, zero-trust egress 제어, 그리고 AI-generated app별 상태 저장용 Durable Objects 같은 기능을 묶어 agent 전용 인프라를 출시했습니다. 그 결과 개발자는 prototype부터 production까지 같은 플랫폼에서 agent를 더 안전하게 운영하고, 대규모로 확장할 수 있게 됐습니다.

> 📎 원문: [Building the agentic cloud: everything we launched during Agents Week 2026](https://blog.cloudflare.com/agents-week-in-review/)

### [GitHub] Changes to GitHub Copilot Individual plans

GitHub는 기존 GitHub Copilot Individual 플랜이 사용자별 사용 패턴과 기대치를 충분히 반영하지 못하는 문제를 해결하기 위해 요금제 구성을 조정했다. 이번 변경으로 기능과 사용량 기준이 더 명확해져 개인 사용자가 자신에게 맞는 플랜을 더 쉽게 선택할 수 있게 되었고, GitHub는 Copilot 운영 정책도 더 단순하고 일관되게 가져가게 됐다.

> 📎 원문: [Changes to GitHub Copilot Individual plans](https://github.blog/news-insights/company-news/changes-to-github-copilot-individual-plans/)

### [GitHub] Highlights from Git 2.54

제공된 본문에는 Git 2.54의 실제 변경 사항보다 GitHub Blog 메뉴와 소개 문구가 대부분이라, 어떤 문제가 있었고 무엇이 개선됐는지 핵심 기술 내용을 파악하기 어렵다. 따라서 이 텍스트만으로는 해결 방식이나 결과를 정확히 요약할 수 없다.

> 📎 원문: [Highlights from Git 2.54](https://github.blog/open-source/git/highlights-from-git-2-54/)

### [우아한형제들] 하네스 엔지니어링(harness engineering)으로 팀 맞춤형 AI 환경 구축하기

팀은 AI 코딩 도구가 프로젝트 규칙을 몰라서 같은 설명과 수정 요청을 반복해야 하는 문제가 있었습니다. 이를 해결하려고 Cursor IDE에 `Rules`와 `Skills`를 분리해 넣고, `globs`로 필요한 규칙만 적용되게 해서 React Query, queryKeys, API Class 같은 팀 컨벤션을 AI가 기본값으로 따르도록 만들었습니다. 그 결과 한 번의 요청으로 실무형 코드가 더 자주 생성됐고, 프롬프트 수정, 리뷰 비용, 토큰 낭비가 함께 줄었습니다.

> 📎 원문: [하네스 엔지니어링(harness engineering)으로 팀 맞춤형 AI 환경 구축하기](https://techblog.woowahan.com/26177/)

### [토스] Apache Flink + RocksDB 튜닝으로 광고 Frequency Capping 실시간 집계를 일주일까지 확장하기

기존 광고 Frequency Capping 시스템은 Airflow 배치와 Redis를 조합해 1분~7일 집계를 만들었지만, 구조가 복잡하고 슬라이딩 집계 정확도와 서빙 단순화에 한계가 있었습니다. 토스는 이를 해결하려고 Apache Flink를 minutes, hours, days 세 앱으로 분리하고, 각 구간의 병목에 맞춰 RocksDB와 State 구조를 튜닝해 1분부터 7일까지의 집계를 실시간으로 처리하도록 확장했습니다. 그 결과 장기 구간도 단일 Redis 조회로 정확하게 제공할 수 있는 구조를 만들고, 운영 복잡도와 재처리 시 정합성 문제를 함께 줄였습니다.

> 📎 원문: [Apache Flink + RocksDB 튜닝으로 광고 Frequency Capping 실시간 집계를 일주일까지 확장하기](https://toss.tech/article/flink-realtime-frequency-capping)
