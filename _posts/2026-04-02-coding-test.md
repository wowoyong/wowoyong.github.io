---
title: "[코딩 테스트] 2026-04-02 — 동전 교환"
date: 2026-04-02 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, dp]
---
## 오늘의 문제 선정 이유
> 학습 자료와 개발자 성장 이야기가 많이 보이는 오늘 트렌드와 잘 맞고, DP와 그리디의 차이를 연습하기 좋은 대표 유형이기 때문입니다.

## 문제 설명

온라인 강의 플랫폼에서 유료 강의를 구매하려고 합니다.  
결제 금액 `target`원을 만들기 위해 사용할 수 있는 동전 종류가 `N`개 주어집니다. 각 동전은 원하는 만큼 사용할 수 있습니다.

목표는 `target`원을 정확히 만들 때 필요한 동전 개수의 최솟값을 구하는 것입니다.  
만약 어떤 방법으로도 정확히 만들 수 없다면 `-1`을 출력하세요.

단, 동전 단위가 크다고 해서 무조건 큰 동전부터 쓰는 방식이 항상 정답은 아닙니다.

## 입출력 예시

```text
입력: coins = [1, 4, 6], target = 8
출력: 2
설명: 4원 동전 2개를 사용하면 8원을 만들 수 있다. 6 + 1 + 1은 3개이므로 최소가 아니다.
```

```text
입력: coins = [3, 5], target = 11
출력: 3
설명: 3 + 3 + 5 = 11 이므로 3개가 필요하다.
```

```text
입력: coins = [4, 7], target = 9
출력: -1
설명: 4원과 7원만으로는 9원을 정확히 만들 수 없다.
```

## 제약 조건

- `1 <= N <= 100`
- `1 <= coins[i] <= 10,000`
- `1 <= target <= 100,000`
- 각 동전은 무한히 사용할 수 있음
- 시간 제한: 1초 ~ 2초 수준
- 정답이 없는 경우 `-1` 반환

## 풀이 접근법

### 핵심 아이디어
이 문제는 각 금액까지의 최소 동전 개수를 누적해서 구하는 DP가 가장 안정적입니다.  
그리디는 큰 동전부터 고르면 될 것 같지만, 동전 체계에 따라 최적해를 놓칠 수 있습니다. 그래서 `amount`마다 최소 개수를 저장하는 방식이 필요합니다.

### 단계별 풀이 과정
1. `dp[x]`를 `x`원을 만드는 데 필요한 최소 동전 개수라고 정의합니다.
2. 처음에는 모든 값을 큰 수로 채우고, `dp[0] = 0`으로 둡니다.
3. 각 동전에 대해, 그 동전 금액부터 `target`까지 순회합니다.
4. `dp[amount - coin]`을 만들 수 있다면, 현재 동전을 하나 더 써서 `dp[amount]`를 갱신합니다.
5. 최종적으로 `dp[target]`이 초기 큰 수 그대로면 `-1`, 아니면 그 값을 반환합니다.

## 코드 풀이

### Python
```python
def min_coins(coins, target):
    INF = target + 1
    dp = [INF] * (target + 1)
    dp[0] = 0

    # 각 동전을 기준으로 만들 수 있는 금액을 갱신한다.
    for coin in coins:
        for amount in range(coin, target + 1):
            if dp[amount - coin] != INF:
                dp[amount] = min(dp[amount], dp[amount - coin] + 1)

    return -1 if dp[target] == INF else dp[target]


# 예시 실행
print(min_coins([1, 4, 6], 8))   # 2
print(min_coins([3, 5], 11))     # 3
print(min_coins([4, 7], 9))      # -1
```

### JavaScript
```javascript
function minCoins(coins, target) {
  const INF = target + 1;
  const dp = new Array(target + 1).fill(INF);
  dp[0] = 0;

  // 각 동전을 여러 번 사용할 수 있으므로 앞에서부터 갱신한다.
  for (const coin of coins) {
    for (let amount = coin; amount <= target; amount++) {
      if (dp[amount - coin] !== INF) {
        dp[amount] = Math.min(dp[amount], dp[amount - coin] + 1);
      }
    }
  }

  return dp[target] === INF ? -1 : dp[target];
}

// 예시 실행
console.log(minCoins([1, 4, 6], 8));  // 2
console.log(minCoins([3, 5], 11));    // 3
console.log(minCoins([4, 7], 9));     // -1
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N * target)` — 각 동전에 대해 `target`까지 한 번씩 확인하기 때문입니다.
- **공간 복잡도**: `O(target)` — `dp` 배열 하나만 사용합니다.

## 틀리기 쉬운 포인트

- 큰 동전부터 고르는 그리디로 풀면 틀릴 수 있습니다. 예를 들어 `[1, 4, 6]`, `8`에서는 `6 + 1 + 1`보다 `4 + 4`가 더 좋습니다.
- `dp` 초기값을 충분히 큰 값으로 두지 않으면 최소 비교가 깨질 수 있습니다.
- 정확히 만들 수 없는 경우를 처리하지 않으면 잘못된 숫자를 반환할 수 있습니다.

## 유사 문제 패턴

- 최소 개수 조합 DP: 배낭 문제처럼 어떤 목표값을 최소 비용으로 만드는 유형입니다.
- 경우의 수 세기 DP: 최소 개수가 아니라 만들 수 있는 조합 수를 구하는 문제로 확장할 수 있습니다.
- 제한 없는 자원 사용 문제: 동전처럼 같은 값을 여러 번 사용할 수 있는 unbounded knapsack 패턴과 연결됩니다.