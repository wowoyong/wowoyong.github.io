---
title: "[개발자 보안] 2026-06-05 주간 — 개발자가 주의해야 할 취약점"
date: 2026-06-05 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, go]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-48567 — Azure HorizonDB
**CVSS**: 10 | **영향**: Azure HorizonDB  
**설명**: 네트워크를 통해 인증 우회가 가능한 취약점입니다. 공격자는 신원을 위조해 권한을 상승시킬 수 있습니다.  
권한 상승이 성공하면 데이터 접근, 설정 변경, 관리자 기능 악용으로 이어질 수 있습니다.  
**대응**: Azure HorizonDB 사용 여부를 즉시 확인하세요. 벤더 보안 공지를 확인해 패치를 적용하고, 관리 API와 데이터베이스 접근 경로를 사설망 또는 허용된 IP로 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-48567)

### [CRITICAL] CVE-2026-8732 — WP Maps Pro plugin for WordPress
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: WP Maps Pro plugin 6.1.0 이하 버전에서 인증되지 않은 공격자가 관리자 계정을 만들 수 있습니다.  
프론트엔드에 노출된 nonce가 접근 제어처럼 사용되어 보호가 무력화됩니다. 공격자는 생성된 관리자 계정으로 사이트를 완전히 장악할 수 있습니다.  
**대응**: WP Maps Pro plugin을 즉시 최신 버전으로 업데이트하세요. 패치 전에는 플러그인을 비활성화하고, 관리자 계정 목록에서 알 수 없는 계정을 삭제하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-8732)

### [CRITICAL] CVE-2026-3655 — OTP Login With Phone Number, OTP Verification plugin for WordPress
**CVSS**: 9.8 | **영향**: WordPress plugin  
**설명**: OTP Login With Phone Number, OTP Verification plugin 1.8.50부터 1.8.60까지 영향을 받습니다.  
Firebase OTP 검증 세션과 요청된 전화번호가 제대로 연결되지 않습니다. 공격자는 자신의 OTP 세션을 검증한 뒤 피해자의 전화번호를 넣어 피해자 계정으로 로그인할 수 있습니다.  
**대응**: 플러그인을 최신 버전으로 업데이트하세요. 패치 전에는 해당 OTP 로그인 기능을 비활성화하고, 관리자 계정의 최근 로그인 기록을 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-3655)

### [CRITICAL] CVE-2026-49199 — MQTT device firmware
**CVSS**: 9.8 | **영향**: MQTT 기반 장비  
**설명**: 조작된 MQTT 메시지로 command injection이 발생할 수 있습니다.  
공격자는 대상 장비에서 root 권한으로 코드를 실행할 수 있습니다. MQTT 브로커나 장비가 외부에서 접근 가능하면 위험이 커집니다.  
**대응**: 영향을 받는 장비의 펌웨어 업데이트를 확인하세요. MQTT 포트는 외부 공개를 막고, 인증과 ACL을 적용하며, 신뢰할 수 없는 토픽 구독을 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-49199)

### [CRITICAL] CVE-2025-41269 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040의 Console WebUI에서 OS command injection이 가능합니다.  
인증되지 않은 원격 공격자가 운영체제 명령을 실행할 수 있습니다. 장비 제어권 탈취와 내부망 침투로 이어질 수 있습니다.  
**대응**: 벤더 패치를 확인해 즉시 적용하세요. 패치 전에는 Console WebUI를 인터넷에 노출하지 말고, VPN 또는 관리망에서만 접근하게 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41269)

### [CRITICAL] CVE-2025-41270 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040에서 OS command injection이 보고되었습니다.  
공격자는 인증 없이 Console WebUI를 통해 임의 명령을 실행할 수 있습니다. 장비가 운영망과 연결되어 있다면 영향 범위가 더 커집니다.  
**대응**: 벤더 업데이트를 적용하세요. 임시로 Console WebUI 접근을 차단하고, 방화벽에서 관리 포트를 허용된 관리자 IP로 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41270)

### [CRITICAL] CVE-2025-41272 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040의 Console WebUI에 OS command injection 취약점이 있습니다.  
인증 전 단계에서 악성 입력이 명령어로 실행될 수 있습니다. 공격 성공 시 장비 내부 파일 접근과 명령 실행이 가능합니다.  
**대응**: 보안 패치를 적용하세요. 패치 전에는 Console WebUI를 비활성화하거나 관리망 내부에서만 접근 가능하게 설정하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41272)

### [CRITICAL] CVE-2025-41273 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040에서 우회 경로를 통한 인증 우회가 가능합니다.  
공격자는 로그인 없이 Console WebUI에서 인증된 사용자처럼 동작할 수 있습니다. 설정 변경이나 추가 공격의 발판이 될 수 있습니다.  
**대응**: 벤더 패치를 적용하세요. Console WebUI 접근 로그를 확인하고, 패치 전까지 외부 접근을 차단하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41273)

### [CRITICAL] CVE-2025-41274 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040의 Console WebUI에서 OS command injection이 발생합니다.  
원격의 인증되지 않은 공격자가 시스템 명령을 실행할 수 있습니다. 보안 장비 자체가 공격 경로가 될 수 있어 위험합니다.  
**대응**: 최신 보안 업데이트를 적용하세요. Console WebUI는 인터넷에서 접근할 수 없게 하고, 관리 계정과 접근 로그를 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41274)

### [CRITICAL] CVE-2025-41275 — Waterfall WF-500 TX/RX Hosts
**CVSS**: 9.8 | **영향**: Waterfall WF-500 Console WebUI  
**설명**: Waterfall WF-500 TX/RX Hosts 7.9.1.0 R2502171040에서 OS command injection 취약점이 확인되었습니다.  
공격자는 인증 없이 장비에서 임의 명령을 실행할 수 있습니다. 장비 권한 탈취 후 내부 네트워크 공격으로 이어질 수 있습니다.  
**대응**: 벤더 패치를 적용하세요. 패치 전에는 관리 UI 접근을 제한하고, 의심스러운 요청과 신규 계정 생성 여부를 확인하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2025-41275)

## 이번 주 보안 트렌드

이번 주 취약점은 인증 우회와 command injection이 중심입니다.  
WordPress plugin처럼 프론트엔드에 노출된 값이 접근 제어로 잘못 쓰이면 바로 계정 탈취로 이어질 수 있습니다.  
MQTT, WebUI, 관리 콘솔처럼 운영 환경에 붙어 있는 인터페이스는 외부 노출 여부를 먼저 확인해야 합니다.  
WordPress를 운영하는 개발자, IoT 또는 산업 장비와 연동하는 백엔드 개발자, MQTT 기반 시스템을 다루는 개발자는 이번 주 패치와 접근 제어 점검을 우선 처리해야 합니다.