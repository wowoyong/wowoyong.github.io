---
title: "[개발자 보안] 2026-04-03 주간 — 개발자가 주의해야 할 취약점"
date: 2026-04-03 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, python, java, go, deserialization, ssrf]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-28505 — Tautulli
**CVSS**: 10 | **영향**: Python software
**설명**: `notification_handler.py`의 `str_eval()`가 중첩된 `lambda` 내부 코드를 제대로 검사하지 못합니다. 공격자는 알림 템플릿에 우회 코드를 넣어 sandboxed `eval()` 제한을 깨고 임의 코드를 실행할 수 있습니다. 서버에서 Tautulli를 운영 중이면 곧바로 시스템 장악으로 이어질 수 있습니다.
**대응**: `2.17.0` 이상으로 즉시 업데이트하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-28505)

### [CRITICAL] CVE-2026-34162 — FastGPT
**CVSS**: 10 | **영향**: AI Agent platform
**설명**: `/api/core/app/httpTools/runTool` 엔드포인트가 인증 없이 열려 있습니다. 이 API는 `baseUrl`, `headers`, `body`를 그대로 받아 서버가 대신 HTTP 요청을 보내는 full HTTP proxy처럼 동작합니다. 외부에 노출된 경우 SSRF, 내부망 스캔, 민감 정보 탈취로 바로 연결됩니다.
**대응**: `4.14.9.5` 이상으로 업데이트하고, 그전까지는 해당 엔드포인트를 외부에서 차단하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-34162)

### [CRITICAL] CVE-2026-33945 — Incus
**CVSS**: 9.9 | **영향**: container / VM manager
**설명**: `systemd.credential.*` 설정 키에 경로 순회 문자열을 넣으면 `credentials` 디렉터리 밖으로 파일을 쓸 수 있습니다. 공격자는 root 권한으로 임의 파일을 덮어써 권한 상승이나 서비스 장애를 일으킬 수 있습니다. 컨테이너 호스트 자체가 위험해집니다.
**대응**: `6.23.0` 이상으로 업데이트하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33945)

### [CRITICAL] CVE-2026-32922 — OpenClaw
**CVSS**: 9.9 | **영향**: device management software
**설명**: `device.token.rotate`가 호출자의 현재 scope를 넘는 권한으로 새 토큰을 발급할 수 있습니다. `operator.pairing` 권한만 있어도 `operator.admin` 수준 토큰을 만들 수 있어 원격 코드 실행이나 gateway 관리자 권한 탈취가 가능합니다. 권한 모델이 무너지는 전형적인 취약점입니다.
**대응**: `2026.3.11` 이상으로 업데이트하고, 기존 발급 토큰도 함께 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-32922)

### [CRITICAL] CVE-2026-33701 — OpenTelemetry Java Instrumentation
**CVSS**: 9.8 | **영향**: Maven / Java agent
**설명**: RMI instrumentation이 역직렬화 데이터를 serialization filter 없이 처리합니다. `-javaagent` 사용, JDK 16 이하, 외부에서 접근 가능한 JMX/RMI 포트, gadget chain 라이브러리 존재 조건이 겹치면 원격 코드 실행이 가능합니다. 모니터링용 에이전트가 오히려 침입 지점이 되는 사례입니다.
**대응**: JDK 17 이상이면 업그레이드를 권장하고, JDK 16 이하면 `2.26.1` 이상으로 올리세요. 임시로는 `-Dotel.instrumentation.rmi.enabled=false`를 설정하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33701)

### [CRITICAL] CVE-2026-33890 — MyTube
**CVSS**: 9.8 | **영향**: self-hosted web application
**설명**: passkey 등록 엔드포인트가 인증 없이 열려 있어 공격자가 임의 passkey를 먼저 등록할 수 있습니다. 이후 해당 passkey로 로그인하면 자동으로 admin 세션이 발급됩니다. 기존 계정 정보가 없어도 서비스 전체를 탈취할 수 있습니다.
**대응**: `1.8.71` 이상으로 즉시 업데이트하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33890)

### [CRITICAL] CVE-2026-27650 — BUFFALO Wi-Fi router products
**CVSS**: 9.8 | **영향**: network appliance
**설명**: 입력값 검증 부족으로 OS command injection이 발생합니다. 공격자는 라우터에서 임의 시스템 명령을 실행할 수 있어 네트워크 장비 자체를 장악할 수 있습니다. 사무실, 개발실, 테스트망 라우터가 침해되면 내부망 전체가 위험해집니다.
**대응**: 제조사 보안 공지 기준 최신 펌웨어로 업데이트하고, 관리 페이지 외부 노출을 즉시 차단하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-27650)

### [CRITICAL] CVE-2026-32669 — BUFFALO Wi-Fi router products
**CVSS**: 9.8 | **영향**: network appliance
**설명**: 제품 내부에서 code injection이 가능한 취약점입니다. 공격자가 라우터 프로세스 문맥에서 임의 코드를 실행하면 설정 변조, 트래픽 가로채기, 추가 악성코드 설치가 가능합니다. 개발용 네트워크 장비도 예외가 아닙니다.
**대응**: 제조사 최신 펌웨어로 업데이트하고, 원격 관리 기능이 켜져 있다면 우선 비활성화하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-32669)

### [CRITICAL] CVE-2026-33280 — BUFFALO Wi-Fi router products
**CVSS**: 9.8 | **영향**: network appliance
**설명**: 숨겨진 debugging 기능에 접근할 수 있어 임의 OS command 실행이 가능합니다. 이런 백도어성 기능은 인증 우회와 결합되면 탐지 없이 악용되기 쉽습니다. 네트워크 경계 장비가 뚫리면 애플리케이션 방어선도 함께 무너집니다.
**대응**: 제조사 최신 펌웨어를 적용하고, 디버그 인터페이스 접근 경로를 차단하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33280)

### [CRITICAL] CVE-2026-25101 — Bludit
**CVSS**: 9.8 | **영향**: PHP CMS
**설명**: 로그인 전 설정된 세션 ID가 로그인 후에도 그대로 유지됩니다. 공격자가 피해자 브라우저에 세션 ID를 고정시킨 뒤, 피해자가 로그인하면 같은 세션으로 인증된 상태를 가로챌 수 있습니다. 전형적인 session fixation 취약점입니다.
**대응**: `3.17.2` 이상으로 업데이트하세요. 추가로 로그인 직후 세션 재발급이 제대로 되는지 직접 확인하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-25101)

## 이번 주 보안 트렌드

이번 주에는 인증 누락, 권한 검증 실패, sandbox 우회처럼 "신뢰 경계가 약한 지점"이 집중적으로 터졌습니다.  
특히 admin 도구, self-hosted 서비스, observability agent, container manager처럼 운영 편의를 위해 붙인 기능이 공격 표면이 되고 있습니다.  
npm, PyPI, Maven 라이브러리를 쓰는 풀스택 개발자는 애플리케이션 코드만 볼 게 아니라, 에이전트, 플러그인, 관리 API, 인프라 주변 도구 버전도 같이 점검해야 합니다.  
지금 당장은 외부 노출된 관리 엔드포인트를 줄이고, 권한 scope 검증, 세션 재발급, unsafe eval 및 deserialization 사용 여부를 우선 확인하는 것이 맞습니다.