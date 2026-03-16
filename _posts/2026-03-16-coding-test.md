---
title: "[코딩 테스트] 2026-03-16 — 태스크 스케줄러"
date: 2026-03-16 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, greedy, queue, heap]
---
## 오늘의 문제 선정 이유
> AI 에이전트, 물류 최적화, 대규모 서비스 운영처럼 작업을 순서대로 안전하게 처리하는 문제가 다시 주목받고 있어서입니다.

## 문제 설명

문자열로 표현된 서버 작업 목록 `tasks`와 정수 `cooldown`이 주어집니다.

각 작업은 1초 동안 실행됩니다. 같은 종류의 작업은 한 번 실행한 뒤 `cooldown`초 동안 다시 실행할 수 없습니다.  
그 사이에는 다른 작업을 실행하거나, 실행할 작업이 없으면 쉬는 시간(`idle`)을 가져야 합니다.

모든 작업을 끝내기 위한 최소 시간을 구하세요.

예를 들어 작업이 `["A", "A", "A", "B", "B", "C"]`이고 `cooldown = 2`라면,  
같은 작업 사이에는 최소 2초의 간격이 있어야 합니다.

가능한 실행 순서 중 하나는 다음과 같습니다.

`A -> B -> C -> A -> B -> idle -> A`

이 경우 총 7초가 걸립니다.

함수 시그니처 예시:
- Python: `def min_schedule_time(tasks, cooldown):`
- JavaScript: `function minScheduleTime(tasks, cooldown)`

## 입출력 예시

```text
입력: tasks = ["A", "A", "A", "B", "B", "C"], cooldown = 2
출력: 7
설명: A, B, C, A, B, idle, A 순서로 실행하면 최소 시간이다.
```

```text
입력: tasks = ["A", "A", "A", "B", "B", "B"], cooldown = 2
출력: 8
설명: A, B, idle, A, B, idle, A, B 가 최소다.
```

```text
입력: tasks = ["A", "A", "B", "C", "D"], cooldown = 1
출력: 5
설명: A, B, A, C, D 처럼 idle 없이 모두 실행할 수 있다.
```

## 제약 조건

- `1 <= len(tasks) <= 100000`
- `tasks[i]`는 대문자 알파벳 또는 영문 문자열
- `0 <= cooldown <= 100000`
- 시간 제한 기준으로 `O(n log k)` 또는 그에 준하는 풀이를 목표로 한다
- `k`는 서로 다른 작업 종류의 개수

## 풀이 접근법

### 핵심 아이디어
이 문제는 매 초마다 "지금 실행할 수 있는 작업 중 남은 개수가 가장 많은 작업"을 고르는 것이 유리합니다.  
남은 개수가 많은 작업을 뒤로 미루면 나중에 같은 작업 때문에 idle이 길어질 수 있기 때문입니다.

구현은 `max heap`과 `queue`를 같이 쓰면 됩니다.  
`heap`은 지금 바로 실행 가능한 작업 중 우선순위가 가장 높은 작업을 고르고, `queue`는 쿨다운이 끝날 시간을 관리합니다.

### 단계별 풀이 과정
1. 각 작업의 등장 횟수를 `frequency`로 센다.
2. 남은 횟수가 큰 작업부터 꺼낼 수 있도록 `max heap`에 넣는다.
3. 시간을 1초씩 증가시키며, 현재 시점에 실행 가능한 작업이 있으면 하나 꺼내 실행한다.
4. 실행 후 아직 횟수가 남아 있으면 `(다시 실행 가능한 시각, 남은 횟수)` 형태로 `queue`에 넣는다.
5. 매 초 시작 시점마다 쿨다운이 끝난 작업을 `queue`에서 꺼내 다시 `heap`으로 옮긴다.
6. `heap`과 `queue`가 모두 빌 때까지 반복한 뒤, 총 시간을 반환한다.

## 코드 풀이

### Python
```python
from collections import Counter, deque
import heapq

def min_schedule_time(tasks, cooldown):
    if not tasks:
        return 0

    # Python heapq는 min heap이므로 음수로 넣어서 max heap처럼 사용한다.
    freq = Counter(tasks)
    max_heap = [-count for count in freq.values()]
    heapq.heapify(max_heap)

    # (available_time, remaining_count)
    wait_queue = deque()

    time = 0

    while max_heap or wait_queue:
        time += 1

        # 현재 시각에 다시 실행 가능한 작업들을 heap으로 복귀
        while wait_queue and wait_queue[0][0] <= time:
            _, remaining_count = wait_queue.popleft()
            heapq.heappush(max_heap, -remaining_count)

        if max_heap:
            count = -heapq.heappop(max_heap)
            count -= 1

            # 아직 남은 작업이 있으면 cooldown 이후 다시 실행 가능
            if count > 0:
                available_time = time + cooldown + 1
                wait_queue.append((available_time, count))

    return time


# 예시 실행
if __name__ == "__main__":
    print(min_schedule_time(["A", "A", "A", "B", "B", "C"], 2))  # 7
    print(min_schedule_time(["A", "A", "A", "B", "B", "B"], 2))  # 8
    print(min_schedule_time(["A", "A", "B", "C", "D"], 1))       # 5
```

