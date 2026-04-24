---
title: "[개발자 보안] 2026-04-24 주간 — 개발자가 주의해야 할 취약점"
date: 2026-04-24 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, java, go, rce, deserialization, ssrf]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-39861 — Claude Code
**CVSS**: 10.0 | **영향**: Claude Code
**설명**: Claude Code 2.1.64 미만에서는 sandbox 안에서 만든 symlink가 workspace 밖 경로를 가리켜도 차단되지 않았습니다. 이후 앱이 그 경로에 파일을 쓰면 unsandboxed process가 symlink를 따라가 외부 파일을 덮어쓸 수 있습니다. prompt injection으로 sandboxed code execution이 유도되면 로컬 코드 실행이나 중요 파일 변조로 이어질 수 있습니다.
**대응**: Claude Code를 2.1.64 이상으로 즉시 업데이트하세요. 임시로는 신뢰되지 않은 코드, 문서, prompt를 에이전트 컨텍스트에 넣지 말고 자동 실행 흐름을 제한하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-39861)

### [CRITICAL] CVE-2026-33819 — Microsoft Bing
**CVSS**: 10.0 | **영향**: Microsoft Bing
**설명**: 신뢰할 수 없는 데이터를 deserialize하는 과정에서 원격 코드 실행이 가능한 취약점입니다. 공격자는 네트워크를 통해 조작된 데이터를 주입해 서버 측 로직이 공격자 코드를 실행하게 만들 수 있습니다. 외부 서비스 연동이나 Bing 기반 기능을 사용하는 환경이면 간접 영향도 검토해야 합니다.
**대응**: Microsoft의 보안 업데이트를 즉시 적용하세요. Bing 관련 연동 기능이 있다면 입력 데이터 신뢰 경계를 다시 점검하고, 미확인 payload를 그대로 처리하는 경로를 차단하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33819)

### [CRITICAL] CVE-2026-35431 — Microsoft Entra ID Entitlement Management
**CVSS**: 10.0 | **영향**: Microsoft Entra ID Entitlement Management
**설명**: 이 취약점은 SSRF로 인해 내부 네트워크나 신뢰된 서비스로 서버가 대신 요청을 보내게 만들 수 있습니다. 인증 없이 네트워크를 통해 악용될 수 있어 내부 메타데이터, 관리 API, 사설 엔드포인트 노출 위험이 큽니다. Entra ID를 권한 관리에 쓰는 조직은 인증 체계 전체 영향까지 봐야 합니다.
**대응**: Microsoft가 제공하는 최신 패치를 우선 적용하세요. 임시로는 outbound allowlist, metadata endpoint 차단, 내부 관리 API의 네트워크 분리를 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-35431)

### [CRITICAL] CVE-2026-6643 — ADM VPN Clients
**CVSS**: 9.9 | **영향**: ADM VPN Clients
**설명**: unbounded `sscanf()`와 사용자 입력을 그대로 `printf()`에 넘기는 문제가 겹쳐 stack-based buffer overflow가 발생합니다. 인증된 원격 공격자는 이를 이용해 web server user 권한으로 임의 코드를 실행할 수 있습니다. PIE와 Stack Canary 보호가 없어 실제 악용 난도가 더 낮습니다.
**대응**: ADM 4.1.0~4.3.3.RR42, 5.0.0~5.1.2.REO1 사용 중이면 즉시 제조사 패치를 적용하세요. 당장 어렵다면 VPN 관리 인터페이스 외부 노출을 막고 관리자 계정 접근을 제한하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-6643)

### [CRITICAL] CVE-2026-41329 — OpenClaw
**CVSS**: 9.9 | **영향**: OpenClaw
**설명**: OpenClaw 2026.3.31 미만에서는 heartbeat context inheritance와 `senderIsOwner` 조작으로 sandbox 우회가 가능합니다. 공격자는 잘못 검증된 context를 이용해 권한을 끌어올리고 제한된 작업을 관리자 수준으로 실행할 수 있습니다. 에이전트형 실행 환경이라면 작업 격리 모델 자체가 무너집니다.
**대응**: OpenClaw를 2026.3.31 이상으로 업데이트하세요. 임시로는 외부 입력이 workflow context에 섞이지 않게 하고 owner 관련 플래그를 신뢰하지 않는 검증 로직을 추가하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41329)

