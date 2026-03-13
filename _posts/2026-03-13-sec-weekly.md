---
title: "[개발자 보안] 2026-03-13 주간 — 개발자가 주의해야 할 취약점"
date: 2026-03-13 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, python, go, rce]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-28710 — Acronis Cyber Protect 17
**CVSS**: 9.8 | **영향**: Backup / Security Software
**설명**: 인증이 부적절하게 처리되어 민감한 정보 노출과 데이터 조작이 가능합니다. 외부 공격자가 인증 우회를 통해 백업 정보나 보호 설정에 접근할 수 있습니다. 백업 서버를 신뢰 기반으로 운영했다면 내부 시스템 전체로 피해가 번질 수 있습니다.
**대응**: Acronis Cyber Protect 17을 build 41186 이상으로 즉시 업데이트하세요. 외부 노출이 있다면 관리 인터페이스 접근을 제한하고, 최근 설정 변경 이력을 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28710)

### [CRITICAL] CVE-2026-27005 — Chartbrew
**CVSS**: 9.8 | **영향**: Web Application / Database Connector
**설명**: 인증 없이 SQL injection이 가능해 연결된 MySQL, PostgreSQL 데이터베이스 쿼리를 조작할 수 있습니다. 공격자는 조회뿐 아니라 수정, 삭제까지 시도할 수 있습니다. Chartbrew가 운영 DB에 직접 연결되어 있으면 서비스 데이터 전체가 노출될 수 있습니다.
**대응**: Chartbrew를 4.8.3 이상으로 업데이트하세요. 그전까지는 DB 계정을 최소 권한으로 낮추고, 인터넷에서 직접 접근되지 않게 차단해야 합니다.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-27005)

### [CRITICAL] CVE-2026-28785 — Ghostfolio
**CVSS**: 9.8 | **영향**: Node.js Application / Financial Data
**설명**: `getHistorical()` 경로에서 symbol 검증을 우회해 임의 SQL 실행이 가능합니다. 공격자는 전체 사용자 금융 데이터를 읽거나 수정하거나 삭제할 수 있습니다. 멀티 유저 환경에서는 한 번의 취약점 악용으로 전체 테넌트 데이터가 영향을 받습니다.
**대응**: Ghostfolio를 2.244.0 이상으로 업데이트하세요. 임시로는 외부 입력이 들어가는 symbol 관련 기능을 제한하고, DB 계정 권한을 재검토해야 합니다.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28785)

### [CRITICAL] CVE-2026-28794 — @orpc/client
**CVSS**: 9.8 | **영향**: npm / Node.js
**설명**: RPC JSON deserializer에서 prototype pollution이 발생합니다. 인증 없는 원격 공격자가 `Object.prototype`에 속성을 주입하면 인증 우회, 서비스 장애, 일부 환경에서는 RCE까지 이어질 수 있습니다. Node.js 프로세스 수명 동안 오염이 유지된다는 점이 특히 위험합니다.
**대응**: `@orpc/client`를 1.13.6 이상으로 업데이트하세요. 그전까지는 신뢰하지 않는 RPC payload를 직접 역직렬화하지 말고, 프로세스 재시작과 입력 검증을 강화하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28794)

### [CRITICAL] CVE-2026-28438 — CocoIndex
**CVSS**: 9.8 | **영향**: Python Data Framework / SQL Connector
**설명**: Doris target connector가 table name을 검증하지 않아 schema 변경 시 SQL injection이 가능합니다. 애플리케이션 상류에서 들어온 table name이 신뢰되지 않으면 `ALTER TABLE` 구문이 악용됩니다. 데이터 파이프라인 자동화 환경에서는 운영 테이블 구조 자체가 손상될 수 있습니다.
**대응**: CocoIndex를 0.3.34 이상으로 업데이트하세요. 임시로는 외부 입력으로 table name을 받지 말고, 허용 목록 기반 검증을 적용하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28438)

