---
title: "[개발자 보안] 2026-05-01 주간 — 개발자가 주의해야 할 취약점"
date: 2026-05-01 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, npm, java, go, rce]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-21515 — Azure IoT Central
**CVSS**: 9.9 | **영향**: Azure IoT Central
**설명**: Azure IoT Central에서 민감한 정보가 비인가 사용자에게 노출될 수 있습니다. 공격자는 네트워크를 통해 이 정보를 악용해 권한 상승을 시도할 수 있습니다. 관리 권한이 있는 계정이나 연동 서비스가 노출되면 프로젝트 전체 제어권으로 이어질 수 있습니다.
**대응**: Azure IoT Central 관련 보안 공지를 즉시 확인하고 최신 패치를 적용하세요. 관리자 계정, API 토큰, 연동 자격 증명을 전부 점검하고 불필요한 권한은 바로 제거하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-21515)

### [CRITICAL] CVE-2026-33076 — Roxy-WI
**CVSS**: 9.8 | **영향**: Roxy-WI
**설명**: Roxy-WI의 `haproxy_section_save` 인터페이스에 path traversal 기반 원격 코드 실행 취약점이 있습니다. 공격자는 파일 쓰기 경로를 조작해 scheduled task 영역에 악성 내용을 기록할 수 있습니다. 서버 운영 패널이 외부에 열려 있으면 곧바로 시스템 명령 실행으로 이어질 수 있습니다.
**대응**: `Roxy-WI 8.2.6.4` 이상으로 즉시 업데이트하세요. 업데이트 전까지는 관리 UI를 외부망에서 차단하고, 스케줄러 관련 파일 경로 권한을 최소화하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33076)

### [CRITICAL] CVE-2026-33078 — Roxy-WI
**CVSS**: 9.8 | **영향**: Roxy-WI
**설명**: Roxy-WI의 `haproxy_section_save` 함수에 SQL injection 취약점이 있습니다. URL path의 `server_ip` 값이 검증 없이 SQL 문자열에 들어가서 임의 쿼리 실행이 가능합니다. DB 변조, 인증 우회, 설정 탈취까지 연결될 수 있어 운영 서버 관리 환경에 매우 위험합니다.
**대응**: `Roxy-WI 8.2.6.4` 이상으로 업데이트하세요. 임시로는 관리 엔드포인트를 내부망으로 제한하고, 의심 요청 로그와 DB 변경 이력을 바로 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-33078)

### [CRITICAL] CVE-2026-25660 — CodeChecker
**CVSS**: 9.8 | **영향**: CodeChecker
**설명**: CodeChecker에서 특정 URL 호출 패턴으로 인증을 우회할 수 있습니다. 이 취약점은 기존 사용자에게 임의 권한을 부여할 수 있게 만듭니다. 내부 품질 도구라고 방심하면 안 되고, CI/CD와 연결된 계정 권한이 탈취되면 배포 파이프라인까지 영향이 갈 수 있습니다.
**대응**: `CodeChecker 6.27.3` 이하를 사용 중이면 즉시 보안 수정 버전으로 올리세요. 외부 접근을 막고, 관리자 및 서비스 계정 권한을 재검토하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-25660)

### [CRITICAL] CVE-2026-39920 — BridgeHead FileStore
**CVSS**: 9.8 | **영향**: BridgeHead FileStore
**설명**: `BridgeHead FileStore 24A` 이전 버전은 Apache Axis2 관리 모듈이 네트워크에 노출되고 기본 계정도 남아 있습니다. 공격자는 기본 자격 증명으로 로그인한 뒤 악성 Java archive를 올려 OS 명령을 실행할 수 있습니다. 백업 서버나 저장소 서버가 뚫리면 데이터 유출과 랜섬웨어 확산 위험이 큽니다.
**대응**: `24A` 이상으로 즉시 업데이트하세요. Axis2 admin endpoint를 외부에서 차단하고, 기본 계정과 비밀번호가 남아 있는지 바로 확인하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-39920)

