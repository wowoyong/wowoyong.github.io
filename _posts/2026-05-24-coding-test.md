---
title: "[코딩 테스트] 2026-05-24 — k번째 큰 원소"
date: 2026-05-24 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, heap]
---
## 오늘의 문제 선정 이유
> 추천 시스템, 우선순위 처리, 대용량 로그 정렬처럼 순위를 빠르게 뽑는 요구가 많아서 오늘은 `heap` 기반의 k번째 큰 원소 문제를 선택했다.

## 문제 설명

영상 플랫폼에서 하루 동안 업로드된 콘텐츠의 점수를 분석하려고 합니다.

각 콘텐츠에는 정수 점수 하나가 있습니다. 점수는 음수일 수도 있고, 같은 점수가 여러 번 나올 수도 있습니다.  
운영팀은 "오늘 업로드된 콘텐츠 중 점수가 k번째로 큰 값"을 알고 싶어 합니다.

배열 `scores`와 정수 `k`가 주어질 때, `k번째로 큰 점수`를 반환하세요.

주의할 점은 다음과 같습니다.

- 같은 점수도 각각 개별 콘텐츠로 취급합니다.
- 정렬로 바로 풀 수 있지만, 더 효율적인 방법을 고민해야 합니다.

## 입출력 예시

```text
입력: scores = [70, 90, 85, 90, 60], k = 2
출력: 90
설명: 큰 순서대로 나열하면 [90, 90, 85, 70, 60] 이므로 2번째 큰 값은 90이다.
```

```text
입력: scores = [15, -3, 22, 8, 22, 11], k = 4
출력: 11
설명: 큰 순서대로 나열하면 [22, 22, 15, 11, 8, -3] 이므로 4번째 큰 값은 11이다.
```

```text
입력: scores = [5], k = 1
출력: 5
설명: 원소가 하나뿐이므로 1번째 큰 값은 5이다.
```

## 제약 조건

- `1 <= len(scores) <= 200000`
- `-10^9 <= scores[i] <= 10^9`
- `1 <= k <= len(scores)`
- 시간 제한: 정렬 풀이도 가능할 수 있지만, `O(n log k)` 풀이를 목표로 한다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 배열 전체를 다 정렬하지 않아도 됩니다. 우리가 정말 필요한 것은 "큰 값 k개만 유지하는 것"입니다.

그래서 `min-heap`을 사용합니다. heap의 크기를 항상 `k`로 유지하면, heap 안에는 현재까지 본 값들 중 가장 큰 값 `k개`만 남습니다. 이때 heap의 최솟값이 바로 전체에서 `k번째로 큰 값`이 됩니다.

### 단계별 풀이 과정
1. 빈 `min-heap`을 만든다.
2. `scores`를 처음부터 끝까지 하나씩 heap에 넣는다.
3. heap의 크기가 `k`를 초과하면 가장 작은 값을 하나 제거한다.
4. 모든 원소를 처리한 뒤, heap의 top 값을 반환한다.
5. 이 값이 전체 배열에서 `k번째로 큰 원소`다.

## 코드 풀이

### Python
```python
import heapq

def kth_largest_score(scores, k):
    # 가장 큰 값 k개만 유지하는 최소 힙
    min_heap = []

    for score in scores:
        heapq.heappush(min_heap, score)

        # 힙 크기가 k를 넘으면 가장 작은 값을 제거
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    # 힙의 최솟값이 k번째로 큰 값
    return min_heap[0]


# 테스트
print(kth_largest_score([70, 90, 85, 90, 60], 2))   # 90
print(kth_largest_score([15, -3, 22, 8, 22, 11], 4))  # 11
print(kth_largest_score([5], 1))  # 5
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

    const minValue = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return minValue;
  }

  bubbleUp() {
    let index = this.size() - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.heap[parent] <= this.heap[index]) break;

      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  bubbleDown() {
    let index = 0;
    const length = this.size();

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

function kthLargestScore(scores, k) {
  const minHeap = new MinHeap();

  for (const score of scores) {
    minHeap.push(score);

    // 힙 크기가 k를 넘으면 가장 작은 값을 제거
    if (minHeap.size() > k) {
      minHeap.pop();
    }
  }

  // 힙의 최솟값이 k번째로 큰 값
  return minHeap.peek();
}

// 테스트
console.log(kthLargestScore([70, 90, 85, 90, 60], 2)); // 90
console.log(kthLargestScore([15, -3, 22, 8, 22, 11], 4)); // 11
console.log(kthLargestScore([5], 1)); // 5
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n log k)` — 원소 `n`개를 보면서 heap에 넣고 빼는 연산이 최대 `log k` 걸린다.
- **공간 복잡도**: `O(k)` — heap 크기를 최대 `k`개만 유지한다.

## 틀리기 쉬운 포인트

- 중복 값을 제거하면 안 됩니다. 같은 점수도 각각 순위에 포함됩니다.
- `max-heap`으로 전체를 다 넣는 방법도 가능하지만, 이 문제에서는 `min-heap` 크기 `k` 유지가 더 효율적입니다.
- `k == len(scores)`인 경우, 정답은 전체 최솟값입니다. 이 경우도 현재 풀이로 자연스럽게 처리됩니다.

## 유사 문제 패턴

- 실시간으로 들어오는 숫자 중 상위 `k개` 유지하기
- 로그 데이터에서 응답 시간이 가장 긴 `k번째` 요청 찾기
- 정렬하지 않고 `k`개 후보만 남기는 `Top K` 문제