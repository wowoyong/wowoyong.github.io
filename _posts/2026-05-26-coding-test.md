---
title: "[코딩 테스트] 2026-05-26 — 그리디 정렬 기반 회의실 배정"
date: 2026-05-26 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, sort]
---
## 오늘의 문제 선정 이유
> 물류 최적화와 일정 관리에 대한 관심이 높아진 만큼, 정렬과 그리디로 푸는 구간 선택 문제는 오늘도 가장 실전적인 유형입니다.

## 문제 설명

한 스타트업 팀은 하루 동안 여러 고객사와 온라인 미팅을 잡으려고 합니다.  
각 미팅은 `start`, `end`, `priority` 값으로 주어집니다.

- `start`: 회의 시작 시각
- `end`: 회의 종료 시각
- `priority`: 중요도 점수

한 번에 하나의 회의만 진행할 수 있습니다.  
서로 시간이 겹치는 회의는 동시에 선택할 수 없습니다.

이때, 아래 조건을 만족하도록 회의를 선택하세요.

1. 선택한 회의 개수를 최대화해야 합니다.
2. 선택한 회의 개수가 같다면, 중요도 점수 합이 더 큰 경우를 선택합니다.
3. 위 두 조건까지 같다면, 종료 시각이 더 이른 회의를 우선 선택하는 방식으로 결과를 만듭니다.

최종적으로 선택할 수 있는 회의 개수와, 선택된 회의의 `id`를 순서대로 출력하세요.

회의의 `id`는 입력 순서대로 1번부터 시작합니다.

## 입출력 예시

```text
입력:
meetings = [
  [1, 4, 5],
  [2, 3, 8],
  [3, 5, 4],
  [5, 7, 3],
  [6, 8, 6]
]

출력:
count = 3
selected = [2, 3, 4]

설명:
2번 회의(2~3), 3번 회의(3~5), 4번 회의(5~7)를 선택하면
총 3개를 배정할 수 있습니다.
3개를 배정하는 다른 방법도 있지만, 중요도 합이 더 큰 조합을 선택합니다.
```

```text
입력:
meetings = [
  [1, 2, 1],
  [2, 4, 10],
  [1, 4, 20],
  [4, 6, 2],
  [5, 7, 5]
]

출력:
count = 3
selected = [1, 2, 4]

설명:
1번(1~2), 2번(2~4), 4번(4~6)을 선택하면 3개입니다.
3번(1~4)을 고르면 뒤 회의를 더 적게 선택하게 되므로 최적이 아닙니다.
```

## 제약 조건

- `1 <= meetings.length <= 200,000`
- `0 <= start < end <= 1,000,000,000`
- `1 <= priority <= 10,000`
- 시간 제한: 2초 내외
- `end`와 다음 회의의 `start`가 같으면 겹치지 않는 것으로 봅니다.

## 풀이 접근법

### 핵심 아이디어
이 문제의 1순위 목표는 회의 개수 최대화입니다. 이런 유형은 종료 시간이 빠른 회의를 먼저 선택하는 그리디가 가장 강력합니다.  
종료 시간이 빠를수록 뒤에 더 많은 회의를 붙일 수 있기 때문입니다. 개수가 같을 때 중요도 합을 키우려면, 종료 시간이 같은 후보들 사이에서 중요도가 큰 회의를 먼저 고려하면 됩니다.

### 단계별 풀이 과정
1. 각 회의에 `id`를 붙입니다.
2. 회의를 `end 오름차순`, `start 오름차순`, `priority 내림차순`으로 정렬합니다.
3. 이전에 선택한 회의의 종료 시각을 `last_end`로 관리합니다.
4. 현재 회의의 `start >= last_end`이면 선택합니다.
5. 선택한 회의 개수와 `id` 목록을 반환합니다.

## 코드 풀이