### [CRITICAL] CVE-2026-41676 — rust-openssl
**CVSS**: 9.8 | **영향**: Rust crate / OpenSSL binding
**설명**: `rust-openssl 0.9.27`부터 `0.10.78` 미만에서 `Deriver::derive`와 `PkeyCtxRef::derive` 호출 시 버퍼 길이 검증이 OpenSSL 1.1.x 동작과 어긋납니다. 짧은 버퍼를 넘기면 safe Rust 코드에서도 heap 또는 stack overflow가 발생할 수 있습니다. Rust 서비스라도 네이티브 crypto binding을 쓰면 메모리 손상으로 프로세스 크래시나 잠재적 RCE 위험이 생깁니다.
**대응**: `rust-openssl 0.10.78` 이상으로 업데이트하세요. 특히 OpenSSL 1.1.x 기반 배포 환경이면 우선순위를 높여 점검하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41676)

### [CRITICAL] CVE-2026-41678 — rust-openssl
**CVSS**: 9.8 | **영향**: Rust crate / OpenSSL binding
**설명**: `rust-openssl 0.10.78` 미만의 `aes::unwrap_key()`는 출력 버퍼 크기 검사를 반대로 하고 있습니다. 그 결과 너무 작은 버퍼도 통과해 out-of-bounds write가 발생할 수 있습니다. 암호화 키 처리 로직에서 메모리 손상이 나면 서비스 장애나 예측 불가능한 보안 문제가 생깁니다.
**대응**: `rust-openssl 0.10.78` 이상으로 업데이트하세요. 자체 wrapper가 있다면 `unwrap_key()` 입력과 출력 버퍼 길이 검증도 함께 추가하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41678)

### [CRITICAL] CVE-2026-41681 — rust-openssl
**CVSS**: 9.8 | **영향**: Rust crate / OpenSSL binding
**설명**: `rust-openssl 0.10.39`부터 `0.10.78` 미만에서 `MdCtxRef::digest_final()`이 출력 버퍼보다 큰 길이를 써버릴 수 있습니다. 이 동작은 safe Rust 경로에서도 stack corruption으로 이어질 수 있습니다. 해시 처리 로직이 많은 인증, 서명, 파일 검증 기능에 직접 영향을 줍니다.
**대응**: `rust-openssl 0.10.78` 이상으로 업데이트하세요. 해시 결과 버퍼를 직접 다루는 유틸 함수가 있으면 길이 계산도 함께 재검토하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41681)

### [CRITICAL] CVE-2026-41898 — rust-openssl
**CVSS**: 9.8 | **영향**: Rust crate / OpenSSL binding
**설명**: `rust-openssl 0.9.24`부터 `0.10.78` 미만에서 일부 callback이 반환한 `usize`를 버퍼 크기 검증 없이 OpenSSL에 전달합니다. 잘못된 길이 값이 그대로 넘어가면 buffer overflow가 발생할 수 있습니다. TLS, PSK, cookie callback을 쓰는 네트워크 서비스는 특히 주의해야 합니다.
**대응**: `rust-openssl 0.10.78` 이상으로 업데이트하세요. callback 기반 crypto/TLS 확장 로직이 있다면 unsafe 경계 검증도 다시 확인하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41898)

### [CRITICAL] CVE-2026-7037 — Totolink A8000RU
**CVSS**: 9.8 | **영향**: Totolink A8000RU firmware
**설명**: `Totolink A8000RU 7.1cu.643_b20200521`의 CGI Handler에서 `pptpPassThru` 값을 조작하면 OS command injection이 가능합니다. 원격에서 바로 악용할 수 있고, 공개 익스플로잇도 이미 나와 있습니다. 테스트용 장비나 사무실 라우터라도 개발망에 연결돼 있으면 내부 시스템으로 pivot 될 수 있습니다.
**대응**: 제조사 펌웨어 업데이트를 즉시 확인하고 적용하세요. 당장 패치가 어렵다면 관리자 페이지 외부 노출을 막고, 해당 장비를 개발망과 분리하세요.
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-7037)

## 이번 주 보안 트렌드

이번 주 취약점은 인증 우회, SQL injection, path traversal, command injection, buffer overflow처럼 기본 검증 실패가 핵심입니다. 입력값 검증이 빠지거나, 버퍼 크기와 권한 경계가 틀어질 때 바로 치명적인 권한 상승이나 RCE로 이어졌습니다. `npm`, `PyPI`, `Maven`뿐 아니라 `Rust crate` 같은 네이티브 바인딩 의존성도 안전하지 않다는 점이 중요합니다. 관리 UI, 운영 도구, crypto binding, 네트워크 장비를 함께 쓰는 풀스택 개발자는 이번 주에 의존성 버전 점검과 관리 엔드포인트 외부 노출 차단을 가장 먼저 해야 합니다.