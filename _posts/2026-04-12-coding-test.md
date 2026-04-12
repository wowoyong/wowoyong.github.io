---
title: "[코딩 테스트] 2026-04-12 — 빈도 Top K"
date: 2026-04-12 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, hash, heap, sort]
---
## 오늘의 문제 선정 이유
> SaaS 서비스와 개발자 도구가 많아질수록 로그에서 "가장 많이 나온 값"을 빠르게 뽑는 문제가 자주 나오기 때문입니다.

## 문제 설명

한 SaaS 서비스에서 하루 동안 발생한 `eventId` 로그가 정수 배열로 주어집니다.  
이때 가장 자주 등장한 `k`개의 `eventId`를 반환하세요.

단, 등장 횟수가 같다면 숫자가 더 작은 `eventId`를 먼저 반환해야 합니다.

반환 결과는 다음 규칙을 따라야 합니다.

- 등장 횟수가 높은 순서대로 정렬
- 등장 횟수가 같다면 `eventId`가 작은 순서대로 정렬

### 함수 시그니처 예시

- Python: `def top_k_events(events, k):`
- JavaScript: `function topKEvents(events, k)`

## 입출력 예시

```text
입력: events = [4, 1, 4, 2, 1, 4, 3, 2, 2], k = 2
출력: [2, 4]
설명:
4는 3번 등장
2도 3번 등장
1은 2번 등장
3은 1번 등장
가장 많이 등장한 2개는 2와 4이다.
등장 횟수는 같으므로 더 작은 숫자인 2가 먼저 온다.
```

```text
입력: events = [10, 10, 20, 30, 20, 10, 30, 30, 40], k = 3
출력: [10, 30, 20]
설명:
10은 3번, 30은 3번, 20은 2번, 40은 1번 등장한다.
상위 3개는 10, 30, 20이다.
10과 30은 빈도가 같으므로 더 작은 10이 먼저 온다.
```

```text
입력: events = [7, 7, 7, 8, 8, 9], k = 1
출력: [7]
설명:
가장 많이 등장한 값은 7이다.
```

## 제약 조건

- `1 <= len(events) <= 100000`
- `-10^9 <= events[i] <= 10^9`
- `1 <= k <= 서로 다른 eventId의 개수`
- 시간 제한: `1초 ~ 2초` 수준
- 가능한 한 `O(n log k)` 또는 `O(n)`에 가깝게 해결하는 것이 좋음

## 풀이 접근법

### 핵심 아이디어
이 문제의 핵심은 각 값이 몇 번 나왔는지 빠르게 세는 것입니다.  
그래서 먼저 `hash map`으로 빈도를 구하고, 그다음 상위 `k`개만 관리할 수 있는 `min-heap`을 쓰면 전체를 다 정렬하지 않고도 답을 구할 수 있습니다.

### 단계별 풀이 과정
1. `hash map`을 사용해 각 `eventId`의 등장 횟수를 센다.
2. `(frequency, -eventId)` 기준으로 `min-heap`에 넣고, 크기가 `k`를 넘으면 가장 우선순위가 낮은 원소를 제거한다.
3. 힙에 남은 원소를 꺼내서 `(빈도 내림차순, 값 오름차순)`으로 다시 정렬한 뒤 `eventId`만 반환한다.

## 코드 풀이

### Python
```python
import heapq

def top_k_events(events, k):
    # 1. 빈도 계산
    freq = {}
    for event in events:
        freq[event] = freq.get(event, 0) + 1

    # 2. 상위 k개만 유지하는 min-heap
    # heap 원소: (count, -eventId)
    # count가 작을수록 우선 제거
    # count가 같다면 eventId가 큰 값이 먼저 제거되도록 -eventId 사용
    heap = []

    for event, count in freq.items():
        heapq.heappush(heap, (count, -event))
        if len(heap) > k:
            heapq.heappop(heap)

    # 3. 결과 정렬
    # 최종 출력은 빈도 내림차순, eventId 오름차순
    result = []
    while heap:
        count, neg_event = heapq.heappop(heap)
        result.append((-neg_event, count))

    result.sort(key=lambda x: (-x[1], x[0]))

    return [event for event, _ in result]


# 예시 실행
if __name__ == "__main__":
    print(top_k_events([4, 1, 4, 2, 1, 4, 3, 2, 2], 2))  # [2, 4]
    print(top_k_events([10, 10, 20, 30, 20, 10, 30, 30, 40], 3))  # [10, 30, 20]
    print(top_k_events([7, 7, 7, 8, 8, 9], 1))  # [7]
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

  compare(a, b) {
    // a, b: [count, negEvent]
    // 더 작은 원소가 위로 올라오는 min-heap
    if (a[0] !== b[0]) return a[0] - b[0];
    return a[1] - b[1];
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
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;

      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
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

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

function topKEvents(events, k) {
  // 1. 빈도 계산
  const freq = new Map();
  for (const event of events) {
    freq.set(event, (freq.get(event) || 0) + 1);
  }

  // 2. 상위 k개만 유지하는 min-heap
  const heap = new MinHeap();

  for (const [event, count] of freq.entries()) {
    heap.push([count, -event]);

    if (heap.size() > k) {
      heap.pop();
    }
  }

  // 3. 결과 복원
  const result = [];
  while (heap.size() > 0) {
    const [count, negEvent] = heap.pop();
    result.push([-negEvent, count]);
  }

  result.sort((a, b) => {
    // 빈도 내림차순, eventId 오름차순
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] - b[0];
  });

  return result.map(([event]) => event);
}

// 예시 실행
console.log(topKEvents([4, 1, 4, 2, 1, 4, 3, 2, 2], 2)); // [2, 4]
console.log(topKEvents([10, 10, 20, 30, 20, 10, 30, 30, 40], 3)); // [10, 30, 20]
console.log(topKEvents([7, 7, 7, 8, 8, 9], 1)); // [7]
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n + m log k)` — `n`개를 세고, 서로 다른 값 `m`개를 힙에 넣고 뺀다.
- **공간 복잡도**: `O(m + k)` — 빈도 저장용 `hash map`과 크기 `k`의 힙이 필요하다.

## 틀리기 쉬운 포인트

- 빈도만 비교하고, 빈도가 같은 경우의 정렬 조건을 빼먹기 쉽습니다.
- 힙에는 전체를 넣는 것이 아니라 `k`개만 유지해야 시간 이점이 있습니다.
- 최종 결과는 힙에서 꺼낸 순서 그대로 쓰면 안 됩니다. 한 번 더 문제의 정렬 조건에 맞게 정리해야 합니다.

## 유사 문제 패턴

- 문자열에서 가장 많이 나온 `k`개의 단어 구하기  
빈도 계산 후 우선순위 기준을 함께 처리하는 문제입니다.

- 로그 파일에서 상위 `k`개 에러 코드 찾기  
실무 로그 분석 형태로 자주 바뀌어 출제됩니다.

- 판매 데이터에서 가장 많이 팔린 `k`개 상품 찾기  
배열 원소만 달라질 뿐, `hash map + heap` 구조는 그대로 사용할 수 있습니다.