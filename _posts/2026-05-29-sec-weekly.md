---
title: "[개발자 보안] 2026-05-29 주간 — 개발자가 주의해야 할 취약점"
date: 2026-05-29 09:00:00 +0900
categories: [개발자 보안, CVE]
tags: [security, cve, vulnerability, java, go, rce, authentication, deserialization]
---
## 이번 주 주요 취약점

### [CRITICAL] CVE-2026-23652 — Microsoft Power Pages
**CVSS**: 10 | **영향**: Microsoft Power Pages  
**설명**: Microsoft Power Pages에서 command injection 취약점이 발견되었습니다. 인증되지 않은 공격자가 네트워크를 통해 특수 문자가 포함된 입력을 보내 서버에서 임의 코드를 실행할 수 있습니다. 외부에 공개된 Power Pages 사이트라면 원격 코드 실행 위험이 큽니다.  
**대응**: Microsoft 보안 업데이트 적용 여부를 확인하세요. 임시로 외부 입력 검증을 강화하고, 의심스러운 요청 로그를 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-23652)

### [CRITICAL] CVE-2026-40412 — Azure Orbital Spatio
**CVSS**: 10 | **영향**: Azure Orbital Spatio  
**설명**: Azure Orbital Spatio에서 위험한 파일 형식 업로드가 제한되지 않는 취약점입니다. 인증되지 않은 공격자가 악성 파일을 업로드해 네트워크를 통해 코드를 실행할 수 있습니다. 파일 업로드 기능이 외부에 노출된 서비스라면 즉시 확인이 필요합니다.  
**대응**: Microsoft 보안 업데이트와 서비스 권고를 확인하세요. 업로드 파일 확장자, MIME type, 실행 권한을 제한하고 업로드 경로에서 스크립트 실행을 차단하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-40412)

### [CRITICAL] CVE-2026-41104 — Microsoft Planetary Computer Pro
**CVSS**: 10 | **영향**: Microsoft Planetary Computer Pro  
**설명**: 신뢰할 수 없는 데이터를 역직렬화하는 과정에서 정보 노출이 발생할 수 있습니다. 공격자는 조작된 직렬화 데이터를 보내 네트워크를 통해 민감한 정보를 얻을 수 있습니다. 데이터 처리 파이프라인이나 API 입력값이 영향을 받을 수 있습니다.  
**대응**: Microsoft 보안 업데이트를 확인하세요. 외부 입력에 대한 deserialization을 피하고, 허용된 타입만 처리하도록 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-41104)

### [CRITICAL] CVE-2026-42901 — Microsoft Entra ID
**CVSS**: 10 | **영향**: Microsoft Entra ID  
**설명**: Microsoft Entra ID에서 origin validation 오류로 권한 상승이 가능할 수 있습니다. 인증되지 않은 공격자가 네트워크를 통해 요청 출처 검증을 우회할 수 있습니다. SSO, OAuth, SAML, OIDC 연동을 사용하는 서비스는 영향 범위를 확인해야 합니다.  
**대응**: Microsoft 보안 공지와 테넌트 설정을 확인하세요. redirect URI, allowed origin, app registration 설정을 재점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-42901)

### [CRITICAL] CVE-2026-47280 — Azure Resource Manager
**CVSS**: 10 | **영향**: Azure Resource Manager  
**설명**: Azure Resource Manager에서 improper authentication 취약점이 발견되었습니다. 인증되지 않은 공격자가 네트워크를 통해 권한 상승을 시도할 수 있습니다. Azure 리소스 생성, 수정, 권한 관리에 영향을 줄 수 있어 위험도가 높습니다.  
**대응**: Microsoft 보안 업데이트와 Azure 권고를 확인하세요. Azure RBAC, managed identity, service principal 권한을 최소 권한으로 재점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-47280)

### [CRITICAL] CVE-2026-44930 — Apache CXF
**CVSS**: 9.8 | **영향**: Maven / Apache CXF  
**설명**: Apache CXF의 XKMS server LDAP Certificate repository에서 LDAP injection 취약점이 발견되었습니다. 공격자는 조작된 LDAP 입력을 통해 저장소에서 임의의 인증서를 조회할 수 있습니다. 인증서 기반 인증이나 XML 보안 기능을 쓰는 Java 서비스가 영향을 받을 수 있습니다.  
**대응**: Apache CXF를 4.2.1, 4.1.6, 3.6.11 이상으로 업그레이드하세요. XKMS 기능을 사용하지 않는다면 비활성화하고 LDAP 입력값 필터링을 추가하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-44930)

