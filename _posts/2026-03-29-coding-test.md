---
title: "[코딩 테스트] 2026-03-29 — k번째 큰 원소"
date: 2026-03-29 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, heap]
---
## 오늘의 문제 선정 이유
> 데이터가 많아질수록 전체 정렬보다 heap으로 필요한 정보만 관리하는 방식이 더 실전적이기 때문입니다.

## 문제 설명

물류 추천 시스템에서 각 작업의 우선순위 점수가 배열로 주어집니다.  
이때 점수가 큰 작업부터 먼저 처리하려고 합니다.

정수 배열 `scores`와 정수 `k`가 주어질 때, 배열에서 `k`번째로 큰 점수를 구하세요.

단, 같은 점수는 각각 별도의 작업으로 취급합니다.  
즉, 중복 값도 개수만큼 순위에 포함됩니다.

### 함수 형식
- `findKthLargest(scores, k) -> int`

## 입출력 예시

```text
입력: scores = [12, 5, 30, 18, 30, 7], k = 3
출력: 18
설명: 큰 수부터 나열하면 [30, 30, 18, 12, 7, 5]이므로 3번째 큰 수는 18입니다.
```

```text
입력: scores = [-1, 4, 2, 9, 9, 3], k = 5
출력: 2
설명: 큰 수부터 나열하면 [9, 9, 4, 3, 2, -1]이므로 5번째 큰 수는 2입니다.
```

```text
입력: scores = [8], k = 1
출력: 8
설명: 원소가 1개뿐이므로 1번째 큰 수는 8입니다.
```

## 제약 조건

- `1 <= len(scores) <= 200000`
- `-10^9 <= scores[i] <= 10^9`
- `1 <= k <= len(scores)`
- 시간 제한: 정렬 풀이도 가능할 수 있지만, 더 효율적인 풀이를 권장
- 중복 값이 있을 수 있음

## 풀이 접근법

### 핵심 아이디어
이 문제는 배열 전체를 다 정렬하지 않아도 됩니다. 우리가 필요한 것은 오직 `k`번째 큰 값 하나뿐입니다.  
그래서 크기가 `k`인 최소 힙(min-heap)을 유지하면, 현재까지 본 값들 중 가장 큰 값 `k`개만 남길 수 있고, 힙의 루트가 곧 `k`번째 큰 값이 됩니다.

### 단계별 풀이 과정
1. 빈 최소 힙을 하나 만든다.
2. 배열을 앞에서부터 보면서 현재 값을 힙에 넣는다.
3. 힙 크기가 `k`를 초과하면 가장 작은 값을 꺼낸다.
4. 끝까지 반복하면 힙에는 가장 큰 값 `k`개만 남는다.
5. 이때 힙의 최솟값이 전체에서 `k`번째 큰 값이다.

## 코드 풀이

### Python
```python
import heapq

def findKthLargest(scores, k):
    min_heap = []

    for score in scores:
        heapq.heappush(min_heap, score)

        # 가장 큰 값 k개만 유지
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    return min_heap[0]


# 예시 실행
if __name__ == "__main__":
    print(findKthLargest([12, 5, 30, 18, 30, 7], 3))   # 18
    print(findKthLargest([-1, 4, 2, 9, 9, 3], 5))      # 2
    print(findKthLargest([8], 1))                      # 8
```

### JavaScript
```javascript
class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(value) {
    this.heap.push(value);
    this.bubbleUp();
  }

  pop() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return top;
  }

  bubbleUp() {
    let index = this.heap.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent] <= this.heap[index]) break;

      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  bubbleDown() {
    let index = 0;
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }

      if (right < length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

function findKthLargest(scores, k) {
  const minHeap = new MinHeap();

  for (const score of scores) {
    minHeap.push(score);

    // 가장 큰 값 k개만 유지
    if (minHeap.size() > k) {
      minHeap.pop();
    }
  }

  return minHeap.peek();
}

// 예시 실행
console.log(findKthLargest([12, 5, 30, 18, 30, 7], 3)); // 18
console.log(findKthLargest([-1, 4, 2, 9, 9, 3], 5));    // 2
console.log(findKthLargest([8], 1));                    // 8
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n log k)` — 원소 `n`개를 보면서 힙에 넣고 뺄 때마다 `log k`가 걸립니다.
- **공간 복잡도**: `O(k)` — 힙 크기를 최대 `k`개까지만 유지합니다.

## 틀리기 쉬운 포인트

- 중복 값을 제거하면 안 됩니다. 문제는 `k`번째 큰 "서로 다른 값"이 아니라 "원소"를 구하는 것입니다.
- 최대 힙을 직접 만들려고 하다가 구현이 길어질 수 있습니다. 이 문제는 크기 `k`의 최소 힙이 더 간단합니다.
- 힙 크기가 `k`를 초과할 때만 pop 해야 합니다. `k`가 되자마자 pop 하면 답이 틀어집니다.

## 유사 문제 패턴

- 스트리밍 데이터에서 실시간으로 상위 `k`개 값을 유지하는 문제
- `k`개 이하의 회의실, 서버, 작업만 유지하며 최솟값이나 최댓값을 관리하는 문제
- 정렬 대신 `heap`으로 필요한 범위만 추려내는 Top K 문제

---