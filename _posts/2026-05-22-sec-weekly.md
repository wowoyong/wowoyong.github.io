---
title: "[개발자 보안] 2026-05-22 주간 — 개발자가 주의해야 할 취약점"
date: 2026-05-22 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, python, java, go, rce, deserialization]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-5229 — Form Notify
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: LINE OAuth 로그인 뒤 사용자 식별을 할 때, 서버가 검증되지 않은 `form_notify_line_email` cookie 값을 신뢰합니다. 공격자는 자신의 LINE 계정으로 로그인 흐름을 진행하면서 피해자 이메일을 cookie에 주입해 다른 계정으로 인증될 수 있습니다. 관리자 계정까지 탈취될 수 있어 사이트 전체 권한이 넘어갑니다.  
**대응**: `Form Notify`를 즉시 최신 안전 버전으로 업데이트하세요. 패치 전에는 플러그인을 비활성화하고, LINE OAuth 로그인 연동을 잠시 중단하는 것이 안전합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-5229)

### [CRITICAL] CVE-2026-45772 — Turborepo
**CVSS**: 9.8 | **영향**: npm / JavaScript / TypeScript build tool  
**설명**: `Turborepo` 1.1.0 이상 2.9.14 미만은 신뢰할 수 없는 저장소에서 실행할 때 임의 코드 실행이 가능합니다. `turbo`가 패키지 매니저를 감지하려고 `yarn --version`을 실행하는 과정에서, 프로젝트 안의 악성 `.yarnrc.yml`과 `yarnPath`가 로드될 수 있습니다. 개발자 로컬 환경과 CI runner 모두 공격 지점이 됩니다.  
**대응**: `Turborepo`를 `2.9.14` 이상으로 업데이트하세요. 외부 저장소를 열어 `turbo`, `@turbo/codemod`, `@turbo/workspace` 명령을 실행하는 관행도 바로 점검해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-45772)

### [CRITICAL] CVE-2021-47965 — WP Super Edit
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: `WP Super Edit` 2.5.4 이하의 FCKeditor 업로드 기능에 파일 타입 검증이 없습니다. 공격자는 웹셸 같은 악성 파일을 그대로 업로드해 서버에서 실행할 수 있습니다. 이 경우 WordPress만이 아니라 웹 서버와 파일 시스템 전체가 장악될 수 있습니다.  
**대응**: 플러그인을 즉시 제거하거나 안전한 버전으로 교체하세요. 업로드 디렉터리의 실행 권한도 함께 점검하고, 이미 업로드된 의심 파일이 있는지 확인해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2021-47965)

### [CRITICAL] CVE-2026-46364 — phpMyFAQ
**CVSS**: 9.8 | **영향**: PHP application  
**설명**: `phpMyFAQ` 4.1.2 미만은 공개된 `/api/captcha` 엔드포인트에서 `User-Agent` 헤더를 SQL에 그대로 넣습니다. 인증 없이도 time-based blind SQL injection이 가능해, DB 안의 계정 정보, admin token, SMTP credential까지 추출될 수 있습니다. 입력값이 아닌 헤더도 공격면이라는 점이 핵심입니다.  
**대응**: `phpMyFAQ`를 `4.1.2` 이상으로 업데이트하세요. 당장 어렵다면 `/api/captcha` 접근을 제한하고, WAF나 reverse proxy에서 비정상 `User-Agent` 패턴을 차단하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-46364)

### [CRITICAL] CVE-2020-37228 — iDS6 DSSPro Digital Signage System
**CVSS**: 9.8 | **영향**: Digital Signage software  
**설명**: CAPTCHA 검증 객체인 `autoLoginVerifyCode`를 로그인 흐름에서 직접 가져올 수 있어 인증 우회가 가능합니다. 공격자는 유효한 CAPTCHA 값을 반복 확보한 뒤 계정 brute-force를 시도할 수 있습니다. 로그인 보호 장치가 사실상 무력화된 상태입니다.  
**대응**: 벤더 패치를 우선 적용하세요. 임시로는 외부 접근 제한, 계정 잠금 정책 강화, 관리자 계정의 비밀번호 교체와 MFA 적용이 필요합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2020-37228)

