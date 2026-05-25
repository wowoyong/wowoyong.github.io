---
title: "[코딩 테스트] 2026-05-25 — 해시맵 기반 Two Sum"
date: 2026-05-25 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 개발자 인터뷰 준비와 실전 코딩 테스트에서 가장 자주 나오는 해시맵 입문 문제이기 때문입니다.

## 문제 설명

물류 주문 시스템에서 각 주문에는 처리 비용이 하나씩 기록되어 있습니다.  
하루 예산 `target`이 주어질 때, 서로 다른 두 주문을 골라 비용의 합이 정확히 `target`이 되는 주문의 인덱스를 찾으세요.

배열 `costs`가 주어집니다.

조건은 다음과 같습니다.

- 반드시 서로 다른 두 주문을 사용해야 합니다.
- 정답은 하나만 존재합니다.
- 반환하는 인덱스 순서는 아무거나 가능하지만, 보통 작은 인덱스를 먼저 반환해도 좋습니다.

함수는 두 주문의 인덱스를 배열로 반환하세요.

## 입출력 예시

```text
입력: costs = [14, 7, 11, 2], target = 9
출력: [1, 3]
설명: costs[1] + costs[3] = 7 + 2 = 9
```

```text
입력: costs = [5, 3, 10, 6, 8], target = 13
출력: [0, 4]
설명: costs[0] + costs[4] = 5 + 8 = 13
```

```text
입력: costs = [4, 4, 9, 1], target = 8
출력: [0, 1]
설명: 같은 값 4를 두 번 써야 하지만, 서로 다른 인덱스이므로 가능하다.
```

## 제약 조건

- `2 <= len(costs) <= 100000`
- `-10^9 <= costs[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- 정답은 정확히 한 개만 존재
- 시간 제한: O(n^2) 풀이는 통과하기 어렵고, O(n)을 목표로 해야 함

## 풀이 접근법

### 핵심 아이디어
이 문제는 모든 두 쌍을 비교하면 O(n^2)이라 비효율적입니다.  
대신 현재 값 `costs[i]`를 보면서, `target - costs[i]`가 이전에 나왔는지만 빠르게 확인하면 됩니다. 이때 해시맵을 쓰면 값을 O(1)에 가깝게 찾을 수 있어 전체를 O(n)에 해결할 수 있습니다.

### 단계별 풀이 과정
1. 빈 해시맵 `seen`을 준비합니다. `값 -> 인덱스` 형태로 저장합니다.
2. 배열을 앞에서부터 순회합니다.
3. 현재 값이 `x`라면, 필요한 값 `need = target - x`를 계산합니다.
4. `need`가 이미 `seen`에 있으면 정답을 찾은 것입니다. `seen[need]`와 현재 인덱스를 반환합니다.
5. 없다면 현재 값 `x`와 현재 인덱스를 `seen`에 저장합니다.
6. 끝까지 반복하면 정답을 찾을 수 있습니다.

## 코드 풀이

### Python
```python
from typing import List

def find_two_orders(costs: List[int], target: int) -> List[int]:
    # value -> index
    seen = {}

    for i, cost in enumerate(costs):
        need = target - cost

        # 이전에 need가 나왔으면 정답
        if need in seen:
            return [seen[need], i]

        # 현재 값을 나중에 찾을 수 있도록 저장
        seen[cost] = i

    # 문제 조건상 항상 정답이 있다고 했지만,
    # 방어적으로 예외를 처리한다.
    return []

# 예시 실행
print(find_two_orders([14, 7, 11, 2], 9))      # [1, 3]
print(find_two_orders([5, 3, 10, 6, 8], 13))   # [0, 4]
print(find_two_orders([4, 4, 9, 1], 8))        # [0, 1]
```

### JavaScript
```javascript
function findTwoOrders(costs, target) {
  // value -> index
  const seen = new Map();

  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    const need = target - cost;

    // 이전에 need가 나왔으면 정답
    if (seen.has(need)) {
      return [seen.get(need), i];
    }

    // 현재 값을 나중에 찾을 수 있도록 저장
    seen.set(cost, i);
  }

  // 문제 조건상 항상 정답이 있다고 했지만,
  // 방어적으로 빈 배열을 반환한다.
  return [];
}

// 예시 실행
console.log(findTwoOrders([14, 7, 11, 2], 9));      // [1, 3]
console.log(findTwoOrders([5, 3, 10, 6, 8], 13));   // [0, 4]
console.log(findTwoOrders([4, 4, 9, 1], 8));        // [0, 1]
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 배열을 한 번만 순회하고, 해시맵 조회가 평균 O(1)이기 때문입니다.
- **공간 복잡도**: O(n) — 최악의 경우 모든 값을 해시맵에 저장하기 때문입니다.

## 틀리기 쉬운 포인트

- 같은 원소를 두 번 쓰면 안 됩니다. 그래서 현재 값을 먼저 저장하지 말고, 먼저 `need`를 검사해야 합니다.
- 값이 중복될 수 있습니다. `4 + 4 = 8` 같은 경우를 놓치지 않아야 합니다.
- 정답이 값이 아니라 인덱스라는 점을 자주 실수합니다.

## 유사 문제 패턴

- 배열에서 합이 `target` 이하가 되는 가장 긴 구간 찾기: 누적합이나 슬라이딩 윈도우로 확장됩니다.
- 세 수의 합이 `target`이 되는 조합 찾기: 정렬 후 투 포인터로 자주 풉니다.
- 두 배열에서 합이 `target`이 되는 한 쌍 찾기: 한 배열을 해시셋에 넣고 탐색하는 방식이 그대로 통합니다.