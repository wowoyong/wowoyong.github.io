---
title: "[코딩 테스트] 2026-05-21 — 편집 거리"
date: 2026-05-21 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, dp]
---
## 오늘의 문제 선정 이유
> AI 도구와 자동화가 주목받는 오늘, 서로 다른 설정 문자열이나 명령어 시퀀스를 최소 비용으로 맞추는 문제는 실무 감각과 코딩 테스트 적합성을 모두 갖습니다.

## 문제 설명

한 물류 자동화 팀은 여러 서비스의 `workflow` 설정 문자열을 하나의 기준 문자열로 통일하려고 합니다.

문자열 `source`를 문자열 `target`으로 바꾸려면 아래 세 가지 편집만 할 수 있습니다.

- 문자 하나 삽입: 비용 1
- 문자 하나 삭제: 비용 1
- 문자 하나 교체: 비용 1

두 문자열이 주어질 때, `source`를 `target`으로 바꾸는 최소 편집 비용을 구하세요.

단, 문자열은 영문 소문자와 숫자로만 이루어져 있습니다.

## 입출력 예시

```text
입력: source = "routev1", target = "routev2"
출력: 1
설명: 마지막 문자 '1'을 '2'로 교체하면 된다.
```

```text
입력: source = "picklist", target = "packinglist"
출력: 3
설명: "picklist"에서
1) 'i' 뒤에 'a' 삽입
2) 'a' 뒤에 'n' 삽입
3) 'n' 뒤에 'g' 삽입
하면 "packinglist"가 된다.
```

```text
입력: source = "bot2026", target = "boat26"
출력: 2
설명: 't' 뒤에 'a'를 삽입하고, '0'을 삭제하면 된다.
```

## 제약 조건

- `0 <= len(source), len(target) <= 2000`
- 문자열은 영문 소문자, 숫자로만 구성
- 시간 제한: 2초
- 메모리 제한: 256MB

## 풀이 접근법

### 핵심 아이디어
이 문제는 현재 위치까지의 최소 비용을 쌓아 가는 `dp`가 가장 자연스럽습니다.  
각 위치에서 할 수 있는 선택은 삽입, 삭제, 교체뿐이고, 이전 상태의 최솟값만 알면 현재 상태를 계산할 수 있기 때문입니다.

### 단계별 풀이 과정
1. `dp[i][j]`를 `source`의 앞 `i`글자를 `target`의 앞 `j`글자로 바꾸는 최소 비용이라고 정의합니다.
2. 한쪽 문자열이 비어 있으면, 다른 쪽 길이만큼 전부 삽입하거나 삭제해야 하므로 첫 행과 첫 열을 채웁니다.
3. 현재 문자가 같으면 추가 비용이 없으므로 `dp[i][j] = dp[i-1][j-1]`입니다.
4. 현재 문자가 다르면 세 경우를 비교합니다.
5. `source[i-1]` 삭제: `dp[i-1][j] + 1`
6. `target[j-1]` 삽입: `dp[i][j-1] + 1`
7. 문자 교체: `dp[i-1][j-1] + 1`
8. 이 셋 중 최솟값을 `dp[i][j]`에 저장합니다.
9. 최종 답은 `dp[len(source)][len(target)]`입니다.

## 코드 풀이

### Python
```python
def min_edit_cost(source, target):
    n = len(source)
    m = len(target)

    # dp[i][j] = source의 앞 i글자를 target의 앞 j글자로 바꾸는 최소 비용
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    # source를 빈 문자열로 만들기 위해서는 모두 삭제해야 한다.
    for i in range(1, n + 1):
        dp[i][0] = i

    # 빈 문자열을 target으로 만들기 위해서는 모두 삽입해야 한다.
    for j in range(1, m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if source[i - 1] == target[j - 1]:
                # 문자가 같으면 그대로 가져온다.
                dp[i][j] = dp[i - 1][j - 1]
            else:
                delete_cost = dp[i - 1][j] + 1
                insert_cost = dp[i][j - 1] + 1
                replace_cost = dp[i - 1][j - 1] + 1

                dp[i][j] = min(delete_cost, insert_cost, replace_cost)

    return dp[n][m]


# 예시 실행
print(min_edit_cost("routev1", "routev2"))      # 1
print(min_edit_cost("picklist", "packinglist")) # 3
print(min_edit_cost("bot2026", "boat26"))       # 2
```

### JavaScript
```javascript
function minEditCost(source, target) {
  const n = source.length;
  const m = target.length;

  // dp[i][j] = source의 앞 i글자를 target의 앞 j글자로 바꾸는 최소 비용
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  // source를 빈 문자열로 만들기 위해서는 모두 삭제해야 한다.
  for (let i = 1; i <= n; i++) {
    dp[i][0] = i;
  }

  // 빈 문자열을 target으로 만들기 위해서는 모두 삽입해야 한다.
  for (let j = 1; j <= m; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (source[i - 1] === target[j - 1]) {
        // 문자가 같으면 추가 비용이 없다.
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        const deleteCost = dp[i - 1][j] + 1;
        const insertCost = dp[i][j - 1] + 1;
        const replaceCost = dp[i - 1][j - 1] + 1;

        dp[i][j] = Math.min(deleteCost, insertCost, replaceCost);
      }
    }
  }

  return dp[n][m];
}

// 예시 실행
console.log(minEditCost("routev1", "routev2"));      // 1
console.log(minEditCost("picklist", "packinglist")); // 3
console.log(minEditCost("bot2026", "boat26"));       // 2
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N x M) — `source`와 `target`의 모든 문자 쌍을 한 번씩 확인합니다.
- **공간 복잡도**: O(N x M) — 2차원 `dp` 테이블 전체를 저장합니다.

## 틀리기 쉬운 포인트

- `dp[i][j]`에서 실제 문자는 `source[i-1]`, `target[j-1]`입니다. 인덱스가 자주 한 칸씩 밀립니다.
- 첫 행과 첫 열 초기화를 빼먹으면 빈 문자열 관련 케이스에서 바로 오답이 납니다.
- 문자가 같을 때도 무조건 `+1`을 하면 안 됩니다. 같은 문자는 비용 없이 넘겨야 합니다.

## 유사 문제 패턴

- 두 문자열의 유사도 계산 문제: 검색어 추천이나 오타 교정에서 자주 나옵니다.
- DNA 서열 비교 문제: 문자열 정렬과 최소 변경 비용 계산으로 확장됩니다.
- 버전 문자열 동기화 문제: 설정 파일이나 명령 시퀀스를 최소 수정으로 맞추는 형태로 변형됩니다.