---
title: "[코딩 테스트] 2026-05-29 — 동전 교환 DP"
date: 2026-05-29 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, dp, greedy]
---
## 오늘의 문제 선정 이유
> 개발 학습, 인터뷰 준비, 물류 알고리즘처럼 “제한된 선택지로 최적 비용을 만드는 문제”는 실무와 코딩 테스트 모두에서 자주 등장합니다.

## 문제 설명

어떤 온라인 코딩 튜터 서비스는 수업 시간을 결제할 때 정해진 크레딧 패키지만 사용할 수 있습니다.

각 패키지는 특정 크레딧 수를 제공합니다.  
같은 패키지는 여러 번 구매할 수 있습니다.

목표 크레딧 `target`이 주어졌을 때, 정확히 `target` 크레딧을 만들기 위해 필요한 최소 패키지 개수를 구하세요.

정확히 만들 수 없다면 `-1`을 반환하세요.

## 입출력 예시

```
입력: packages = [1, 5, 12], target = 15
출력: 3
설명: 5 + 5 + 5 = 15 이므로 패키지 3개가 최소입니다.
```

```
입력: packages = [4, 7], target = 10
출력: -1
설명: 4와 7만 사용해서 정확히 10을 만들 수 없습니다.
```

```
입력: packages = [2, 6, 9], target = 18
출력: 2
설명: 9 + 9 = 18 이므로 패키지 2개가 최소입니다.
```

## 제약 조건

- `1 <= packages.length <= 100`
- `1 <= packages[i] <= 10,000`
- `1 <= target <= 100,000`
- 같은 패키지는 무제한으로 사용할 수 있습니다.
- 시간 제한은 `O(packages.length * target)` 풀이를 통과할 수 있는 수준입니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 탐욕법으로 풀면 틀릴 수 있습니다.  
가장 큰 패키지를 먼저 고르는 선택이 항상 최소 개수를 보장하지 않기 때문입니다.  
따라서 `dp[amount] = amount 크레딧을 만드는 최소 패키지 개수`로 정의하는 동적 계획법을 사용합니다.

### 단계별 풀이 과정
1. `dp` 배열을 `target + 1` 크기로 만듭니다.
2. 만들 수 없는 상태를 큰 값 `INF`로 초기화합니다.
3. `dp[0] = 0`으로 둡니다. 0 크레딧은 패키지 0개로 만들 수 있습니다.
4. 금액 `amount`를 `1`부터 `target`까지 순회합니다.
5. 각 패키지 `coin`에 대해 `amount - coin >= 0`이면 이전 상태를 확인합니다.
6. `dp[amount] = min(dp[amount], dp[amount - coin] + 1)`로 갱신합니다.
7. 마지막에 `dp[target]`이 여전히 `INF`라면 `-1`을 반환합니다.

## 코드 풀이

### Python
```python
from typing import List

def min_packages(packages: List[int], target: int) -> int:
    INF = target + 1
    dp = [INF] * (target + 1)

    # 0 크레딧은 아무 패키지도 사지 않으면 만들 수 있다.
    dp[0] = 0

    for amount in range(1, target + 1):
        for coin in packages:
            if amount >= coin:
                dp[amount] = min(dp[amount], dp[amount - coin] + 1)

    return -1 if dp[target] == INF else dp[target]


# 예시 실행
print(min_packages([1, 5, 12], 15))  # 3
print(min_packages([4, 7], 10))      # -1
print(min_packages([2, 6, 9], 18))   # 2
```

### JavaScript
```javascript
function minPackages(packages, target) {
  const INF = target + 1;
  const dp = Array(target + 1).fill(INF);

  // 0 크레딧은 패키지 0개로 만들 수 있다.
  dp[0] = 0;

  for (let amount = 1; amount <= target; amount++) {
    for (const coin of packages) {
      if (amount >= coin) {
        dp[amount] = Math.min(dp[amount], dp[amount - coin] + 1);
      }
    }
  }

  return dp[target] === INF ? -1 : dp[target];
}

// 예시 실행
console.log(minPackages([1, 5, 12], 15)); // 3
console.log(minPackages([4, 7], 10));     // -1
console.log(minPackages([2, 6, 9], 18));  // 2
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n * target) — 각 금액마다 모든 패키지를 확인합니다.
- **공간 복잡도**: O(target) — 금액별 최소 패키지 개수를 저장합니다.

## 틀리기 쉬운 포인트

- 가장 큰 패키지부터 고르는 greedy는 항상 정답이 아닙니다.
- `dp[0] = 0`을 설정하지 않으면 모든 상태 전이가 실패합니다.
- 만들 수 없는 경우를 구분하기 위해 `INF` 값을 충분히 크게 잡아야 합니다.

## 유사 문제 패턴

- 최소 개수로 목표 합 만들기: 동전, 쿠폰, 점수 조합 문제에 자주 나옵니다.
- 무제한 아이템 선택 DP: 같은 항목을 여러 번 사용할 수 있는 배낭 문제와 비슷합니다.
- 목표 금액 가능 여부 판단: 최소 개수가 아니라 만들 수 있는지만 묻는 문제로 바뀔 수 있습니다.