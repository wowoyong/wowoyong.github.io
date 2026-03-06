---
title: "GitHub 레포지토리 58개 대정리 회고"
date: 2026-03-06 20:00:00 +0900
categories: [회고, GitHub]
tags: [github, git, readme, conventional-commits, claude-code, automation]
---

## 오늘 한 일: GitHub 전체 레포지토리 대정리

오늘 하루 동안 GitHub 계정(`wowoyong`)에 있는 레포지토리 58개를 전부 정리했다. 몇 달째 방치해뒀던 레포들에 description도 없고, README도 없거나 영문 템플릿 그대로인 것들이 많았다. Claude Code와 함께 이걸 한 번에 처리해봤다.

---

## 작업 범위

총 58개 레포를 세 그룹으로 나눠 처리했다:

| 분류 | 개수 | 상세 수준 |
|------|------|-----------|
| 개인 프로젝트 | 24개 | 표준 |
| 전 직장 프로젝트 (Life4cut/PhotoDrink) | 29개 | 상세 문서 수준 |
| 샘플/학습 프로젝트 | 5개 | 표준 |

---

## 작업 1: 한국어 description 추가

58개 레포 모두 한국어 설명을 추가했다. GitHub repository description은 50자 이내로 핵심을 담아야 한다. 예를 들면:

- `artfolio` → "포트폴리오 CMS — 갤러리, 전시회, 문의 관리 시스템"
- `photo-organizer-ai` → "AI 기반 사진 자동 분류 및 정리 도구"
- `Life4cut-Old-Kiosk` → "라이프포컷 구형 키오스크 — C# WPF 포토부스 시스템"

---

## 작업 2: 한국어 README.md 전면 작성

모든 레포에 README.md를 한국어로 새로 작성했다. 기술 스택에 따라 구성이 달라진다:

**Next.js / React 계열**
```
# 프로젝트명
> 한 줄 설명

## 개요 / 주요 기능 / 기술 스택 / 설치 및 실행 / 환경 변수 / 프로젝트 구조
```

**C# WPF 키오스크 계열** (Life4cut 구형 시스템들)
- 시스템 요구사항, .NET 버전 명시
- 실행 파일 경로, 빌드 방법
- 결제 시스템·카메라·프린터 연동 구조 포함

**Flutter 앱**
- `flutter pub get`, 플랫폼(iOS/Android/Web) 명시
- 환경 변수 및 Firebase 연동 설명

**Java Spring Boot**
- Maven/Gradle 빌드 명령
- API 엔드포인트 목록
- 데이터베이스 스키마 개요

---

## 작업 3: 커밋 히스토리 Conventional Commits 형식으로 재작성

레포별로 커밋 메시지가 제각각이었다. "수정", "update", "fix 됨" 같은 메시지들을 전부 Conventional Commits 형식으로 통일했다.

### 형식

```
<type>(<scope>): <description>

# type 종류
feat:     새로운 기능
fix:      버그 수정
docs:     문서 변경
refactor: 코드 구조 개선
chore:    설정, 의존성 변경
ci:       CI/CD 관련
test:     테스트 코드
style:    포맷팅만 변경
perf:     성능 개선
init:     초기 커밋
```

### 도구: git filter-repo

`git filter-repo`를 사용해 커밋 메시지를 일괄 재작성했다. 설치는:

```bash
pip3 install git-filter-repo --break-system-packages
```

커밋 메시지 재작성 스크립트 예시:

```python
import re

def handle_commit_message(commit, metadata):
    msg = commit.message.decode('utf-8', errors='replace')
    if '초기' in msg or 'init' in msg.lower():
        new_msg = "init: 프로젝트 초기 설정"
    elif '기능' in msg or 'feat' in msg.lower():
        new_msg = f"feat: {msg.strip()}"
    elif '수정' in msg or 'fix' in msg.lower():
        new_msg = f"fix: {msg.strip()}"
    else:
        new_msg = f"chore: {msg.strip()}"
    commit.message = new_msg.encode('utf-8')

repo.filter(commit_callback=handle_commit_message)
```

### 적용 범위

- **개인 프로젝트**: 전체 커밋 재작성
- **전 직장 프로젝트**: 최근 50개 커밋만 재작성 (커밋 수가 수백~수천 개라 전체는 무리)

재작성 후 force push:

```bash
git push --force --all
```

---

## 작업 4: git 글로벌 설정 변경

```bash
git config --global user.name "wowoyong"
git config --global user.email "whwkzzang@gmail.com"
```

---

## 작업 5: Claude Code `/github-readme` 스킬 생성

이번 작업을 하면서 "이거 나중에도 쓰겠다"는 생각이 들었다. Claude Code에 커스텀 스킬을 만들어뒀다.

`~/.claude/skills/github-readme/SKILL.md`에 저장. 사용법:

```
/github-readme repo-name          # 단일 레포
/github-readme repo1 repo2 repo3  # 다중 레포 (병렬 처리)
/github-readme                     # 인터랙티브 모드
```

스킬이 자동으로:
1. 레포 구조 파악 (package.json, pubspec.yaml, pom.xml 등)
2. 기술 스택 판별
3. 한국어 README.md 작성
4. GitHub에 직접 푸시

---

## 작업 규모 요약

| 항목 | 수치 |
|------|------|
| 총 레포 수 | 58개 |
| description 업데이트 | 58개 |
| README.md 신규/전면 재작성 | 58개 |
| 커밋 재작성 대상 레포 | ~30개 |
| 재작성된 커밋 수 | 수백 개 |

---

## 느낀 점

58개를 수동으로 했다면 며칠이 걸렸을 일이다. Claude Code에 병렬 에이전트를 띄워서 한꺼번에 처리했더니 몇 시간 안에 끝났다.

특히 `permissions.allow`에 도구를 등록해두면 백그라운드 에이전트가 자동 승인 없이 실행된다는 걸 이번에 알았다. 대규모 자동화 작업 시 필수 설정이다.

```json
// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "mcp__github__get_file_contents",
      "mcp__github__create_or_update_file"
    ]
  }
}
```

커밋 히스토리 재작성은 force push가 수반되므로 **혼자 쓰는 개인 레포에서만** 해야 한다. 팀 레포에서 했다가는 동료들 로컬 이력이 전부 꼬인다.
