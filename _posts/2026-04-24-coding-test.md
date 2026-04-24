---
title: "[코딩 테스트] 2026-04-24 — 최장 증가 부분 수열 (LIS)"
date: 2026-04-24 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, string, dp]
---
## 오늘의 문제 선정 이유
> 학습 로드맵과 추천 시스템처럼 순서를 유지한 채 점점 더 높은 값을 고르는 문제가 많아서, 오늘은 LIS를 선택했습니다.

## 문제 설명

한 개발자가 여러 기술 문서를 읽으며 각 문서에 대해 "이해도 상승 점수"를 기록했습니다.  
점수는 읽은 순서대로 배열에 담겨 있습니다.

이 개발자는 학습 흐름이 좋은 구간만 다시 복습하려고 합니다.  
복습할 구간은 반드시 원래 읽은 순서를 유지해야 합니다.  
또한 뒤로 갈수록 점수가 엄격하게 증가해야 합니다.

배열이 주어질 때, 만들 수 있는 가장 긴 증가하는 부분 수열의 길이를 구하세요.

여기서 부분 수열은 원소를 일부 건너뛸 수 있지만, 순서는 바꾸면 안 됩니다.

## 입출력 예시

```text
입력:
8
5 2 8 6 3 6 9 7

출력:
4

설명:
가능한 증가 부분 수열 중 하나는 2 3 6 9 이고, 길이는 4입니다.
```

```text
입력:
6
10 20 10 30 20 50

출력:
4

설명:
가능한 증가 부분 수열 중 하나는 10 20 30 50 입니다.
```

```text
입력:
5
9 8 7 6 5

출력:
1

설명:
증가하는 두 수를 고를 수 없으므로, 각 원소 하나만 선택할 수 있습니다.
```

## 제약 조건

- `1 <= N <= 200000`
- `1 <= scores[i] <= 1000000000`
- 시간 제한: 1초 ~ 2초
- 같은 값은 증가로 보지 않습니다. 반드시 `strictly increasing` 이어야 합니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 배열 전체를 다 보면서 "각 위치를 마지막으로 하는 최장 증가 부분 수열"을 생각할 수 있습니다. 이 방법은 직관적이지만 `O(n^2)`이라 입력이 크면 느립니다.  
그래서 실제 코딩 테스트에서는 "길이별로 만들 수 있는 가장 작은 끝값"을 관리하고, 새 값을 이진 탐색으로 넣는 `O(n log n)` 풀이가 더 적합합니다.

### 단계별 풀이 과정
1. `tails` 배열을 준비합니다.  
   `tails[len]`은 길이가 `len + 1`인 증가 부분 수열을 만들 때 가능한 가장 작은 끝값을 의미합니다.

2. 배열을 왼쪽부터 하나씩 확인합니다.  
   현재 값 `x`를 `tails`에서 이진 탐색해, 처음으로 `x` 이상이 나오는 위치를 찾습니다.

3. 찾은 위치가 `tails` 길이와 같다면 `x`를 뒤에 추가합니다.  
   더 긴 증가 부분 수열을 새로 만들 수 있다는 뜻입니다.

4. 그렇지 않다면 그 위치 값을 `x`로 바꿉니다.  
   길이는 그대로지만 끝값을 더 작게 만들어, 이후 더 긴 수열로 이어질 가능성을 키웁니다.

5. 모든 값을 처리한 뒤 `tails`의 길이가 정답입니다.

## 코드 풀이

### Python
```python
import sys
from bisect import bisect_left

def solve():
    input = sys.stdin.readline

    n = int(input().strip())
    scores = list(map(int, input().split()))

    tails = []

    for x in scores:
        # x 이상이 처음 나오는 위치를 찾는다.
        idx = bisect_left(tails, x)

        if idx == len(tails):
            # x를 뒤에 붙이면 더 긴 증가 부분 수열을 만들 수 있다.
            tails.append(x)
        else:
            # 같은 길이의 수열 끝값을 더 작게 바꿔서 이후 확장에 유리하게 만든다.
            tails[idx] = x

    print(len(tails))

if __name__ == "__main__":
    solve()
```

### JavaScript
```javascript
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

let idx = 0;
const n = input[idx++];
const scores = input.slice(idx, idx + n);

const tails = [];

// lowerBound: arr에서 target 이상이 처음 나오는 위치
function lowerBound(arr, target) {
  let left = 0;
  let right = arr.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] >= target) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  return left;
}

for (const x of scores) {
  const pos = lowerBound(tails, x);

  if (pos === tails.length) {
    // 더 긴 증가 부분 수열 생성
    tails.push(x);
  } else {
    // 같은 길이 수열의 끝값을 더 작게 갱신
    tails[pos] = x;
  }
}

console.log(tails.length.toString());
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n log n)` — 각 원소마다 이진 탐색을 한 번 수행합니다.
- **공간 복잡도**: `O(n)` — 최악의 경우 `tails`에 모든 원소가 들어갈 수 있습니다.

## 틀리기 쉬운 포인트

- 같은 값은 증가가 아닙니다. `bisect_right`가 아니라 `bisect_left` 기준으로 처리해야 합니다.
- `tails` 자체가 실제 LIS 수열이라고 오해하면 안 됩니다. 정답 길이를 구하기 위한 보조 배열입니다.
- 입력 크기가 크므로 `O(n^2)` DP로 풀면 시간 초과가 날 수 있습니다.

## 유사 문제 패턴

- 전깃줄 정리 문제: 한 축으로 정렬한 뒤 다른 축에서 LIS를 구하는 유형입니다.
- 박스 포개기 문제: 조건에 맞게 정렬한 뒤 증가 부분 수열로 바꾸는 유형입니다.
- 최대 길이 증가 수열 복원 문제: 길이만 구하지 않고, 이전 위치를 저장해 실제 수열까지 출력하는 유형입니다.