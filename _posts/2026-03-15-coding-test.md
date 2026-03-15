---
title: "[코딩 테스트] 2026-03-15 — Two Sum"
date: 2026-03-15 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, dp, sort]
---
## 오늘의 문제 선정 이유
> 해시맵으로 빠르게 짝을 찾는 `Two Sum`은 배열과 탐색 최적화의 기본이라서, 코딩 테스트 준비 초반에 꼭 익혀야 합니다.

## 문제 설명

물류 추천 서비스를 만드는 팀에서 배송 후보 비용을 분석하고 있습니다.

정수 배열 `costs`가 주어집니다. 각 원소는 하나의 배송 옵션 비용입니다.  
정수 `target`도 함께 주어집니다.

서로 다른 두 배송 옵션을 골라 합이 정확히 `target`이 되면, 그 두 옵션의 인덱스를 반환하세요.

조건은 다음과 같습니다.

- 반드시 서로 다른 두 인덱스여야 합니다.
- 정답은 정확히 하나만 존재합니다.
- 인덱스 순서는 오름차순으로 반환하세요.

함수 시그니처 예시:

- Python: `def find_pair(costs, target):`
- JavaScript: `function findPair(costs, target) {}`

## 입출력 예시

```text
입력: costs = [12, 7, 19, 5, 11], target = 18
출력: [1, 4]
설명: costs[1] = 7, costs[4] = 11 이므로 합은 18입니다.
```

```text
입력: costs = [4, 9, 1, 13, 8], target = 17
출력: [0, 3]
설명: costs[0] = 4, costs[3] = 13 이므로 합은 17입니다.
```

```text
입력: costs = [6, 6, 10, 3], target = 12
출력: [0, 1]
설명: 값이 같아도 인덱스가 다르면 사용할 수 있습니다.
```

## 제약 조건

- `2 <= len(costs) <= 100,000`
- `-1,000,000,000 <= costs[i] <= 1,000,000,000`
- `-1,000,000,000 <= target <= 1,000,000,000`
- 정답은 정확히 하나만 존재
- 시간 제한: 1초 내외
- 가능한 한 `O(n)`으로 해결하는 것을 목표로 함

## 풀이 접근법

### 핵심 아이디어
이 문제는 모든 두 쌍을 직접 확인하면 `O(n^2)`이 걸립니다. 배열 길이가 크면 비효율적입니다.

더 좋은 방법은 현재 값 `x`를 볼 때, `target - x`가 이전에 나왔는지 해시맵으로 바로 확인하는 것입니다. 이렇게 하면 한 번 순회만으로 답을 찾을 수 있습니다.

### 단계별 풀이 과정
1. 빈 해시맵 `seen`을 만듭니다. `값 -> 인덱스` 형태로 저장합니다.
2. 배열을 왼쪽부터 순회하면서 현재 값 `costs[i]`를 봅니다.
3. `need = target - costs[i]`를 계산합니다.
4. `need`가 `seen`에 있으면, 이전 인덱스와 현재 인덱스가 정답입니다.
5. 없다면 현재 값과 인덱스를 `seen`에 저장합니다.
6. 정답을 찾으면 오름차순 인덱스로 반환합니다.

## 코드 풀이

### Python
```python
def find_pair(costs, target):
    # 값 -> 해당 값이 처음 등장한 인덱스
    seen = {}

    for i, cost in enumerate(costs):
        need = target - cost

        # 필요한 값이 이미 나왔다면 정답
        if need in seen:
            return [seen[need], i]

        # 정답이 하나만 존재하므로 현재 값을 저장
        seen[cost] = i

    # 문제 조건상 항상 정답이 존재하지만,
    # 안전하게 예외를 발생시킴
    raise ValueError("No valid pair found")


# 실행 예시
if __name__ == "__main__":
    print(find_pair([12, 7, 19, 5, 11], 18))  # [1, 4]
    print(find_pair([4, 9, 1, 13, 8], 17))    # [0, 3]
    print(find_pair([6, 6, 10, 3], 12))       # [0, 1]
```

### JavaScript
```javascript
function findPair(costs, target) {
  // 값 -> 인덱스
  const seen = new Map();

  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    const need = target - cost;

    // 필요한 값이 이미 있으면 정답
    if (seen.has(need)) {
      return [seen.get(need), i];
    }

    // 현재 값을 저장
    seen.set(cost, i);
  }

  // 문제 조건상 항상 정답이 존재하지만 안전하게 처리
  throw new Error("No valid pair found");
}

// 실행 예시
console.log(findPair([12, 7, 19, 5, 11], 18)); // [1, 4]
console.log(findPair([4, 9, 1, 13, 8], 17));   // [0, 3]
console.log(findPair([6, 6, 10, 3], 12));      // [0, 1]
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n)` — 배열을 한 번만 순회하고, 해시맵 조회가 평균 `O(1)`이기 때문입니다.
- **공간 복잡도**: `O(n)` — 최악의 경우 모든 원소를 해시맵에 저장할 수 있기 때문입니다.

## 틀리기 쉬운 포인트

- 같은 값을 두 번 써야 하는 경우가 있습니다. 예를 들어 `target = 12`, 배열에 `6`이 두 개 있으면 정답이 될 수 있습니다.
- 현재 값을 먼저 저장하고 나중에 찾으면, 같은 인덱스를 두 번 쓰는 실수를 할 수 있습니다. 먼저 `need`를 확인하고 저장하는 순서가 안전합니다.
- 값이 아니라 인덱스를 반환해야 합니다. 실제 코딩 테스트에서 자주 실수합니다.

## 유사 문제 패턴

- `Three Sum`: 세 수의 합이 특정 값이 되는 조합을 찾는 문제입니다. 정렬과 투 포인터가 자주 함께 쓰입니다.
- `Subarray Sum Equals K`: 연속 부분 배열의 합이 `K`가 되는 개수를 구합니다. 해시맵과 prefix sum 조합이 핵심입니다.
- `Two Sum in Sorted Array`: 배열이 정렬되어 있으면 해시맵 대신 투 포인터로 `O(n)`에 풀 수 있습니다.