### [CRITICAL] CVE-2026-34018 — CubeCart
**CVSS**: 9.8 | **영향**: CubeCart
**설명**: CubeCart 6.6.0 미만에는 SQL injection이 있어 공격자가 임의 SQL 구문을 실행할 수 있습니다. 입력값이 쿼리에 안전하게 바인딩되지 않으면 고객 정보 조회, 주문 데이터 변조, 관리자 계정 탈취까지 이어질 수 있습니다. 쇼핑몰 운영 서비스라면 바로 매출과 개인정보 이슈로 연결됩니다.
**대응**: CubeCart를 6.6.0 이상으로 업데이트하세요. 임시로는 취약 엔드포인트 접근을 WAF로 제한하고, 동적 SQL 사용 구간을 prepared statement로 교체하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-34018)

### [CRITICAL] CVE-2026-41242 — protobufjs
**CVSS**: 9.8 | **영향**: npm package `protobufjs`
**설명**: `protobufjs` 8.0.1 미만과 7.5.5 미만에서는 protobuf definition의 `type` 필드에 악성 코드를 주입할 수 있습니다. 애플리케이션이 그 definition으로 object decoding을 수행하면 JavaScript 코드가 실행됩니다. 외부 `.proto`나 schema를 받아 처리하는 Node.js 서비스는 직접적인 원격 코드 실행 위험이 있습니다.
**대응**: `protobufjs`를 8.0.1 이상 또는 7.5.5 이상으로 즉시 올리세요. 외부에서 받은 `.proto` 파일이나 동적 schema 로딩을 중지하고, 신뢰된 definition만 빌드 단계에서 포함하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41242)

### [CRITICAL] CVE-2026-5963 — EasyFlow .NET
**CVSS**: 9.8 | **영향**: EasyFlow .NET
**설명**: 인증 없이 악용 가능한 SQL Injection입니다. 공격자는 네트워크를 통해 임의 SQL을 주입해 데이터 조회, 수정, 삭제를 수행할 수 있습니다. 내부 결재 시스템이나 업무 데이터가 연결돼 있다면 서비스 신뢰성과 감사 로그까지 함께 흔들립니다.
**대응**: 벤더 보안 패치를 즉시 적용하세요. 임시로는 외부 접근 차단, 취약 기능 비활성화, DB 계정 권한 최소화부터 진행하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-5963)

### [CRITICAL] CVE-2026-5964 — EasyFlow .NET
**CVSS**: 9.8 | **영향**: EasyFlow .NET
**설명**: 이 취약점도 인증 없는 SQL Injection입니다. 공격자는 입력값 검증이 약한 지점을 통해 임의 쿼리를 실행하고 데이터 무결성을 깨뜨릴 수 있습니다. 같은 제품군을 운영 중이라면 단일 취약점이 아니라 구조적 문제로 보고 전체 입력 처리 구간을 점검해야 합니다.
**대응**: EasyFlow .NET 최신 보안 패치를 반영하세요. 함께 운영 중인 DB의 백업 상태를 확인하고, 의심 쿼리 로그와 관리자 계정 변경 이력도 확인하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-5964)

### [CRITICAL] CVE-2026-39918 — Vvveb
**CVSS**: 9.8 | **영향**: Vvveb
**설명**: Vvveb 1.0.8.1 미만의 설치 엔드포인트는 `subdir` POST 값을 검증 없이 `env.php`에 기록합니다. 공격자는 문자열 문맥을 깨고 PHP 코드를 주입해 인증 없이 원격 코드 실행을 달성할 수 있습니다. 설치 페이지가 외부에 열려 있다면 서버 장악으로 바로 이어질 수 있습니다.
**대응**: Vvveb를 1.0.8.1 이상으로 업데이트하세요. 아직 설치가 끝난 서비스라면 설치 엔드포인트를 즉시 비활성화하고, `env.php`와 웹 루트 파일 변조 여부를 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-39918)

## 이번 주 보안 트렌드

이번 주는 sandbox bypass, deserialization, SSRF, SQL Injection, code injection처럼 "입력을 믿는 순간 무너지는" 취약점이 많았습니다.  
특히 npm 생태계에서는 `protobufjs`처럼 개발 편의성을 위해 동적 처리하는 라이브러리가 바로 RCE로 이어질 수 있다는 점이 중요합니다.  
Node.js 백엔드, 사내 관리 도구, 설치형 CMS, .NET 업무 시스템, 에이전트형 개발 도구를 쓰는 팀은 외부 입력과 실행 경계를 다시 점검해야 합니다.  
지금 당장 할 일은 세 가지입니다. 의존성 업데이트, 외부 입력 기반 동적 실행 제거, 관리자·설치·내부 API 엔드포인트의 외부 노출 차단입니다.