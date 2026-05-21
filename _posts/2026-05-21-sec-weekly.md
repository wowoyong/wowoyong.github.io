---
title: "[개발자 보안] 2026-05-21 주간 — 개발자가 주의해야 할 취약점"
date: 2026-05-21 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, python, java, go, rce, deserialization]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-41553 — DHTMLX PDF Export Module
**CVSS**: 10 | **영향**: Node.js / DHTMLX Gantt, Scheduler  
**설명**: `data` 파라미터 검증이 없어, 인증 없는 공격자가 악성 JavaScript를 주입할 수 있습니다. 이 값이 Node.js에서 그대로 처리되고 실행되어 서버에서 Remote Code Execution이 가능합니다. PDF 내보내기 기능을 외부 요청과 연결해 둔 프로젝트라면 바로 서버 장악으로 이어질 수 있습니다.  
**대응**: `PDF Export Module 0.7.6` 이상으로 즉시 업데이트하세요. 업데이트 전에는 PDF export 엔드포인트를 외부에 노출하지 말고, 입력값을 서버 측에서 강하게 검증하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41553)

### [CRITICAL] CVE-2026-42822 — Azure Local Disconnected Operations
**CVSS**: 10 | **영향**: Microsoft Azure Local  
**설명**: 인증 처리 오류로 인해 네트워크 상의 비인가 공격자가 권한 상승을 할 수 있습니다. 내부 운영망이라고 방심하면 안 됩니다. 공격이 성공하면 관리자 수준 권한으로 시스템 설정과 운영 자원에 접근할 수 있습니다.  
**대응**: Microsoft 보안 업데이트를 즉시 적용하세요. 패치 전에는 관리 네트워크를 분리하고, 접근 가능한 호스트와 포트를 최소화하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-42822)

### [CRITICAL] CVE-2026-43633 — HestiaCP web terminal
**CVSS**: 10 | **영향**: PHP / Node.js / HestiaCP  
**설명**: PHP 세션과 Node.js 세션 해석 방식 차이로 역직렬화 취약점이 발생합니다. 공격자는 HTTP 헤더에 조작된 값을 넣어 인증 없이 root 권한 코드 실행을 유도할 수 있습니다. 웹 터미널 기능이 켜져 있으면 서버 전체가 바로 위험해집니다.  
**대응**: `1.9.0`부터 `1.9.4`까지 사용 중이면 웹 터미널 기능을 즉시 비활성화하세요. 이후 벤더가 제공하는 패치 릴리스로 빠르게 올리세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-43633)

### [CRITICAL] CVE-2026-42960 — NLnet Labs Unbound
**CVSS**: 10 | **영향**: DNS Resolver / Unbound  
**설명**: authority section과 additional section의 레코드를 과하게 신뢰해 DNS cache poisoning이 가능합니다. 스푸핑된 응답이나 fragmentation 공격이 가능하면, 공격자가 잘못된 MX 등 레코드를 캐시에 심을 수 있습니다. 그 결과 트래픽 우회, 메일 라우팅 오염, 내부 서비스 연결 오류가 발생할 수 있습니다.  
**대응**: `Unbound 1.25.1` 이상으로 즉시 업데이트하세요. 외부 재귀 DNS로 Unbound를 쓰는 환경이라면 패치 전까지 네트워크 스푸핑 가능 구간도 함께 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-42960)

### [CRITICAL] CVE-2026-20223 — Cisco Secure Workload
**CVSS**: 10 | **영향**: REST API / Cisco Secure Workload  
**설명**: 내부 REST API의 인증과 접근 검증이 부족해, 인증 없는 원격 공격자가 `Site Admin` 권한으로 리소스에 접근할 수 있습니다. 단순 조회를 넘어서 테넌트 경계를 넘어 설정 변경까지 가능하므로 운영 환경 영향이 큽니다.  
**대응**: Cisco가 제공하는 보안 패치를 즉시 적용하세요. 패치 전에는 해당 관리 API를 외부에 노출하지 말고, 접근 가능한 네트워크와 프록시 정책을 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-20223)

