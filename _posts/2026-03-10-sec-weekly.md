---
title: "[개발자 보안] 2026-03-10 주간 — 개발자가 주의해야 할 취약점"
date: 2026-03-10 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, python, java, go, rce, authentication, deserialization]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-24898 — OpenEMR
**CVSS**: 10 | **영향**: OpenEMR / PHP healthcare application  
**설명**: MedEx callback endpoint가 인증 없이 호출되고, `callback_key`만 보내면 MedEx 로그인 응답과 API token이 그대로 노출됩니다. 외부 공격자는 이 token으로 제3자 서비스 계정을 완전히 탈취하고, PHI 유출이나 임의 작업 수행까지 이어갈 수 있습니다. 의료 데이터와 연동 시스템을 함께 쓰는 프로젝트라면 영향이 매우 큽니다.  
**대응**: 즉시 `8.0.0` 이상으로 업데이트하세요. 그 전까지는 MedEx callback endpoint를 외부에서 차단하고, 노출 가능성이 있던 MedEx API token을 전부 재발급해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-24898)

### [CRITICAL] CVE-2026-20079 — Cisco Secure Firewall Management Center (FMC)
**CVSS**: 10 | **영향**: Cisco FMC / network security appliance  
**설명**: 부팅 시 생성되는 부적절한 시스템 프로세스 때문에, 인증 없는 원격 공격자가 crafted HTTP 요청만으로 인증을 우회하고 root 권한을 얻을 수 있습니다. 방화벽 관리 장비가 뚫리면 네트워크 정책 전체가 신뢰를 잃습니다. 내부망만 믿고 열어둔 관리 UI도 위험합니다.  
**대응**: Cisco가 제공한 보안 패치를 즉시 적용하세요. 동시에 FMC management interface를 인터넷에서 분리하고, 접근 가능한 IP를 최소화해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-20079)

### [CRITICAL] CVE-2026-20131 — Cisco Secure Firewall Management Center (FMC)
**CVSS**: 10 | **영향**: Cisco FMC / Java-based management interface  
**설명**: 웹 관리 인터페이스에서 user-supplied Java byte stream을 안전하게 처리하지 않아 insecure deserialization이 발생합니다. 인증 없는 공격자가 조작한 serialized object를 보내면 root 권한으로 임의 Java code를 실행할 수 있습니다. 관리 포트가 외부에 노출된 환경은 특히 즉시 대응이 필요합니다.  
**대응**: Cisco 보안 패치를 바로 적용하세요. 패치 전에는 management interface의 public exposure를 제거하고, 관리망 분리와 접근제어를 강하게 걸어야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-20131)

### [CRITICAL] CVE-2026-29000 — pac4j-jwt
**CVSS**: 10 | **영향**: Maven / Java authentication library  
**설명**: `JwtAuthenticator`가 encrypted JWT를 처리할 때 검증을 잘못해 authentication bypass가 가능합니다. 서버의 RSA public key만 알아도 공격자가 JWE-wrapped `PlainJWT`를 만들어 임의 사용자나 admin으로 로그인할 수 있습니다. SSO나 JWT 기반 인증을 쓰는 서비스라면 계정 신뢰 자체가 무너집니다.  
**대응**: `4.5.9`, `5.7.9`, `6.3.3` 이상으로 즉시 업데이트하세요. 업데이트 전에는 encrypted JWT 사용 여부를 점검하고, 의심 세션을 강제 만료시키는 것이 안전합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-29000)

### [CRITICAL] CVE-2026-29128 — IDC SFX2100 Satellite Receiver firmware
**CVSS**: 10 | **영향**: firmware / network routing components  
**설명**: `zebra`, `bgpd`, `ospfd`, `ripd` 설정 파일이 world-readable이고, 그 안에 평문 비밀번호가 들어 있습니다. 공격자는 이 하드코딩되거나 재사용된 credential을 이용해 다른 시스템으로 횡적 이동하거나 장비 권한을 높일 수 있습니다. 장비 하나의 문제로 끝나지 않고 네트워크 전체로 번질 수 있습니다.  
**대응**: 제조사 수정 펌웨어가 있으면 즉시 적용하세요. 그 전에는 관련 credential을 전부 교체하고, 동일 비밀번호 재사용 여부를 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-29128)

