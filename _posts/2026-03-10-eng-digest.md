---
title: "[테크 인사이드] 2026-03-10 — 이번 주 엔지니어링 블로그"
date: 2026-03-10 09:00:00 +0900
categories: [테크 인사이드, 엔지니어링]
tags: [engineering, tech-blog, netflix, airbnb, stripe, cloudflare, kakao, toss]
---
## 이번 주 엔지니어링 블로그 하이라이트

> 수집 기간: 최근 7일 | 7개 글 요약

### [우아한형제들] RAG, 들어는 봤는데&#8230; 내 서비스엔 어떻게 쓰지?

LLM은 최신 정보나 사내 데이터가 없어서 환각을 일으키고, 교육 운영 정보도 DB·Google Drive·Google Calendar에 흩어져 있어 한 번에 찾기 어려운 문제가 있었습니다. 처음에는 MCP로 외부 데이터를 붙이려 했지만 LLM 의존성, VPC 접근 제한, Context window 초과, 지연 문제로 한계가 있었고, 결국 직접 RAG 서버를 구현해 필요한 컨텍스트를 자동 검색하는 구조로 바꿨습니다. 그 결과 범용 LLM을 교육 도메인에 맞는 검색 시스템으로 확장할 수 있었고, 글은 이 과정을 바탕으로 RAG 도입부터 색인·생성·평가까지 6단계 구현 가이드를 정리합니다.

> 📎 원문: [RAG, 들어는 봤는데&#8230; 내 서비스엔 어떻게 쓰지?](https://techblog.woowahan.com/25900/)

### [토스] 외국인 유저 리서치: 캐나다인 "B"씨는 왜 토스 인증에 실패했을까

토스는 외국인 사용자가 인증 단계에서 자주 이탈하는 문제를 해결하려고 산업단지와 다문화센터에서 직접 인터뷰를 진행했고, 이름 포맷 불일치와 복잡한 주소 입력이 핵심 원인임을 확인했다. 이후 이름 입력 구조와 인증 절차를 개선해 외국인 인증 퍼널 통과율을 약 15% 높였고, 내국인과의 인증 통과율 격차도 크게 줄였다.

> 📎 원문: [외국인 유저 리서치: 캐나다인 "B"씨는 왜 토스 인증에 실패했을까](https://toss.tech/article/45787)

### [Airbnb] It Wasn’t a Culture Problem: Upleveling Alert Development at Airbnb

Airbnb는 Alert 품질이 낮아지는 원인을 단순한 문화 문제로 보지 않고, Alert 설계와 운영 방식 자체에 구조적인 문제가 있다고 판단한 것으로 보입니다. 이를 해결하기 위해 Alert 기준을 정비하고, 노이즈를 줄이며, 실제 대응이 필요한 신호 중심으로 개발 프로세스를 개선했을 가능성이 큽니다. 그 결과 엔지니어가 더 중요한 장애에 빠르게 집중하고, 운영 효율과 대응 품질을 높이는 방향의 개선을 다룬 글로 보입니다.

> 📎 원문: [It Wasn’t a Culture Problem: Upleveling Alert Development at Airbnb](https://medium.com/airbnb-engineering/it-wasnt-a-culture-problem-upleveling-alert-development-at-airbnb-01e2290eb0f5?source=rss----53c7c27702d5---4)

### [Cloudflare] Fixing request smuggling vulnerabilities in Pingora OSS deployments

Pingora를 Internet-facing ingress proxy로 사용할 때 HTTP/1.x request smuggling 취약점이 있어, 프록시와 backend가 request body 경계를 다르게 해석하면서 보안 우회, cache poisoning, 세션 탈취 같은 문제가 발생할 수 있었습니다. Cloudflare는 원인을 Pingora의 HTTP/1 처리와 비표준 요청 해석에서 찾았고, `Upgrade` 처리 등 취약한 케이스를 수정하고 보안을 강화한 패치를 `Pingora 0.8.0`에 반영했습니다. Cloudflare CDN과 고객 트래픽은 구조상 영향이 없었지만, standalone Pingora OSS 배포 환경은 빠르게 업그레이드해야 합니다.

> 📎 원문: [Fixing request smuggling vulnerabilities in Pingora OSS deployments](https://blog.cloudflare.com/pingora-oss-smuggling-vulnerabilities/)

### [Cloudflare] Active defense: introducing a stateful vulnerability scanner for APIs

기존 WAF 같은 방어형 보안은 정상적인 HTTP 요청처럼 보이는 API logic flaw, 특히 BOLA 같은 취약점을 잘 잡지 못하는 문제가 있었다. Cloudflare는 이를 해결하기 위해 실제 API 흐름과 권한 검증을 따라가며 취약점을 능동적으로 찾는 stateful Web and API Vulnerability Scanner를 beta로 출시했고, 첫 대상으로 API Shield 고객의 API 보안을 지원한다. 결과적으로 단순 요청 패턴이 아니라 business logic 수준의 권한 문제를 더 잘 발견할 수 있게 됐다.

> 📎 원문: [Active defense: introducing a stateful vulnerability scanner for APIs](https://blog.cloudflare.com/vulnerability-scanner/)

### [GitHub] Under the hood: Security architecture of GitHub Agentic Workflows

GitHub는 Agentic Workflows가 코드 실행, 외부 도구 호출, 비밀 정보 접근까지 연결되면서 권한 오남용과 공급망 공격 위험이 커지는 문제를 다뤘습니다. 이를 위해 격리된 실행 환경, 최소 권한, secret 보호, 정책 기반 검증 같은 다층 보안 구조를 적용해 에이전트의 행동 범위를 통제했습니다. 그 결과 AI 기반 자동화의 생산성은 유지하면서도 GitHub 플랫폼 수준의 보안성과 감사 가능성을 확보했습니다.

> 📎 원문: [Under the hood: Security architecture of GitHub Agentic Workflows](https://github.blog/ai-and-ml/generative-ai/under-the-hood-security-architecture-of-github-agentic-workflows/)

### [GitHub] How to scan for vulnerabilities with GitHub Security Lab’s open source AI-powered framework

오픈소스 코드의 취약점을 사람이 직접 찾는 방식은 시간이 많이 들고 범위도 제한적이라는 문제가 있었다. GitHub Security Lab은 AI-powered 오픈소스 프레임워크로 코드 스캔과 취약점 탐지를 자동화하는 방법을 제시했고, 이를 통해 더 넓은 코드베이스에서 보안 이슈를 빠르게 찾을 수 있게 했다. 결과적으로 개발팀은 vulnerability research 효율을 높이고, 보안 점검을 개발 과정 초기에 더 쉽게 적용할 수 있다.

> 📎 원문: [How to scan for vulnerabilities with GitHub Security Lab’s open source AI-powered framework](https://github.blog/security/how-to-scan-for-vulnerabilities-with-github-security-labs-open-source-ai-powered-framework/)
