---
title: "[코딩 테스트] 2026-03-10 — 오늘의 코딩 테스트"
date: 2026-03-10 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, queue]
---
## 오늘의 문제 선정 이유
> 오늘은 SaaS 운영, 물류 최적화, 시스템 설계처럼 "연속된 이벤트 구간을 빠르게 찾아야 하는" 상황이 많이 보여서, 실무와 코딩 테스트에 모두 자주 나오는 슬라이딩 윈도우 유형을 골랐습니다.

## 문제 설명

한 SaaS 서비스에서 장애 분석을 위해 이벤트 로그를 수집합니다.

로그는 시간순으로 정렬된 문자열 배열 `events` 로 주어집니다.  
장애 시그니처는 반드시 포함되어야 하는 이벤트 목록 `required` 로 주어집니다.

`required` 에 같은 이벤트가 여러 번 나오면, 그 개수만큼 로그 구간 안에 포함되어야 합니다.

가장 짧은 연속 구간 중에서 `required` 의 모든 조건을 만족하는 구간의 시작 인덱스와 끝 인덱스를 구하세요.  
길이가 같은 구간이 여러 개라면 더 앞에 나오는 구간을 반환하세요.

구간이 존재하지 않으면 `[-1, -1]` 을 반환하세요.

인덱스는 `0`부터 시작합니다.

## 입출력 예시

```text
입력:
events = ["login", "search", "cart", "search", "pay", "cart", "pay"]
required = ["search", "cart", "pay"]

출력:
[2, 4]

설명:
events[2..4] = ["cart", "search", "pay"] 이고,
필요한 이벤트 3개를 모두 포함하는 가장 짧은 구간입니다.
```

```text
입력:
events = ["api", "db", "cache", "api", "queue", "db", "api"]
required = ["api", "db", "api"]

출력:
[0, 3]

설명:
"api"는 2번, "db"는 1번 필요합니다.
events[0..3] = ["api", "db", "cache", "api"] 가 가장 짧은 정답입니다.
```

```text
입력:
events = ["auth", "search", "cart"]
required = ["auth", "pay"]

출력:
[-1, -1]

설명:
"pay" 이벤트가 없어서 조건을 만족하는 구간이 없습니다.
```

## 제약 조건

- `1 <= len(events) <= 200000`
- `1 <= len(required) <= 100000`
- `events[i]`, `required[i]` 는 영문 소문자와 숫자로 이루어진 길이 1 이상 20 이하의 문자열
- 시간 제한: 2초
- 추가 메모리는 `O(len(required) + 서로 다른 events 수)` 수준까지 허용

## 풀이 접근법

### 핵심 아이디어
이 문제는 "조건을 만족하는 가장 짧은 연속 구간"을 찾는 문제입니다.  
모든 시작점마다 끝점을 다시 찾으면 `O(N^2)` 이라서 너무 느립니다. 대신 슬라이딩 윈도우와 해시맵을 쓰면, 오른쪽 포인터는 늘리고 왼쪽 포인터는 줄이면서 한 번씩만 이동하므로 `O(N)` 에 해결할 수 있습니다.

### 단계별 풀이 과정
1. `required` 를 해시맵으로 세어서 각 이벤트가 몇 번 필요한지 기록합니다.
2. 오른쪽 포인터를 한 칸씩 늘리며 현재 구간의 이벤트 개수를 해시맵에 저장합니다.
3. 어떤 이벤트의 개수가 필요한 개수에 도달하면 "충족한 종류 수"를 증가시킵니다.
4. 모든 종류를 충족했다면, 왼쪽 포인터를 가능한 만큼 줄여서 구간을 최소화합니다.
5. 줄이는 과정에서 조건이 깨지기 직전의 구간이 후보가 됩니다. 이 중 가장 짧고, 길이가 같으면 더 앞선 구간을 답으로 저장합니다.

## 코드 풀이