### [CRITICAL] CVE-2026-28289 — FreeScout
**CVSS**: 10 | **영향**: PHP / Laravel help desk application  
**설명**: 파일 업로드 이름 정제 과정에 TOCTOU flaw가 있어, zero-width space를 붙인 악성 `.htaccess` 파일로 기존 패치를 우회할 수 있습니다. 업로드 권한이 있는 인증 사용자라면 서버에서 RCE까지 가능합니다. 운영팀이나 고객지원 도구를 셀프호스팅 중이면 내부 계정 탈취만으로도 서버 장악으로 이어집니다.  
**대응**: `1.8.207` 이상으로 즉시 업데이트하세요. 임시로는 `.htaccess` 업로드를 차단하고, 업로드 디렉터리에서 스크립트 실행이 되지 않도록 웹서버 설정을 재점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28289)

### [CRITICAL] CVE-2026-24848 — OpenEMR
**CVSS**: 9.9 | **영향**: OpenEMR / PHP healthcare application  
**설명**: `EtherFaxActions.php`의 `disposeDocument()`가 인증 사용자가 서버 파일시스템의 임의 위치에 내용을 쓸 수 있게 합니다. 공격자는 이를 이용해 PHP web shell을 업로드하고 RCE를 달성할 수 있습니다. 멀티유저 환경에서는 낮은 권한 계정 하나가 전체 서버 장악으로 이어질 수 있습니다.  
**대응**: 영향받는 `7.0.4` 이하 버전을 계속 쓰고 있다면 즉시 최신 보안 버전으로 올리세요. 동시에 업로드 경로와 웹 루트의 쓰기 권한을 점검하고, 의심 PHP 파일 존재 여부를 확인해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-24848)

### [CRITICAL] CVE-2026-28466 — OpenClaw
**CVSS**: 9.9 | **영향**: OpenClaw / gateway and connected node hosts  
**설명**: gateway가 `node.invoke` 파라미터 내부 approval field를 제대로 sanitize하지 않아, 인증된 사용자가 exec approval gating을 우회할 수 있습니다. 그 결과 `system.run` 명령이 연결된 개발자 워크스테이션이나 CI runner에서 실행될 수 있습니다. 내부 자동화 도구라도 계정 하나가 뚫리면 피해가 큽니다.  
**대응**: `2026.2.14` 이상으로 업데이트하세요. 그 전에는 gateway credential 범위를 줄이고, 고위험 명령 실행 권한을 별도 격리하는 것이 필요합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28466)

### [CRITICAL] CVE-2026-30860 — WeKnora
**CVSS**: 9.9 | **영향**: Python ecosystem / LLM framework with PostgreSQL  
**설명**: database query validation이 PostgreSQL array, row expression 내부 child node를 재귀적으로 검사하지 않아 SQL injection 방어를 우회할 수 있습니다. 공격자는 위험한 PostgreSQL 함수와 large object, library loading 기능을 조합해 DB 서버에서 RCE를 얻을 수 있습니다. AI 검색 서비스라도 DB 계층이 곧 실행 계층이 될 수 있다는 점이 핵심입니다.  
**대응**: `0.2.12` 이상으로 즉시 업데이트하세요. 추가로 DB 계정 권한을 최소화하고, PostgreSQL에서 불필요한 위험 기능 사용 가능 여부를 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-30860)

### [CRITICAL] CVE-2026-3136 — Google Cloud Build
**CVSS**: 9.8 | **영향**: cloud CI/CD service  
**설명**: `GitHub Trigger Comment Control`의 authorization 문제로 원격 공격자가 build environment에서 임의 코드를 실행할 수 있었습니다. CI가 공격당하면 source code, secret, artifact pipeline이 함께 위험해집니다. 배포 자동화에 Cloud Build를 쓰는 팀이라면 공급망 관점에서 봐야 합니다.  
**대응**: 이 취약점은 `2026-01-26`에 이미 Google 측에서 패치했으며 고객 조치는 필요 없습니다. 다만 과거 build log, secret exposure, trigger 권한 설정은 한 번 점검하는 것이 좋습니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-3136)

## 이번 주 보안 트렌드

이번 주에는 인증 우회, insecure deserialization, 파일 업로드 우회, query validation 실패처럼 "입력 검증이 한 단계만 맞아도 뚫리는" 취약점이 많이 보였습니다.  
특히 admin UI, callback endpoint, CI/CD, JWT 인증, DB query builder처럼 신뢰 경계에 있는 기능이 집중적으로 공격받고 있습니다.  
Java 인증 라이브러리, PHP 백오피스, Python LLM 프레임워크, 네트워크 장비 관리 콘솔을 쓰는 개발자는 바로 영향권입니다.  
지금 당장은 dependency와 셀프호스팅 관리 UI 버전을 확인하고, 외부 노출된 관리 경로와 과한 권한 설정부터 줄이는 것이 가장 빠른 대응입니다.