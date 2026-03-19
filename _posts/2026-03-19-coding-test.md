---
title: "[코딩 테스트] 2026-03-19 — K개 정렬 리스트 병합"
date: 2026-03-19 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, heap]
---
## 오늘의 문제 선정 이유
> 여러 정렬된 데이터 스트림을 하나로 합치는 문제는 물류, API 응답 통합, 로그 처리처럼 최근 개발 트렌드와도 맞닿아 있고 코딩 테스트에서도 자주 변형되어 나온다.

## 문제 설명

여러 서비스에서 생성한 작업 우선순위 목록이 연결 리스트 형태로 들어온다.  
각 연결 리스트는 오름차순으로 정렬되어 있다.  
이제 이 K개의 정렬된 연결 리스트를 하나의 오름차순 연결 리스트로 합쳐야 한다.

함수 `mergeKLists(lists)`를 구현하라.

- `lists[i]`는 i번째 정렬된 연결 리스트의 head이다.
- 각 노드는 정수 값 `val`과 다음 노드를 가리키는 `next`를 가진다.
- 비어 있는 리스트가 포함될 수 있다.
- 결과는 새로 정렬된 하나의 연결 리스트 head를 반환하면 된다.

예를 들어 아래와 같은 입력이 있을 수 있다.

- 서비스 A: `1 -> 4 -> 7`
- 서비스 B: `2 -> 5 -> 8`
- 서비스 C: `3 -> 6 -> 9`

이들을 합치면 `1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9`가 되어야 한다.

## 입출력 예시

```text
입력: lists = [[1,4,7], [2,5,8], [3,6,9]]
출력: [1,2,3,4,5,6,7,8,9]
설명: 각 배열은 정렬된 연결 리스트를 뜻한다. 세 리스트의 가장 작은 값부터 차례대로 이어 붙이면 된다.
```

```text
입력: lists = [[1,3,3], [], [2,2,10], [4]]
출력: [1,2,2,3,3,4,10]
설명: 빈 리스트는 무시하고, 남은 리스트의 현재 head 중 가장 작은 값을 반복해서 선택한다.
```

```text
입력: lists = [[], [], []]
출력: []
설명: 모든 리스트가 비어 있으므로 결과도 빈 리스트다.
```

## 제약 조건

- `0 <= K <= 10^4`
- 각 연결 리스트의 길이 합을 `N`이라 할 때, `0 <= N <= 10^5`
- 각 노드의 값은 `-10^9 <= val <= 10^9`
- 각 연결 리스트는 오름차순으로 정렬되어 있다.
- 시간 제한을 고려하면 모든 노드를 단순히 매번 선형 탐색하는 방식은 비효율적일 수 있다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 매 순간 K개의 리스트 head 중 가장 작은 값을 빨리 찾아야 한다.  
매번 K개를 전부 비교하면 비효율적이므로, 최소 힙 `min-heap`을 쓰면 가장 작은 값을 `O(log K)`에 꺼낼 수 있다.  
즉, "현재 후보들만 힙에 넣고 가장 작은 노드를 반복해서 꺼내는 방식"이 이 문제에 가장 잘 맞는다.

### 단계별 풀이 과정
1. 각 연결 리스트의 head가 존재하면 최소 힙에 넣는다.
2. 힙에서 가장 작은 노드를 꺼내 결과 리스트 뒤에 붙인다.
3. 방금 꺼낸 노드의 `next`가 있으면 그 노드도 힙에 넣는다.
4. 힙이 빌 때까지 반복한다.
5. 더미 노드 `dummy`를 사용하면 연결 리스트를 쉽게 구성할 수 있다.

## 코드 풀이

### Python
```python
import heapq
from typing import List, Optional


class ListNode:
    def __init__(self, val: int = 0, next: Optional["ListNode"] = None):
        self.val = val
        self.next = next


class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # 최소 힙에는 (node.val, unique_id, node)를 넣는다.
        # 같은 값이 들어올 수 있으므로 unique_id로 비교 충돌을 막는다.
        min_heap = []
        unique_id = 0

        for node in lists:
            if node is not None:
                heapq.heappush(min_heap, (node.val, unique_id, node))
                unique_id += 1

        dummy = ListNode(0)
        tail = dummy

        while min_heap:
            _, _, node = heapq.heappop(min_heap)

            # 가장 작은 노드를 결과 리스트에 연결
            tail.next = node
            tail = tail.next

            # 다음 노드가 있으면 힙에 추가
            if node.next is not None:
                heapq.heappush(min_heap, (node.next.val, unique_id, node.next))
                unique_id += 1

        # 마지막 노드의 next는 그대로여도 동작하지만,
        # 명시적으로 끊어 주면 더 안전하다.
        tail.next = None

        return dummy.next
```

### JavaScript
```javascript
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

class MinHeap {
  constructor() {
    this.data = [];
  }

  size() {
    return this.data.length;
  }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    if (this.data.length === 1) return this.data.pop();

    const top = this.data[0];
    this.data[0] = this.data.pop();
    this._bubbleDown(0);
    return top;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.data[parent][0] <= this.data[index][0]) break;

      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];
      index = parent;
    }
  }

  _bubbleDown(index) {
    const length = this.data.length;

    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.data[left][0] < this.data[smallest][0]) {
        smallest = left;
      }

      if (right < length && this.data[right][0] < this.data[smallest][0]) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.data[index], this.data[smallest]] = [this.data[smallest], this.data[index]];
      index = smallest;
    }
  }
}

function mergeKLists(lists) {
  const heap = new MinHeap();

  // 각 리스트의 head를 힙에 넣는다.
  for (const node of lists) {
    if (node !== null) {
      heap.push([node.val, node]);
    }
  }

  const dummy = new ListNode(0);
  let tail = dummy;

  while (heap.size() > 0) {
    const [_, node] = heap.pop();

    // 가장 작은 노드를 결과 리스트에 연결
    tail.next = node;
    tail = tail.next;

    // 다음 노드가 있으면 힙에 넣는다.
    if (node.next !== null) {
      heap.push([node.next.val, node.next]);
    }
  }

  tail.next = null;
  return dummy.next;
}
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N log K)` — 총 `N`개의 노드를 한 번씩 힙에 넣고 빼며, 각 연산이 `O(log K)`이기 때문이다.
- **공간 복잡도**: `O(K)` — 힙에는 최대 K개의 노드만 들어 있기 때문이다.

## 틀리기 쉬운 포인트

- 같은 값이 여러 리스트에 동시에 있을 수 있다. Python 힙에서는 노드 객체끼리 직접 비교되지 않도록 추가 식별자가 필요하다.
- 빈 리스트가 섞여 있을 수 있다. 처음 힙에 넣을 때 `None` 체크를 빼먹기 쉽다.
- 결과 리스트를 만들 때 `tail = tail.next`를 빠뜨리면 연결이 꼬인다.

## 유사 문제 패턴

- 여러 정렬 배열 병합: 연결 리스트 대신 배열이지만, "현재 후보 중 최솟값 선택"이라는 구조가 같다.
- 외부 정렬 로그 합치기: 파일이나 스트림 여러 개에서 정렬된 레코드를 하나로 합칠 때 같은 방식이 쓰인다.
- K개 목록에서 상위 M개 추출: 모든 원소를 다 합치지 않고도 힙으로 현재 후보를 관리하는 발상이 그대로 통한다.