### [CRITICAL] CVE-2026-28795 — OpenChatBI
**CVSS**: 9.8 | **영향**: Python / LLM BI Tool
**설명**: `save_report.py`의 `file_format` 처리에 path traversal이 있어 임의 파일 경로로 저장이 가능합니다. 공격자는 의도한 디렉터리 밖의 파일을 덮어쓰거나 민감 경로를 노릴 수 있습니다. 서버 파일시스템 권한이 넓으면 설정 파일이나 실행 파일까지 영향을 받을 수 있습니다.
**대응**: OpenChatBI를 0.2.2 이상으로 업데이트하세요. 임시로는 `file_format` 값을 고정된 확장자 목록으로 제한하고, 저장 경로를 서버 측에서 강제하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28795)

### [CRITICAL] CVE-2026-28802 — Authlib
**CVSS**: 9.8 | **영향**: PyPI / OAuth / OpenID Connect
**설명**: `alg: none` 과 빈 서명을 가진 악성 JWT가 서명 검증을 통과할 수 있습니다. 공격자는 위조 토큰으로 인증 또는 권한 검사를 우회할 수 있습니다. OAuth, OIDC 서버를 직접 운영하는 프로젝트라면 로그인과 API 보호 로직 전체가 흔들릴 수 있습니다.
**대응**: Authlib를 1.6.7 이상으로 업데이트하세요. 즉시 점검할 부분은 `alg` 허용 목록 고정, unsigned token 거부, 토큰 검증 테스트 추가입니다.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28802)

### [CRITICAL] CVE-2026-29042 — Nuclio
**CVSS**: 9.8 | **영향**: Serverless Runtime / HTTP Function
**설명**: Shell Runtime이 `X-Nuclio-Arguments` 헤더 값을 검증 없이 쉘 명령에 포함해 command injection이 발생합니다. HTTP 호출만 가능하면 원격 코드 실행으로 이어질 수 있습니다. 함수 실행 노드 권한이 높다면 클러스터 내부 확산도 가능합니다.
**대응**: Nuclio를 1.15.20 이상으로 업데이트하세요. 임시로는 해당 런타임 사용을 중지하거나, 외부 요청에서 헤더를 차단하고 함수 노출 범위를 줄이세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-29042)

### [CRITICAL] CVE-2026-25070 — XikeStor SKS8310-8X firmware
**CVSS**: 9.8 | **영향**: Network Switch Firmware
**설명**: `/goform/PingTestSet`의 `destIp` 파라미터에 대한 검증이 없어 OS command injection이 가능합니다. 인증 없이 원격에서 root 권한 명령 실행이 가능합니다. 개발망이나 사무망 스위치가 노출되어 있으면 서버 보안보다 더 큰 문제로 번질 수 있습니다.
**대응**: 제조사 패치를 적용하세요. 패치 전에는 관리 인터페이스를 외부에서 차단하고, 스위치 관리망을 분리하며, 의심 요청 로그를 점검해야 합니다.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-25070)

### [CRITICAL] CVE-2026-25072 — XikeStor SKS8310-8X firmware
**CVSS**: 9.8 | **영향**: Network Switch Firmware
**설명**: `/goform/SetLogin`에서 세션 식별자가 예측 가능해 세션 탈취가 가능합니다. 쿠키 난수가 약하고 URL에 세션 정보가 노출되어 인증된 관리자 세션을 가로챌 수 있습니다. 네트워크 장비 관리 권한이 탈취되면 트래픽 조작과 내부 이동이 쉬워집니다.
**대응**: 제조사 패치를 적용하세요. 패치 전에는 관리 페이지 외부 노출을 막고, 로그인 세션을 모두 재발급하며, 관리자 계정 접근 대역을 제한하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-25072)

## 이번 주 보안 트렌드

이번 주에는 SQL injection, command injection, path traversal, prototype pollution처럼 입력값 검증 실패에서 시작하는 취약점이 많았습니다.  
특히 Node.js, Python 기반의 self-hosted 도구와 데이터 처리 플랫폼이 많이 포함됐습니다. 운영 DB, 파일시스템, 쉘 명령에 직접 닿는 구조라면 피해 범위가 매우 큽니다.  
npm, PyPI 패키지를 쓰는 풀스택 개발자는 이번 주에 의존성 버전 점검을 먼저 해야 합니다. BI 도구, OAuth 서버, RPC 클라이언트, serverless runtime을 직접 띄우고 있다면 우선순위를 가장 높게 잡아야 합니다.