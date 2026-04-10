---
title: "[개발자 보안] 2026-04-10 주간 — 개발자가 주의해야 할 취약점"
date: 2026-04-10 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, java, go, authentication, ssrf]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-32213 — Azure AI Foundry
**CVSS**: 10 | **영향**: Microsoft Azure service  
**설명**: Azure AI Foundry의 authorization 처리에 문제가 있습니다. 네트워크를 통해 권한이 없는 공격자가 더 높은 권한을 얻을 수 있습니다. AI 워크로드, 모델 배포, 연결된 리소스 접근 범위가 함께 확대될 수 있어 영향이 큽니다.  
**대응**: Microsoft 보안 공지와 패치 적용 상태를 즉시 확인하세요. Azure RBAC 최소 권한, 관리 포털 접근 제한, 서비스 계정 점검, 이상 권한 상승 로그 모니터링을 바로 적용해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-32213)

### [CRITICAL] CVE-2026-33105 — Azure Kubernetes Service
**CVSS**: 10 | **영향**: Microsoft Azure service  
**설명**: Azure Kubernetes Service에서 authorization 우회로 권한 상승이 가능합니다. 공격자는 네트워크 경유로 더 높은 클러스터 권한을 확보할 수 있습니다. 한 번 성공하면 워크로드 제어, Secret 접근, 내부 서비스 이동으로 이어질 수 있습니다.  
**대응**: Microsoft 패치와 안내를 우선 확인하세요. 클러스터 관리자 권한을 최소화하고, public endpoint 노출을 줄이고, ServiceAccount 권한과 RoleBinding 구성을 즉시 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33105)

### [CRITICAL] CVE-2026-33107 — Azure Databricks
**CVSS**: 10 | **영향**: Microsoft Azure service  
**설명**: Azure Databricks에 SSRF 취약점이 있습니다. 공격자는 서버가 내부 네트워크나 메타데이터 엔드포인트로 요청을 보내게 만들 수 있습니다. 그 결과 내부 자격 증명 노출이나 추가 권한 상승으로 이어질 수 있습니다.  
**대응**: Microsoft 대응 공지와 패치 상태를 확인하세요. 메타데이터 엔드포인트 접근 차단, outbound 네트워크 제한, internal-only 서비스 분리, 비정상 요청 로그 점검이 필요합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33107)

### [CRITICAL] CVE-2026-32186 — Microsoft Bing
**CVSS**: 10 | **영향**: Microsoft service  
**설명**: Microsoft Bing에서 SSRF가 발생할 수 있습니다. 공격자가 서비스가 대신 내부 대상에 요청을 보내도록 유도할 수 있다는 뜻입니다. 내부 시스템 조회, 민감 정보 노출, 후속 권한 상승 가능성이 있습니다.  
**대응**: Bing 자체를 운영하는 경우는 드물지만, 연동 서비스나 엔터프라이즈 기능을 쓰는 팀은 Microsoft 공지를 확인해야 합니다. 내부 endpoint 보호, allowlist 기반 outbound 통신, 메타데이터 접근 차단을 적용하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-32186)

### [CRITICAL] CVE-2026-34208 — SandboxJS
**CVSS**: 10 | **영향**: npm / JavaScript library  
**설명**: SandboxJS는 격리된 JavaScript 실행을 위한 라이브러리입니다. 하지만 `this.constructor.call(...)` 경로를 통해 host global object를 수정할 수 있습니다. 샌드박스가 깨지면 같은 프로세스의 다른 실행 컨텍스트까지 오염될 수 있어 매우 위험합니다.  
**대응**: `SandboxJS 0.8.36` 이상으로 즉시 업데이트하세요. 업데이트 전에는 untrusted code 실행을 중단하거나, 별도 프로세스 격리와 강한 runtime 제한을 같이 적용해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-34208)