### Python
```python
from typing import List, Tuple

def schedule_meetings(meetings: List[List[int]]) -> Tuple[int, List[int]]:
    # (start, end, priority, id) 형태로 변환
    arr = []
    for i, (start, end, priority) in enumerate(meetings, start=1):
        arr.append((start, end, priority, i))

    # 종료 시간이 빠른 순서가 핵심이다.
    # 종료 시간이 같다면 시작 시간이 빠른 회의를 먼저 본다.
    # 둘 다 같다면 priority가 큰 회의를 먼저 보게 해서
    # 같은 개수일 때 더 나은 선택이 앞에 오도록 만든다.
    arr.sort(key=lambda x: (x[1], x[0], -x[2]))

    selected_ids = []
    last_end = -1
    total_priority = 0

    for start, end, priority, meeting_id in arr:
        if start >= last_end:
            selected_ids.append(meeting_id)
            last_end = end
            total_priority += priority

    return len(selected_ids), selected_ids


if __name__ == "__main__":
    meetings1 = [
        [1, 4, 5],
        [2, 3, 8],
        [3, 5, 4],
        [5, 7, 3],
        [6, 8, 6]
    ]
    count1, selected1 = schedule_meetings(meetings1)
    print("count =", count1)
    print("selected =", selected1)

    meetings2 = [
        [1, 2, 1],
        [2, 4, 10],
        [1, 4, 20],
        [4, 6, 2],
        [5, 7, 5]
    ]
    count2, selected2 = schedule_meetings(meetings2)
    print("count =", count2)
    print("selected =", selected2)
```

### JavaScript
```javascript
function scheduleMeetings(meetings) {
  // [start, end, priority, id] 형태로 변환
  const arr = meetings.map((meeting, index) => {
    const [start, end, priority] = meeting;
    return [start, end, priority, index + 1];
  });

  // 종료 시간 기준 그리디 정렬
  // end 오름차순, start 오름차순, priority 내림차순
  arr.sort((a, b) => {
    if (a[1] !== b[1]) return a[1] - b[1];
    if (a[0] !== b[0]) return a[0] - b[0];
    return b[2] - a[2];
  });

  const selected = [];
  let lastEnd = -1;
  let totalPriority = 0;

  for (const [start, end, priority, id] of arr) {
    if (start >= lastEnd) {
      selected.push(id);
      lastEnd = end;
      totalPriority += priority;
    }
  }

  return [selected.length, selected];
}

// 실행 예시
const meetings1 = [
  [1, 4, 5],
  [2, 3, 8],
  [3, 5, 4],
  [5, 7, 3],
  [6, 8, 6]
];

const [count1, selected1] = scheduleMeetings(meetings1);
console.log("count =", count1);
console.log("selected =", selected1);

const meetings2 = [
  [1, 2, 1],
  [2, 4, 10],
  [1, 4, 20],
  [4, 6, 2],
  [5, 7, 5]
];

const [count2, selected2] = scheduleMeetings(meetings2);
console.log("count =", count2);
console.log("selected =", selected2);
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N log N) — 정렬이 가장 오래 걸립니다.
- **공간 복잡도**: O(N) — 정렬용 배열과 결과 저장 공간이 필요합니다.

## 틀리기 쉬운 포인트

- `start == last_end`인 경우는 겹치지 않는다고 봐야 합니다. `>`로 비교하면 오답이 됩니다.
- 시작 시간이 빠른 회의를 먼저 고르면 안 됩니다. 이 문제의 핵심은 종료 시간이 빠른 회의 우선입니다.
- 중요도 점수 합은 1순위가 아닙니다. 먼저 회의 개수를 최대화해야 합니다.

## 유사 문제 패턴

- 강의실 하나로 최대 몇 개의 수업을 배정할 수 있는지 구하는 문제
- 광고 송출 구간이나 작업 스케줄을 겹치지 않게 최대 선택하는 문제
- 인터벌 중 일부를 제거해서 서로 겹치지 않게 만드는 문제