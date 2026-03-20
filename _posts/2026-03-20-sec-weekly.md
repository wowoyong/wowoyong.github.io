---
title: "[개발자 보안] 2026-03-20 주간 — 개발자가 주의해야 할 취약점"
date: 2026-03-20 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, python, java, go, rce]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-31806 — FreeRDP
**CVSS**: 9.8 | **영향**: RDP client software  
**설명**: 악성 RDP server가 조작된 `SURFACE_BITS_COMMAND`를 보내면 `bmp.width`, `bmp.height` 검증 부족으로 heap buffer overflow가 발생합니다. 단순 연결만으로도 비정상 메모리 쓰기가 일어날 수 있고, 경우에 따라 원격 코드 실행으로 이어질 수 있습니다. 원격 데스크톱 기능을 쓰는 내부 운영 도구나 관리 서버가 특히 위험합니다.  
**대응**: `FreeRDP 3.24.0` 이상으로 즉시 업데이트하세요. 당장 업데이트가 어렵다면 신뢰되지 않은 RDP server 연결을 차단하고, 외부 접속용 RDP 경로를 최소화하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-31806)

### [CRITICAL] CVE-2026-3891 — Pix for WooCommerce
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: 인증 없이 파일 업로드가 가능한 취약점입니다. 권한 검사와 파일 형식 검증이 빠져 있어 공격자가 악성 PHP 파일 등을 서버에 올리고 실행할 수 있습니다. 결제 연동 WooCommerce 사이트가 뚫리면 주문 정보, 관리자 계정, 서버 전체가 함께 위험해집니다.  
**대응**: `1.5.0` 이하를 사용 중이면 즉시 최신 안전 버전으로 올리세요. 패치 전까지는 플러그인을 비활성화하고, 업로드 디렉터리의 실행 권한과 웹셸 흔적을 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-3891)

### [CRITICAL] CVE-2016-20024 — ZKTeco ZKTime.Net
**CVSS**: 9.8 | **영향**: Windows enterprise software  
**설명**: 설치 디렉터리와 실행 파일에 world-writable 권한이 설정되어 있어 일반 사용자도 실행 파일을 바꿔치기할 수 있습니다. 이후 서비스나 관리자 권한으로 해당 파일이 실행되면 privilege escalation이 가능합니다. 사내 출입통제 또는 근태 시스템이 이 소프트웨어에 묶여 있으면 운영망 전체 리스크로 번집니다.  
**대응**: 설치 경로와 실행 파일 권한을 즉시 재설정하고, 일반 사용자 쓰기 권한을 제거하세요. 실행 파일 무결성 점검과 관리자 권한 실행 경로도 함께 확인해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2016-20024)

### [CRITICAL] CVE-2016-20026 — ZKTeco ZKBioSecurity
**CVSS**: 9.8 | **영향**: Java/Tomcat-based enterprise software  
**설명**: 번들된 Apache Tomcat에 하드코딩 계정이 남아 있어 인증 없이 manager app 접근이 가능합니다. 공격자는 WAR 파일을 업로드해 JSP를 실행하고 SYSTEM 권한까지 얻을 수 있습니다. 내부망 전용이라고 방심하면 가장 먼저 악용될 수 있는 유형입니다.  
**대응**: `tomcat-users.xml`의 기본 계정을 즉시 제거하거나 변경하고, Tomcat manager 접근을 차단하세요. 외부 노출이 있다면 우선 네트워크 차단 후 침해 흔적과 배포된 WAR 파일을 조사해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2016-20026)

### [CRITICAL] CVE-2016-20030 — ZKTeco ZKBioSecurity
**CVSS**: 9.8 | **영향**: Web application  
**설명**: 로그인 요청의 응답 차이로 유효한 username을 추측할 수 있는 user enumeration 취약점입니다. 단독으로 끝나지 않고 brute force, password spraying, 계정 탈취 공격의 준비 단계로 악용됩니다. 인증 시스템을 직접 운영하는 팀이라면 같은 패턴이 없는지 꼭 봐야 합니다.  
**대응**: 로그인 실패 응답을 통일하고, rate limiting과 계정 보호 정책을 적용하세요. 접근 로그에서 반복적인 username 탐색 패턴도 함께 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2016-20030)

