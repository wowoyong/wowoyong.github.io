---
title: "[코딩 테스트] 2026-05-27 — 태스크 스케줄러"
date: 2026-05-27 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, greedy, queue, heap]
---
## 오늘의 문제 선정 이유
> AI 에이전트, 물류 작업, 비동기 처리처럼 같은 종류의 작업을 간격을 두고 실행하는 문제가 요즘 실무와 코딩 테스트 모두에서 자주 연결됩니다.

## 문제 설명

당신은 작업 서버의 스케줄러를 구현하고 있습니다.

서버에는 여러 개의 태스크가 들어오며, 각 태스크는 알파벳 대문자 `A`부터 `Z` 중 하나의 종류를 가집니다.  
같은 종류의 태스크는 실행 후 `cooldown` 시간 동안 다시 실행할 수 없습니다.

한 번에 하나의 태스크만 처리할 수 있습니다.  
각 태스크를 처리하는 데 걸리는 시간은 정확히 1초입니다.  
만약 현재 실행할 수 있는 태스크가 없다면, 서버는 아무 작업도 하지 않고 1초를 기다려야 합니다.

모든 태스크를 처리하는 데 필요한 최소 시간을 구하세요.

### 함수 설명
- 입력:
  - `tasks`: 태스크 종류를 담은 배열
  - `cooldown`: 같은 태스크를 다시 실행하기 전 기다려야 하는 최소 시간
- 출력:
  - 모든 태스크를 처리하는 최소 시간

## 입출력 예시

```text
입력: tasks = ["A", "A", "A", "B", "B", "C"], cooldown = 2
출력: 7
설명: 가능한 실행 순서 중 하나는 A -> B -> C -> A -> B -> idle -> A 이다.
총 7초가 필요하다.
```

```text
입력: tasks = ["A", "A", "A", "B", "B", "B"], cooldown = 2
출력: 8
설명: 가능한 실행 순서 중 하나는 A -> B -> idle -> A -> B -> idle -> A -> B 이다.
같은 태스크 사이에 2초 간격이 필요해서 idle이 반드시 들어간다.
```

```text
입력: tasks = ["A", "A", "B", "C", "D"], cooldown = 2
출력: 5
설명: A -> B -> C -> A -> D 처럼 배치할 수 있다.
idle 없이 모든 태스크를 처리할 수 있다.
```

## 제약 조건

- `1 <= len(tasks) <= 100000`
- `tasks[i]`는 `"A"` 이상 `"Z"` 이하의 대문자
- `0 <= cooldown <= 100000`
- 시간 제한 내에 동작하려면 `O(N log K)` 이하 수준이 안전하다.
- 여기서 `N`은 태스크 수, `K`는 태스크 종류 수다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 "지금 가장 많이 남은 태스크를 먼저 처리"하는 전략이 유리합니다.  
남은 개수가 많은 태스크를 뒤로 미루면, 나중에 배치할 자리가 부족해져 idle이 늘어날 가능성이 크기 때문입니다.

구현은 `max heap`과 `cooldown queue`를 함께 쓰면 깔끔합니다.  
heap에는 지금 바로 실행 가능한 태스크를 넣고, queue에는 쿨다운 중인 태스크와 다시 꺼낼 수 있는 시점을 넣습니다.

### 단계별 풀이 과정
1. 각 태스크의 등장 횟수를 센다.
2. 실행 가능한 태스크들 중 남은 횟수가 가장 많은 것을 꺼내기 위해 max heap을 만든다.
3. 시간을 1초씩 증가시키며, 현재 시점에 실행 가능한 태스크가 있으면 하나 실행한다.
4. 실행 후 아직 남은 횟수가 있다면 `현재 시간 + cooldown` 이후 다시 실행 가능하므로 queue에 넣는다.
5. queue의 맨 앞 태스크가 다시 실행 가능한 시간이 되면 heap으로 되돌린다.
6. heap과 queue가 모두 빌 때까지 반복한 뒤, 누적 시간을 반환한다.

## 코드 풀이