### [CRITICAL] CVE-2026-44774 — Traefik
**CVSS**: 9.9 | **영향**: Kubernetes Gateway API / Traefik  
**설명**: `HTTPRoute` 생성 권한만 있는 낮은 권한 사용자도 `rest@internal`로 라우팅을 열 수 있습니다. `providers.rest.insecure=false` 설정을 우회해 Traefik 동적 설정 쓰기 권한을 얻는 문제입니다. 멀티테넌트 Kubernetes 환경에서는 라우터와 서비스 구성이 통째로 바뀔 수 있습니다.  
**대응**: `2.11.46`, `3.6.17`, `3.7.1` 이상으로 업데이트하세요. 동시에 shared Gateway 환경에서는 `@internal` backend 참조를 허용하는 정책이 없는지 바로 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-44774)

### [CRITICAL] CVE-2026-8181 — Burst Statistics plugin
**CVSS**: 9.8 | **영향**: WordPress Plugin  
**설명**: `Authorization` 헤더의 application password 검증 로직이 잘못되어 인증 우회가 가능합니다. 공격자는 관리자 username만 알면 아무 비밀번호로나 요청 하나 동안 관리자처럼 동작할 수 있습니다. WordPress 운영 사이트라면 관리자 권한 탈취와 동일한 수준입니다.  
**대응**: `3.4.0`부터 `3.4.1.1`까지 사용 중이면 즉시 비활성화하세요. 벤더 수정 버전이 나오면 바로 업데이트하고, 관리자 username 노출 여부도 함께 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-8181)

### [CRITICAL] CVE-2026-6271 — Career Section plugin
**CVSS**: 9.8 | **영향**: WordPress Plugin  
**설명**: CV 업로드 처리에서 파일 타입 검증이 없어, 인증 없는 공격자가 실행 가능한 파일을 업로드할 수 있습니다. 업로드 경로가 웹에서 실행 가능하면 바로 Remote Code Execution으로 이어집니다. 채용 폼이 공개된 사이트는 특히 위험합니다.  
**대응**: `1.7` 이하 전 버전은 즉시 비활성화하세요. 최소한 업로드 디렉터리 실행을 막고, 웹서버에서 스크립트 실행을 차단해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-6271)

### [CRITICAL] CVE-2026-6510 — InfusedWoo Pro
**CVSS**: 9.8 | **영향**: WordPress Plugin / WooCommerce  
**설명**: `iwar_save_recipe()` AJAX 핸들러에 nonce 검증과 권한 체크가 없습니다. 공격자는 악성 자동화 레시피를 만들어, 특정 URL 방문만으로 관리자 계정 로그인 쿠키를 발급받게 할 수 있습니다. 인증 우회와 권한 상승이 동시에 일어나는 구조입니다.  
**대응**: `5.1.2` 이하 사용 중이면 플러그인을 즉시 비활성화하세요. 패치 전에는 해당 AJAX 엔드포인트를 차단하고, 관리자 세션을 모두 재발급하는 것이 안전합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-6510)

### [CRITICAL] CVE-2025-11024 — Akilli E-Commerce Website
**CVSS**: 9.8 | **영향**: Web Application / Akilli E-Commerce Website  
**설명**: SQL query에서 특수 문자 처리가 제대로 되지 않아 Blind SQL Injection이 가능합니다. 공격자는 응답 차이를 이용해 데이터베이스 값을 조금씩 추출할 수 있습니다. 회원 정보, 주문 정보, 관리자 계정 데이터까지 노출될 수 있습니다.  
**대응**: `4.5.001` 이상으로 업데이트하세요. 동시에 직접 작성한 query가 있다면 prepared statement 사용 여부와 입력값 검증을 같이 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-11024)

## 이번 주 보안 트렌드

이번 주는 인증 우회, 권한 상승, 그리고 입력값 처리 실패가 핵심 패턴이었습니다. 특히 `HTTP header`, `REST API`, `file upload`, `deserialization`, `dynamic config`처럼 운영 기능과 바로 붙은 지점에서 치명적인 문제가 반복됐습니다.  
`npm`, `PyPI`, `Maven` 라이브러리를 쓰는 개발자도 남 일로 보면 안 됩니다. Node.js export 서버, Python 백오피스, Java API gateway처럼 보조 서비스 하나만 약해도 전체 시스템이 뚫립니다.  
지금 당장 해야 할 일은 세 가지입니다. 공개 업로드와 관리 API를 먼저 점검하고, 외부 노출된 플러그인·프록시·관리 도구 버전을 확인하고, 패치가 없으면 기능 자체를 잠시 끄는 것입니다.