### [CRITICAL] CVE-2018-25350 — userSpice
**CVSS**: 9.8 | **영향**: userSpice 4.3.24  
**설명**: userSpice 4.3.24에서 username enumeration 취약점이 발견되었습니다. 공격자는 `existingUsernameCheck.php`에 POST 요청을 보내 응답의 `taken` 문자열로 유효한 계정을 식별할 수 있습니다. 계정 탈취 공격의 사전 단계로 악용될 수 있습니다.  
**대응**: userSpice를 최신 버전으로 업그레이드하세요. 임시로 해당 엔드포인트에 rate limit을 적용하고, 존재 여부가 드러나지 않는 동일한 응답을 반환하도록 수정하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2018-25350)

### [CRITICAL] CVE-2026-9384 — Totolink A8000RU
**CVSS**: 9.8 | **영향**: Totolink A8000RU 7.1cu.643_b20200521  
**설명**: Totolink A8000RU의 Web Management Interface에서 os command injection 취약점이 발견되었습니다. `/cgi-bin/cstecgi.cgi`의 `setDiagnosisCfg` 기능에서 `ip` 인자를 조작하면 원격 명령 실행이 가능합니다. 공개 exploit이 있어 실제 공격 가능성이 높습니다.  
**대응**: 장비 펌웨어 업데이트를 확인하세요. 관리 페이지를 인터넷에 노출하지 말고, 내부망 또는 VPN에서만 접근하도록 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-9384)

### [CRITICAL] CVE-2026-9385 — Totolink A8000RU
**CVSS**: 9.8 | **영향**: Totolink A8000RU 7.1cu.643_b20200521  
**설명**: Totolink A8000RU의 Web Management Interface에서 또 다른 os command injection 취약점이 확인되었습니다. `/cgi-bin/cstecgi.cgi`의 `setTracerouteCfg` 기능에서 `command` 인자 조작으로 원격 명령 실행이 가능합니다. 네트워크 장비가 장악되면 내부망 공격 거점이 될 수 있습니다.  
**대응**: 펌웨어 업데이트를 적용하세요. 즉시 WAN 관리 기능을 끄고, 관리자 비밀번호를 변경하며, 접근 가능한 IP를 제한하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-9385)

### [CRITICAL] CVE-2026-9386 — Totolink A8000RU
**CVSS**: 9.8 | **영향**: Totolink A8000RU 7.1cu.643_b20200521  
**설명**: Totolink A8000RU의 `setLanguageCfg` 기능에서도 os command injection 취약점이 발견되었습니다. 공격자는 `lang` 인자를 조작해 원격에서 명령을 실행할 수 있습니다. 같은 장비와 같은 CGI 파일에서 여러 취약점이 동시에 발견된 점이 중요합니다.  
**대응**: 펌웨어 업데이트를 확인하고, 관리 인터페이스 외부 노출을 차단하세요. 장비 로그에서 비정상적인 `/cgi-bin/cstecgi.cgi` 요청을 점검하세요.  
[NVD 상세](https://nvd.nist.gov/vuln/detail/CVE-2026-9386)

## 이번 주 보안 트렌드

이번 주 핵심 패턴은 command injection, 인증 우회, 위험한 파일 업로드입니다. 모두 외부 입력을 신뢰했을 때 발생하는 문제입니다.

Azure, Microsoft Entra ID, Microsoft Power Pages를 쓰는 팀은 클라우드 설정과 권한 범위를 바로 확인해야 합니다. Java에서 Apache CXF를 쓰는 팀은 Maven 의존성 버전을 점검해야 합니다.

라이브러리 개발자뿐 아니라 풀스택 개발자도 파일 업로드, 인증 callback, command 실행, deserialization 코드를 다시 봐야 합니다. 특히 관리자 페이지나 네트워크 장비 관리 UI가 인터넷에 노출되어 있다면 우선 차단해야 합니다.