### Python
```python
from collections import Counter, defaultdict
from typing import List

def find_shortest_incident_window(events: List[str], required: List[str]) -> List[int]:
    need = Counter(required)
    window = defaultdict(int)

    required_types = len(need)
    matched_types = 0

    left = 0
    best_length = float("inf")
    answer = [-1, -1]

    for right, event in enumerate(events):
        if event in need:
            window[event] += 1
            if window[event] == need[event]:
                matched_types += 1

        # 모든 조건을 만족하면 왼쪽을 줄여서 최소 구간을 만든다.
        while matched_types == required_types and left <= right:
            current_length = right - left + 1
            if current_length < best_length:
                best_length = current_length
                answer = [left, right]

            left_event = events[left]
            if left_event in need:
                if window[left_event] == need[left_event]:
                    matched_types -= 1
                window[left_event] -= 1
            left += 1

    return answer


# 예시 실행
if __name__ == "__main__":
    print(find_shortest_incident_window(
        ["login", "search", "cart", "search", "pay", "cart", "pay"],
        ["search", "cart", "pay"]
    ))  # [2, 4]

    print(find_shortest_incident_window(
        ["api", "db", "cache", "api", "queue", "db", "api"],
        ["api", "db", "api"]
    ))  # [0, 3]

    print(find_shortest_incident_window(
        ["auth", "search", "cart"],
        ["auth", "pay"]
    ))  # [-1, -1]
```

### JavaScript
```javascript
function findShortestIncidentWindow(events, required) {
  const need = new Map();
  const window = new Map();

  for (const item of required) {
    need.set(item, (need.get(item) || 0) + 1);
  }

  const requiredTypes = need.size;
  let matchedTypes = 0;

  let left = 0;
  let bestLength = Infinity;
  let answer = [-1, -1];

  for (let right = 0; right < events.length; right++) {
    const event = events[right];

    if (need.has(event)) {
      window.set(event, (window.get(event) || 0) + 1);
      if (window.get(event) === need.get(event)) {
        matchedTypes += 1;
      }
    }

    // 모든 조건을 만족하면 왼쪽을 줄여서 최소 구간을 만든다.
    while (matchedTypes === requiredTypes && left <= right) {
      const currentLength = right - left + 1;
      if (currentLength < bestLength) {
        bestLength = currentLength;
        answer = [left, right];
      }

      const leftEvent = events[left];
      if (need.has(leftEvent)) {
        if (window.get(leftEvent) === need.get(leftEvent)) {
          matchedTypes -= 1;
        }
        window.set(leftEvent, window.get(leftEvent) - 1);
      }
      left += 1;
    }
  }

  return answer;
}

// 예시 실행
console.log(
  findShortestIncidentWindow(
    ["login", "search", "cart", "search", "pay", "cart", "pay"],
    ["search", "cart", "pay"]
  )
); // [2, 4]

console.log(
  findShortestIncidentWindow(
    ["api", "db", "cache", "api", "queue", "db", "api"],
    ["api", "db", "api"]
  )
); // [0, 3]

console.log(
  findShortestIncidentWindow(
    ["auth", "search", "cart"],
    ["auth", "pay"]
  )
); // [-1, -1]
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N)` — 왼쪽 포인터와 오른쪽 포인터가 각각 배열을 한 번씩만 이동합니다.
- **공간 복잡도**: `O(M)` — `required` 에 등장한 이벤트 종류 수만큼 해시맵을 사용합니다.

## 틀리기 쉬운 포인트

`required` 에 중복 값이 있을 수 있습니다.  
단순히 "포함 여부"만 체크하면 틀리고, 반드시 "필요 개수"까지 비교해야 합니다.

조건을 만족했다고 바로 답으로 확정하면 안 됩니다.  
그 상태에서 왼쪽 포인터를 더 줄일 수 있는지 확인해야 진짜 최소 구간이 됩니다.

길이가 같은 정답이 여러 개면 더 앞선 구간을 반환해야 합니다.  
그래서 `current_length < best_length` 일 때만 갱신하면 자연스럽게 앞선 구간이 유지됩니다.

## 유사 문제 패턴

문자열에서 특정 문자 집합을 모두 포함하는 가장 짧은 부분 문자열 찾기  
문자열 버전으로 바뀌어도 핵심은 같습니다. 해시맵과 슬라이딩 윈도우를 그대로 씁니다.

배열에서 합이 일정 조건 이상이 되는 가장 짧은 부분 배열 찾기  
조건이 "종류/개수" 대신 "합"으로 바뀐 형태입니다. 역시 윈도우를 줄이는 판단이 핵심입니다.

실시간 로그에서 특정 이벤트 조합이 처음 완성되는 구간 찾기  
모니터링, 보안 탐지, 추천 로그 분석처럼 연속 구간 조건을 빠르게 판별해야 할 때 자주 나옵니다.