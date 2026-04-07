---
title: "[코딩 테스트] 2026-04-07 — 편집 거리"
date: 2026-04-07 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, dp]
---
## 오늘의 문제 선정 이유
> AI 도구, 문서, 설정 문자열을 자주 다루는 흐름과 맞물려, 문자열 변환 비용을 묻는 편집 거리 유형이 다시 중요해졌기 때문입니다.

## 문제 설명

한 스타트업이 여러 AI 에이전트의 설정 문자열을 관리하고 있습니다.  
운영 서버에 저장된 설정 문자열 `A`를, 새로 배포할 설정 문자열 `B`와 정확히 같게 만들어야 합니다.

한 번의 편집으로 할 수 있는 작업은 아래 3가지입니다.

- 문자 1개 삽입
- 문자 1개 삭제
- 문자 1개 치환

각 작업의 비용은 모두 1입니다.

문자열 `A`를 문자열 `B`로 바꾸기 위한 최소 편집 횟수를 구하세요.

## 입출력 예시

```text
입력: A = "agent", B = "augment"
출력: 2
설명: "agent" -> "augment"
1. 'a' 뒤에 'u' 삽입
2. 'g' 뒤에 'm' 삽입
총 2번의 편집이 필요하다.
```

```text
입력: A = "prompt", B = "product"
출력: 2
설명:
1. 'm'을 'd'로 치환
2. 'p'와 'r' 사이에 'u' 삽입
총 2번의 편집이 필요하다.
```

```text
입력: A = "token", B = "taken"
출력: 1
설명:
'o'를 'a'로 치환하면 된다.
```

## 제약 조건

- `0 <= len(A), len(B) <= 2000`
- `A`, `B`는 영문 소문자로만 이루어짐
- 시간 제한: 2초
- 메모리 제한: 256MB

## 풀이 접근법

### 핵심 아이디어
이 문제는 현재 문자 하나만 보고 결정할 수 없습니다.  
앞부분을 어떻게 바꿨는지가 뒤의 최소 횟수에 직접 영향을 주기 때문입니다. 그래서 `dp[i][j]`를 `A`의 앞 `i`글자를 `B`의 앞 `j`글자로 바꾸는 최소 횟수로 정의하는 동적 계획법이 가장 자연스럽습니다.

구현은 점화식을 채우면 됩니다.  
문자가 같으면 이전 상태를 그대로 가져오고, 다르면 삽입, 삭제, 치환 중 최소 비용을 선택하면 됩니다.

### 단계별 풀이 과정
1. `dp[i][j]`를 `A[:i]`를 `B[:j]`로 바꾸는 최소 편집 횟수로 정의합니다.
2. 빈 문자열과 비교하는 경우를 먼저 채웁니다.
3. 현재 두 문자가 같으면 `dp[i-1][j-1]`를 그대로 사용합니다.
4. 다르면 아래 3가지 중 최소값에 1을 더합니다.
5. 최종 답은 `dp[len(A)][len(B)]`입니다.

## 코드 풀이

### Python
```python
def min_edit_distance(A: str, B: str) -> int:
    n = len(A)
    m = len(B)

    # dp[i][j]: A의 앞 i글자를 B의 앞 j글자로 바꾸는 최소 편집 횟수
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    # A를 빈 문자열로 만드는 경우: 모두 삭제
    for i in range(1, n + 1):
        dp[i][0] = i

    # 빈 문자열을 B로 만드는 경우: 모두 삽입
    for j in range(1, m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if A[i - 1] == B[j - 1]:
                # 현재 문자가 같으면 추가 비용이 없다
                dp[i][j] = dp[i - 1][j - 1]
            else:
                # 삭제, 삽입, 치환 중 최소 선택
                delete_cost = dp[i - 1][j]
                insert_cost = dp[i][j - 1]
                replace_cost = dp[i - 1][j - 1]
                dp[i][j] = min(delete_cost, insert_cost, replace_cost) + 1

    return dp[n][m]


# 예시 실행
if __name__ == "__main__":
    print(min_edit_distance("agent", "augment"))   # 2
    print(min_edit_distance("prompt", "product"))  # 2
    print(min_edit_distance("token", "taken"))     # 1
```

### JavaScript
```javascript
function minEditDistance(A, B) {
  const n = A.length;
  const m = B.length;

  // dp[i][j]: A의 앞 i글자를 B의 앞 j글자로 바꾸는 최소 편집 횟수
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  // A를 빈 문자열로 만드는 경우: 모두 삭제
  for (let i = 1; i <= n; i++) {
    dp[i][0] = i;
  }

  // 빈 문자열을 B로 만드는 경우: 모두 삽입
  for (let j = 1; j <= m; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (A[i - 1] === B[j - 1]) {
        // 현재 문자가 같으면 추가 비용이 없다
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // 삭제, 삽입, 치환 중 최소 선택
        const deleteCost = dp[i - 1][j];
        const insertCost = dp[i][j - 1];
        const replaceCost = dp[i - 1][j - 1];
        dp[i][j] = Math.min(deleteCost, insertCost, replaceCost) + 1;
      }
    }
  }

  return dp[n][m];
}

// 예시 실행
console.log(minEditDistance("agent", "augment"));   // 2
console.log(minEditDistance("prompt", "product"));  // 2
console.log(minEditDistance("token", "taken"));     // 1
```

## 시간·공간 복잡도

- **시간 복잡도**: O(NM) — `dp` 테이블의 모든 칸을 한 번씩 계산하기 때문
- **공간 복잡도**: O(NM) — 크기 `(N+1) x (M+1)`의 2차원 배열을 사용하기 때문

## 틀리기 쉬운 포인트

`dp[i][j]`의 의미를 헷갈리면 인덱스가 바로 틀어집니다.  
`A[i - 1]`, `B[j - 1]`를 비교한다는 점을 꼭 맞춰야 합니다.

빈 문자열 초기화를 빼먹기 쉽습니다.  
`dp[i][0] = i`, `dp[0][j] = j`가 없으면 점화식이 성립하지 않습니다.

문자가 다를 때 3가지 연산을 모두 봐야 합니다.  
삽입, 삭제, 치환 중 하나라도 빠뜨리면 정답이 달라집니다.

## 유사 문제 패턴

최장 공통 부분 수열 `LCS` 문제도 두 문자열의 앞부분 상태를 쌓아 간다는 점에서 같은 DP 감각이 필요합니다.

두 문자열의 유사도를 계산하는 문제도 자주 같은 형태로 나옵니다.  
예를 들어 오타 교정, 검색어 추천, 문서 버전 비교 같은 유형입니다.

문자열뿐 아니라 배열 변환 최소 연산 문제도 같은 패턴으로 풀 수 있습니다.  
상태를 `앞에서 몇 개까지 맞췄는가`로 두는 방식이 핵심입니다.