### [CRITICAL] CVE-2020-37239 — libbabl
**CVSS**: 9.8 | **영향**: C library  
**설명**: `libbabl` 0.1.62는 double free 탐지 로직이 깨져 있습니다. 이미 해제된 포인터를 다시 `babl_free()`에 넘겨도 탐지가 우회될 수 있고, 그 결과 메모리 손상과 코드 실행으로 이어질 수 있습니다. 네이티브 라이브러리를 직접 쓰는 이미지 처리 서버라면 영향이 큽니다.  
**대응**: 배포 환경에서 `libbabl` 사용 여부를 먼저 확인하고, 가능한 최신 버전으로 교체하세요. 직접 링크된 네이티브 의존성이 있다면 이미지 처리 기능을 별도 격리 프로세스로 분리하는 것도 필요합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2020-37239)

### [CRITICAL] CVE-2021-47952 — jsonpickle
**CVSS**: 9.8 | **영향**: PyPI / Python library  
**설명**: `jsonpickle` 2.0.0은 악성 JSON 안의 `py/repr` 객체를 역직렬화하면서 `eval` 경로를 탈 수 있습니다. 사용자가 보낸 JSON을 그대로 `jsonpickle.decode()` 하는 API는 원격 코드 실행으로 이어질 수 있습니다. 단순 데이터 파싱이라고 생각하고 넣은 코드가 바로 서버 권한 실행 지점이 됩니다.  
**대응**: `jsonpickle`를 안전한 버전으로 올리세요. 외부 입력 JSON에는 `jsonpickle` 대신 표준 `json` 라이브러리를 쓰고, 이미 사용 중이라면 untrusted input 경로를 즉시 차단해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2021-47952)

### [CRITICAL] CVE-2018-25320 — ACL Analytics
**CVSS**: 9.8 | **영향**: Desktop / analytics software  
**설명**: `ACL Analytics` 11.x ~ 13.0.0.579는 `EXECUTE` 기능을 통해 임의 명령 실행이 가능합니다. 공격자는 PowerShell 스크립트를 내려받아 시스템 권한으로 실행시키고 reverse shell까지 열 수 있습니다. 내부 분석 도구라도 실행 권한이 크면 피해는 서버 침해와 다르지 않습니다.  
**대응**: 영향 버전 사용을 중단하고 벤더 권고 버전으로 교체하세요. `EXECUTE` 사용 정책을 점검하고, 분석용 호스트의 outbound script 실행도 통제해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2018-25320)

### [CRITICAL] CVE-2018-25332 — GitBucket
**CVSS**: 9.8 | **영향**: Maven / Java server software  
**설명**: `GitBucket` 4.23.1은 약한 secret token 생성과 안전하지 않은 파일 업로드가 겹쳐 인증 없는 원격 코드 실행이 가능합니다. 공격자는 key를 brute-force한 뒤 악성 JAR plugin을 올리고 시스템 명령까지 실행할 수 있습니다. 사내 Git 서버가 이 버전이면 소스코드와 CI 비밀값까지 위험합니다.  
**대응**: 즉시 최신 안전 버전으로 업그레이드하세요. 외부 공개 중이라면 먼저 접근을 제한하고, plugin 업로드 이력과 비정상 JAR 파일 존재 여부를 확인해야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2018-25332)

### [CRITICAL] CVE-2018-25335 — Peugeot Music
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: `Peugeot Music` 1.0의 `upload.php`는 인증 없이 파일 업로드를 허용합니다. 공격자는 `name` 파라미터를 조작해 임의 확장자의 파일을 업로드하고, 업로드 디렉터리에서 코드를 실행할 수 있습니다. 공개된 WordPress 사이트에서는 즉시 웹셸 설치로 이어질 수 있습니다.  
**대응**: 플러그인을 즉시 삭제하거나 비활성화하세요. `uploads` 경로의 의심 파일을 점검하고, 웹 서버에서 스크립트 실행이 가능한 설정이 있다면 바로 막아야 합니다.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2018-25335)

## 이번 주 보안 트렌드

이번 주 취약점은 인증 우회, unsafe deserialization, 파일 업로드, 신뢰할 수 없는 설정 로딩이 반복됐습니다. 공통점은 "외부 입력을 코드나 계정 식별 정보로 바로 연결했다"는 점입니다.  
npm 생태계에서는 build tool과 CI 실행 경로를, PyPI에서는 JSON 역직렬화 지점을 특히 점검해야 합니다. Maven, PHP, WordPress 쪽은 plugin 업로드와 공개 엔드포인트 입력 검증이 핵심입니다.  
지금 당장 해야 할 일은 세 가지입니다. 의존성 버전 점검, 공개 업로드·로그인·captcha 엔드포인트 점검, 그리고 untrusted input을 실행 경로로 보내는 코드 제거입니다.