### [CRITICAL] CVE-2017-20223 — Telesquare SKT LTE Router SDT-CS3B1
**CVSS**: 9.8 | **영향**: Router firmware  
**설명**: 사용자 입력값 조작만으로 다른 객체나 기능에 직접 접근할 수 있는 IDOR 취약점입니다. 권한 검사가 약해 민감 정보 조회나 관리자 기능 접근이 가능할 수 있습니다. 사내 라우터나 IoT 장비 관리 화면이 있다면 같은 설계 실수가 없는지 봐야 합니다.  
**대응**: 제조사 보안 업데이트를 적용하세요. 임시로는 관리 UI 외부 노출을 막고, 인증 이후에도 서버 측 권한 검사를 강제해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2017-20223)

### [CRITICAL] CVE-2017-20224 — Telesquare SKT LTE Router SDT-CS3B1
**CVSS**: 9.8 | **영향**: Router firmware / WebDAV  
**설명**: WebDAV HTTP method가 활성화된 상태에서 인증 없이 파일 업로드와 삭제가 가능한 취약점입니다. 공격자는 `PUT`, `MOVE`, `DELETE` 등을 이용해 악성 파일을 올리거나 기존 파일을 바꿔 원격 코드 실행 또는 서비스 중단을 유발할 수 있습니다. 장비형 소프트웨어도 결국 웹 애플리케이션과 같은 기준으로 봐야 한다는 사례입니다.  
**대응**: 제조사 패치를 적용하고, 사용하지 않는 WebDAV method를 즉시 비활성화하세요. 관리 포트 외부 노출과 업로드 가능한 경로도 함께 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2017-20224)

### [CRITICAL] CVE-2025-69246 — Raytha CMS
**CVSS**: 9.8 | **영향**: .NET CMS  
**설명**: 로그인 시도 제한이 없어 공격자가 자동화된 brute force를 계속 보낼 수 있습니다. 계정 잠금, throttling, 추가 인증이 없으면 약한 비밀번호 계정부터 쉽게 뚫립니다. CMS 관리자 계정이 탈취되면 콘텐츠 변조, 관리자 추가, 내부 시스템 pivot까지 이어질 수 있습니다.  
**대응**: `Raytha CMS 1.4.6` 이상으로 업데이트하세요. 동시에 rate limiting, 계정 잠금, MFA를 적용하고 관리자 계정 비밀번호를 강하게 교체하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-69246)

### [CRITICAL] CVE-2026-32640 — SimpleEval
**CVSS**: 9.8 | **영향**: PyPI library  
**설명**: `SimpleEval` sandbox 내부에서 객체 속성이나 callback 경로를 통해 위험한 module, function에 접근할 수 있습니다. 사용자 입력 식을 평가하는 기능에 붙어 있으면 sandbox escape로 이어지고, 서버 내부 자원 접근이나 임의 코드 실행 위험이 생깁니다. Python에서 "간단한 수식 평가"를 붙일 때 특히 주의해야 합니다.  
**대응**: `SimpleEval 1.0.5` 이상으로 즉시 업데이트하세요. 패치 전까지는 사용자 입력 기반 expression evaluation을 중단하거나, 노출 객체와 callback 전달을 강하게 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-32640)

### [CRITICAL] CVE-2026-4163 — Wavlink WL-WN579A3
**CVSS**: 9.8 | **영향**: Router firmware  
**설명**: `/cgi-bin/wireless.cgi`의 `SetName/GuestWifi` 처리 과정에서 command injection이 발생합니다. 조작된 POST 요청만으로 원격에서 시스템 명령 실행이 가능하고, 공개 exploit도 나와 있어 실제 악용 가능성이 높습니다. 네트워크 장비 관리 페이지가 외부에 열려 있으면 매우 위험합니다.  
**대응**: 제조사 업데이트를 즉시 적용하세요. 그전에는 관리 인터페이스 외부 노출을 막고, guest WiFi 설정 요청 로그와 비정상 프로세스 실행 흔적을 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-4163)

## 이번 주 보안 트렌드

이번 주에는 "입력값 검증 부재", "권한 검사 누락", "기본 보안 설정 미흡"이 반복됐습니다. 파일 업로드, expression evaluation, 로그인, 관리자 기능처럼 흔한 기능에서 바로 치명적 취약점이 나왔습니다.  
특히 `npm`, `PyPI`, `Maven` 같은 생태계에서 외부 라이브러리를 붙여 쓰는 풀스택 개발자는 "이 기능이 편리한가"보다 "신뢰 경계가 어디인가"를 먼저 봐야 합니다. 사용자 입력을 실행, 해석, 업로드, 관리자 설정과 연결하는 코드는 이번 주처럼 가장 먼저 공격받습니다.  
지금 당장 해야 할 일은 세 가지입니다. 의존성 업데이트, 관리자 기능 접근 통제, 로그인과 업로드 기능의 기본 보안 설정 점검입니다.