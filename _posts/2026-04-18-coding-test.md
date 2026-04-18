---
title: "[코딩 테스트] 2026-04-18 — 부분 집합"
date: 2026-04-18 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, sort]
---
## 오늘의 문제 선정 이유
> 오늘은 SaaS, AI assistant, self-hosted 도구 조합에 대한 관심이 높아서, 기능 조합을 빠르게 만들어내는 부분 집합 유형을 골랐습니다.

## 문제 설명

당신은 SaaS 제품의 기능 실험을 위한 `feature bundle` 생성기를 만들고 있습니다.

서로 다른 기능 이름이 들어 있는 문자열 배열 `features`가 주어집니다.  
이 배열에서 만들 수 있는 모든 부분 집합을 구하세요.

조건은 다음과 같습니다.

- 각 부분 집합은 원래 `features`에 나온 순서를 유지해야 합니다.
- 결과에는 공집합도 포함해야 합니다.
- 같은 부분 집합이 중복으로 나오면 안 됩니다.
- 결과는 부분 집합의 길이가 짧은 것부터 출력합니다.
- 길이가 같다면 사전순으로 출력합니다.

함수를 구현하세요.

## 입출력 예시

```text
입력: features = ["chat", "search", "billing"]
출력: [
  [],
  ["billing"],
  ["chat"],
  ["search"],
  ["billing", "chat"],
  ["billing", "search"],
  ["chat", "search"],
  ["billing", "chat", "search"]
]
설명: 총 3개의 기능이 있으므로 부분 집합은 2^3 = 8개입니다.
출력 시 부분 집합 길이 기준으로 먼저 정렬하고, 길이가 같으면 사전순으로 정렬합니다.
```

```text
입력: features = ["auth", "api"]
출력: [
  [],
  ["api"],
  ["auth"],
  ["api", "auth"]
]
설명: 가능한 부분 집합은 공집합, 각 원소 1개짜리, 전체 집합까지 총 4개입니다.
```

## 제약 조건

- `1 <= features.length <= 15`
- `features[i]`는 길이 1 이상 20 이하의 영문 소문자 문자열
- `features`의 모든 원소는 서로 다름
- 시간 제한: 1초
- 추가 정렬을 포함해도 통과 가능한 범위로 설계됨

## 풀이 접근법

### 핵심 아이디어
이 문제는 각 원소를 "넣는다 / 넣지 않는다" 두 가지 선택으로 나누면 됩니다.  
원소가 `N`개면 가능한 조합은 `2^N`개이므로, 백트래킹으로 모든 경우를 자연스럽게 탐색할 수 있습니다.  
부분 집합 문제의 기본형이라서, 재귀 함수의 뼈대를 익히기에 가장 좋은 유형입니다.

### 단계별 풀이 과정
1. 현재까지 고른 원소를 담는 `path`와, 몇 번째 원소를 보고 있는지 나타내는 `index`를 관리합니다.
2. 매 재귀 호출에서 현재 `path`를 결과에 추가합니다. 이 자체가 하나의 부분 집합입니다.
3. `index`부터 끝까지 순회하면서 각 원소를 하나씩 선택합니다.
4. 원소를 `path`에 넣고 재귀 호출을 진행합니다.
5. 재귀가 끝나면 마지막 원소를 빼서 다음 경우를 탐색합니다.
6. 모든 부분 집합을 구한 뒤, 길이 오름차순과 사전순 기준으로 정렬합니다.

## 코드 풀이

### Python
```python
from typing import List

def solution(features: List[str]) -> List[List[str]]:
    result = []
    path = []

    def backtrack(start: int) -> None:
        # 현재까지 만든 조합도 하나의 부분 집합이다.
        result.append(path[:])

        for i in range(start, len(features)):
            # 현재 원소를 선택한다.
            path.append(features[i])

            # 다음 원소부터 이어서 선택한다.
            backtrack(i + 1)

            # 선택을 되돌린다.
            path.pop()

    backtrack(0)

    # 길이 기준 오름차순, 길이가 같으면 사전순 정렬
    result.sort(key=lambda subset: (len(subset), subset))
    return result


# 실행 예시
if __name__ == "__main__":
    features = ["chat", "search", "billing"]
    print(solution(features))
```

### JavaScript
```javascript
function solution(features) {
  const result = [];
  const path = [];

  function backtrack(start) {
    // 현재까지 만든 조합도 하나의 부분 집합이다.
    result.push([...path]);

    for (let i = start; i < features.length; i++) {
      // 현재 원소를 선택한다.
      path.push(features[i]);

      // 다음 원소부터 이어서 선택한다.
      backtrack(i + 1);

      // 선택을 되돌린다.
      path.pop();
    }
  }

  backtrack(0);

  // 길이 기준 오름차순, 길이가 같으면 사전순 정렬
  result.sort((a, b) => {
    if (a.length !== b.length) {
      return a.length - b.length;
    }

    const aStr = a.join("\u0000");
    const bStr = b.join("\u0000");

    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  });

  return result;
}

// 실행 예시
const features = ["chat", "search", "billing"];
console.log(solution(features));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N * 2^N) — 부분 집합이 `2^N`개이고, 각 부분 집합을 복사하거나 정렬 비교할 때 원소를 확인합니다.
- **공간 복잡도**: O(N * 2^N) — 결과로 모든 부분 집합을 저장해야 합니다.

## 틀리기 쉬운 포인트

- 공집합 `[]`를 빼먹기 쉽습니다. 재귀 시작 시점의 `path`도 결과에 넣어야 합니다.
- `path`를 그대로 넣으면 나중에 값이 같이 바뀝니다. 복사본 `path[:]`, `[...path]`를 넣어야 합니다.
- 정렬 조건을 놓치면 정답 형식이 달라집니다. 생성 순서와 출력 순서는 다를 수 있습니다.

## 유사 문제 패턴

- 조합 생성: `N`개 중 `K`개를 고르는 문제도 같은 백트래킹 틀을 사용합니다.
- 부분 수열 탐색: 배열에서 조건을 만족하는 모든 부분 수열을 찾는 문제로 확장할 수 있습니다.
- 제약 조건이 있는 부분 집합: 합이 `target` 이하인 조합만 구하는 식으로 가지치기를 추가할 수 있습니다.