### Python
```python
from collections import Counter, deque
import heapq


def min_schedule_time(tasks, cooldown):
    counts = Counter(tasks)

    # Python heapq는 min heap이므로 음수로 넣어 max heap처럼 사용
    max_heap = [-count for count in counts.values()]
    heapq.heapify(max_heap)

    # (다시 실행 가능한 시각, 남은 개수)
    wait_queue = deque()

    time = 0

    while max_heap or wait_queue:
        time += 1

        # 현재 실행 가능한 태스크가 있으면 가장 많이 남은 것을 실행
        if max_heap:
            remain = -heapq.heappop(max_heap)
            remain -= 1

            # 아직 남은 작업이 있으면 cooldown이 끝난 뒤 다시 heap에 넣어야 함
            if remain > 0:
                available_time = time + cooldown
                wait_queue.append((available_time, remain))

        # 현재 시점에 다시 실행 가능한 태스크들을 heap으로 복귀
        while wait_queue and wait_queue[0][0] == time:
            _, remain = wait_queue.popleft()
            heapq.heappush(max_heap, -remain)

    return time


if __name__ == "__main__":
    print(min_schedule_time(["A", "A", "A", "B", "B", "C"], 2))  # 7
    print(min_schedule_time(["A", "A", "A", "B", "B", "B"], 2))  # 8
    print(min_schedule_time(["A", "A", "B", "C", "D"], 2))       # 5
```

### JavaScript
```javascript
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  push(value) {
    this.heap.push(value);
    this._bubbleUp();
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown();
    return top;
  }

  _bubbleUp() {
    let index = this.heap.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent] >= this.heap[index]) break;

      [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  _bubbleDown() {
    let index = 0;
    const length = this.heap.length;

    while (true) {
      let largest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.heap[left] > this.heap[largest]) {
        largest = left;
      }

      if (right < length && this.heap[right] > this.heap[largest]) {
        largest = right;
      }

      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

function minScheduleTime(tasks, cooldown) {
  const countMap = new Map();

  for (const task of tasks) {
    countMap.set(task, (countMap.get(task) || 0) + 1);
  }

  const maxHeap = new MaxHeap();
  for (const count of countMap.values()) {
    maxHeap.push(count);
  }

  // [availableTime, remainCount]
  const waitQueue = [];
  let queueHead = 0;

  let time = 0;

  while (maxHeap.size() > 0 || queueHead < waitQueue.length) {
    time += 1;

    if (maxHeap.size() > 0) {
      let remain = maxHeap.pop();
      remain -= 1;

      if (remain > 0) {
        const availableTime = time + cooldown;
        waitQueue.push([availableTime, remain]);
      }
    }

    while (queueHead < waitQueue.length && waitQueue[queueHead][0] === time) {
      const [, remain] = waitQueue[queueHead];
      maxHeap.push(remain);
      queueHead += 1;
    }
  }

  return time;
}

console.log(minScheduleTime(["A", "A", "A", "B", "B", "C"], 2)); // 7
console.log(minScheduleTime(["A", "A", "A", "B", "B", "B"], 2)); // 8
console.log(minScheduleTime(["A", "A", "B", "C", "D"], 2)); // 5
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N log K)` — 각 태스크가 heap에 들어가고 나올 때마다 `log K`가 걸린다.
- **공간 복잡도**: `O(K)` — 태스크 종류별 개수와 heap, queue에 최대 `K`개 수준만 저장한다.

## 틀리기 쉬운 포인트

- `cooldown = 2`일 때, 같은 태스크를 바로 2초 뒤가 아니라 "사이에 2칸 비우고" 실행해야 한다. 시간 계산을 헷갈리기 쉽다.
- queue에서 다시 꺼내는 시점을 `time + cooldown + 1`로 둘지 `time + cooldown`로 둘지 구현 기준을 정확히 맞춰야 한다. 이 풀이에서는 `time`을 먼저 1 증가시킨 뒤 실행하므로 `time + cooldown`이 맞다.
- 실행 가능한 태스크가 없을 때도 시간을 증가시켜야 한다. idle 구간을 건너뛰면 정답이 작아진다.

## 유사 문제 패턴

- 문자열 재배치 문제: 같은 문자가 인접하지 않게 배치하는 문제도 "빈도가 높은 것부터 처리"하는 greedy + heap 패턴이 자주 나온다.
- CPU 작업 스케줄링 문제: 우선순위가 높은 작업을 고르되, 대기 상태와 재진입 시점을 함께 관리하는 방식이 비슷하다.
- 자원 재사용 제한 문제: 같은 서버, 같은 장비, 같은 API key를 일정 시간 뒤에만 다시 쓸 수 있는 문제도 cooldown queue 구조로 풀 수 있다.