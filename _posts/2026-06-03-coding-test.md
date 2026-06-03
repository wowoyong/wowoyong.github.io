---
title: "[코딩 테스트] 2026-06-03 — 빈도 Top K"
date: 2026-06-03 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, hash, dp, heap, sort]
---
## 오늘의 문제 선정 이유
> 추천 시스템, 로그 분석, 학습 콘텐츠 랭킹처럼 자주 등장하는 항목을 빠르게 뽑는 문제가 오늘 트렌드와 잘 맞습니다.

## 문제 설명

온라인 코딩 테스트 플랫폼에서 사용자가 푼 문제 번호 기록이 배열로 주어집니다.

배열 `records`에는 사용자가 푼 문제 번호가 순서대로 들어 있습니다.  
가장 많이 등장한 문제 번호 `k`개를 반환하세요.

등장 횟수가 같다면 문제 번호가 작은 것이 더 앞에 와야 합니다.

결과는 다음 기준으로 정렬해야 합니다.

1. 등장 횟수가 많은 순서
2. 등장 횟수가 같으면 문제 번호가 작은 순서

## 입출력 예시

```text
입력:
8 2
3 1 3 2 2 3 1 4

출력:
3 1

설명:
3은 3번, 1과 2는 각각 2번 등장합니다.
상위 2개는 3과 1입니다.
1과 2는 빈도가 같으므로 더 작은 1이 선택됩니다.
```

```text
입력:
10 3
5 5 7 7 7 2 2 9 9 9

출력:
7 9 2

설명:
7과 9는 각각 3번 등장합니다.
문제 번호가 작은 7이 먼저 옵니다.
2와 5는 각각 2번 등장하며, 더 작은 2가 선택됩니다.
```

## 제약 조건

- `1 <= n <= 200,000`
- `1 <= k <= 서로 다른 문제 번호의 개수`
- `1 <= records[i] <= 1,000,000`
- 시간 제한은 `O(n log k)` 또는 `O(n)` 수준을 기대합니다.

## 풀이 접근법

### 핵심 아이디어

빈도 Top K 문제는 먼저 `hash-map`으로 각 원소의 등장 횟수를 세야 합니다.  
그다음 모든 원소를 정렬하면 `O(m log m)`이 걸립니다. 여기서 `m`은 서로 다른 원소 개수입니다.  
`k`개만 필요하므로 크기 `k`짜리 min-heap을 쓰면 `O(m log k)`로 줄일 수 있습니다.

### 단계별 풀이 과정

1. `freqMap`에 각 문제 번호의 등장 횟수를 저장합니다.
2. heap에는 현재까지의 Top K 후보만 유지합니다.
3. heap의 기준은 “가장 나쁜 후보”가 루트에 오도록 잡습니다.
4. 새 후보를 넣고 heap 크기가 `k`를 넘으면 루트를 제거합니다.
5. heap에 남은 원소를 빈도 내림차순, 번호 오름차순으로 정렬해 출력합니다.

## 코드 풀이

### Python

```python
import sys
import heapq
from collections import Counter

def top_k_frequent(records, k):
    freq = Counter(records)

    heap = []

    for num, count in freq.items():
        # count가 작을수록 나쁜 후보
        # count가 같으면 num이 클수록 나쁜 후보
        heapq.heappush(heap, (count, -num))

        if len(heap) > k:
            heapq.heappop(heap)

    result = [(-neg_num, count) for count, neg_num in heap]

    # 최종 출력 기준: 빈도 내림차순, 번호 오름차순
    result.sort(key=lambda x: (-x[1], x[0]))

    return [num for num, count in result]

def main():
    input_data = sys.stdin.read().strip().split()

    n = int(input_data[0])
    k = int(input_data[1])
    records = list(map(int, input_data[2:2 + n]))

    answer = top_k_frequent(records, k)
    print(*answer)

if __name__ == "__main__":
    main()
```

### JavaScript

```javascript
const fs = require("fs");

class MinHeap {
  constructor(compare) {
    this.heap = [];
    this.compare = compare;
  }

  size() {
    return this.heap.length;
  }

  push(value) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return root;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (!this.compare(this.heap[index], this.heap[parent])) {
        break;
      }

      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  bubbleDown(index) {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest])) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest])) {
        smallest = right;
      }

      if (smallest === index) {
        break;
      }

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }

  values() {
    return this.heap;
  }
}

function topKFrequent(records, k) {
  const freqMap = new Map();

  for (const num of records) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // 더 나쁜 후보가 heap 위로 올라온다.
  // 빈도가 낮으면 나쁘다.
  // 빈도가 같으면 번호가 크면 나쁘다.
  const heap = new MinHeap((a, b) => {
    if (a.count !== b.count) {
      return a.count < b.count;
    }
    return a.num > b.num;
  });

  for (const [num, count] of freqMap.entries()) {
    heap.push({ num, count });

    if (heap.size() > k) {
      heap.pop();
    }
  }

  return heap.values()
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.num - b.num;
    })
    .map((item) => item.num);
}

function main() {
  const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

  const n = input[0];
  const k = input[1];
  const records = input.slice(2, 2 + n);

  const answer = topKFrequent(records, k);
  console.log(answer.join(" "));
}

main();
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n + m log k) — `n`개 기록을 세고, 서로 다른 원소 `m`개를 heap에 넣습니다.
- **공간 복잡도**: O(m + k) — 빈도 map에 `m`개, heap에 최대 `k`개를 저장합니다.

## 틀리기 쉬운 포인트

- 빈도가 같은 경우의 tie-break를 빼먹기 쉽습니다.
- heap에서 제거할 후보는 “가장 좋은 후보”가 아니라 “가장 나쁜 후보”여야 합니다.
- 최종 heap 내부 순서는 정렬된 상태가 아닙니다. 출력 전에 다시 정렬해야 합니다.

## 유사 문제 패턴

- 가장 많이 등장한 단어 `k`개 찾기
- 실시간 로그에서 상위 `k`개 API endpoint 찾기
- 상품 클릭 기록에서 인기 상품 `k`개 추천하기