### JavaScript
```javascript
class MaxHeap {
  constructor() {
    this.data = [];
  }

  size() {
    return this.data.length;
  }

  push(value) {
    this.data.push(value);
    this._bubbleUp();
  }

  pop() {
    if (this.data.length === 0) return null;
    if (this.data.length === 1) return this.data.pop();

    const top = this.data[0];
    this.data[0] = this.data.pop();
    this._bubbleDown();
    return top;
  }

  _bubbleUp() {
    let index = this.data.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.data[parent] >= this.data[index]) break;

      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];
      index = parent;
    }
  }

  _bubbleDown() {
    let index = 0;
    const length = this.data.length;

    while (true) {
      let largest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;

      if (left < length && this.data[left] > this.data[largest]) {
        largest = left;
      }

      if (right < length && this.data[right] > this.data[largest]) {
        largest = right;
      }

      if (largest === index) break;

      [this.data[index], this.data[largest]] = [this.data[largest], this.data[index]];
      index = largest;
    }
  }
}

function minScheduleTime(tasks, cooldown) {
  if (tasks.length === 0) return 0;

  const freqMap = new Map();
  for (const task of tasks) {
    freqMap.set(task, (freqMap.get(task) || 0) + 1);
  }

  const maxHeap = new MaxHeap();
  for (const count of freqMap.values()) {
    maxHeap.push(count);
  }

  // queue element: [availableTime, remainingCount]
  const waitQueue = [];
  let front = 0;
  let time = 0;

  while (maxHeap.size() > 0 || front < waitQueue.length) {
    time += 1;

    // 현재 시각에 다시 사용할 수 있는 작업을 heap으로 복귀
    while (front < waitQueue.length && waitQueue[front][0] <= time) {
      const [, remainingCount] = waitQueue[front];
      front += 1;
      maxHeap.push(remainingCount);
    }

    if (maxHeap.size() > 0) {
      let count = maxHeap.pop();
      count -= 1;

      if (count > 0) {
        const availableTime = time + cooldown + 1;
        waitQueue.push([availableTime, count]);
      }
    }
  }

  return time;
}

// 예시 실행
console.log(minScheduleTime(["A", "A", "A", "B", "B", "C"], 2)); // 7
console.log(minScheduleTime(["A", "A", "A", "B", "B", "B"], 2)); // 8
console.log(minScheduleTime(["A", "A", "B", "C", "D"], 1));      // 5
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n log k)` — 각 작업이 heap에 들어가고 나올 때마다 `log k`가 걸린다.
- **공간 복잡도**: `O(k)` — 작업 빈도표, heap, queue에 작업 종류 수만큼 저장된다.

## 틀리기 쉬운 포인트

같은 작업을 다시 실행할 수 있는 시각은 `time + cooldown`이 아니라 `time + cooldown + 1`입니다.  
현재 실행한 1초 다음부터 쿨다운이 시작되기 때문입니다.

`heap`이 비어 있어도 `queue`에 아직 대기 중인 작업이 있으면 종료하면 안 됩니다.  
이 경우는 `idle` 시간이 필요한 상황입니다.

쿨다운이 끝난 작업을 현재 시각에 바로 heap으로 되돌려야 합니다.  
이 순서를 잘못 두면 실행 가능했던 작업을 한 턴 늦게 처리하게 됩니다.

## 유사 문제 패턴

우선순위 큐로 가장 큰 값을 반복 처리하는 작업 배치 문제입니다.  
예를 들어 CPU 작업 분산, 프린터 작업 우선순위 처리 같은 유형에 그대로 연결됩니다.

대기 시간이 있는 시뮬레이션 문제입니다.  
네트워크 재시도, API rate limit, 장비 재사용 제한 같은 문제에서도 같은 구조가 나옵니다.

빈도 수 기반 greedy 문제입니다.  
문자 재배치, 같은 값 인접 금지, 가장 많이 남은 자원을 먼저 소모하는 문제와 접근이 비슷합니다.