### [CRITICAL] CVE-2026-23696 — Windmill CE / EE
**CVSS**: 9.9 | **영향**: self-hosted workflow platform  
**설명**: Windmill의 folder ownership 관리 기능에 SQL injection이 있습니다. 인증된 사용자가 `owner` 파라미터를 조작해 DB에서 JWT signing secret과 admin 식별자를 읽을 수 있습니다. 이후 admin token 위조와 workflow endpoint를 통한 임의 코드 실행까지 이어집니다.  
**대응**: `1.603.2` 초과 버전으로 즉시 업데이트하세요. 당장 어렵다면 folder ownership 관련 기능 접근을 제한하고, JWT secret 교체, admin token 재발급, 의심 쿼리 로그를 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-23696)

### [CRITICAL] CVE-2017-20237 — Hirschmann Industrial HiVision
**CVSS**: 9.8 | **영향**: network management software  
**설명**: master service에 authentication bypass가 있습니다. 공격자는 인증 없이 원격 서비스 인터페이스를 호출해 관리자 권한으로 명령을 실행할 수 있습니다. 사실상 원격 코드 실행과 동일한 수준의 영향입니다.  
**대응**: `06.0.07`, `07.0.03` 이상으로 업데이트하세요. 외부 네트워크 노출을 즉시 차단하고, 관리 인터페이스를 내부망으로 제한하며, 장비 접근 로그를 확인해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2017-20237)

### [CRITICAL] CVE-2018-25237 — Hirschmann HiSecOS
**CVSS**: 9.8 | **영향**: network security appliance  
**설명**: RADIUS authentication이 활성화된 HTTPS login 인터페이스에서 buffer overflow가 발생합니다. 128자를 넘는 비밀번호 입력으로 서비스 중단이나 원격 코드 실행이 가능합니다. 경계 검사 실패가 직접적인 원인입니다.  
**대응**: `05.3.03` 이상으로 업데이트하세요. 그전에는 RADIUS 기반 원격 로그인 노출을 줄이고, 관리 인터페이스를 제한하며, 비정상 로그인 시도를 탐지해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2018-25237)

### [CRITICAL] CVE-2026-27634 — Piwigo
**CVSS**: 9.8 | **영향**: PHP web application  
**설명**: Piwigo의 date filter 파라미터가 SQL에 그대로 붙습니다. 인증 없이도 공격자가 DB 내용을 읽을 수 있고, user password hash 같은 민감 정보까지 노출될 수 있습니다. 공개 서비스라면 바로 스캔 대상이 될 가능성이 높습니다.  
**대응**: `Piwigo 16.3.0` 이상으로 업데이트하세요. 당장 어렵다면 해당 API와 필터 기능을 WAF로 차단하고, DB 계정 권한 축소와 password reset 범위를 검토해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-27634)

### [CRITICAL] CVE-2017-20234 — GarrettCom Magnum 6K / 10K
**CVSS**: 9.8 | **영향**: managed switch firmware  
**설명**: 인증 메커니즘에 hardcoded string이 있어 login bypass가 가능합니다. 공격자는 정상 계정 없이 관리 기능과 설정 정보에 접근할 수 있습니다. 네트워크 장비가 뚫리면 서비스 전체 신뢰 경계가 무너집니다.  
**대응**: 제조사 보안 업데이트를 즉시 확인하고 적용하세요. 관리 포트를 외부에 노출하지 말고, ACL로 접근 대상을 제한하며, 설정 변경 이력을 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2017-20234)

## 이번 주 보안 트렌드

이번 주는 `authorization`, `SSRF`, `SQL injection`, `sandbox escape`처럼 신뢰 경계를 깨는 취약점이 많았습니다. 공통점은 한 번 뚫리면 단순 정보 노출에서 끝나지 않고 권한 상승이나 코드 실행으로 바로 이어진다는 점입니다. `npm`으로 untrusted code 실행 기능을 붙였거나, `PyPI`나 `Maven` 기반 self-hosted 운영 도구를 사내에 두고 있는 팀은 특히 주의해야 합니다. 클라우드 managed service를 쓰는 팀도 안전하지 않습니다. 라이브러리 업데이트만 볼 것이 아니라 IAM, 네트워크 차단, secret 교체, 로그 점검까지 같이 해야 합니다.