---
title: "[코딩 테스트] 2026-06-06 — 위상 정렬"
date: 2026-06-06 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, graph, queue]
---
## 오늘의 문제 선정 이유
> 개발자 교육, 커리큘럼, 로드맵이 많이 언급된 오늘 트렌드와 잘 맞는 그래프 기반 문제입니다.

## 문제 설명

온라인 교육 플랫폼에 `0`번부터 `n - 1`번까지 총 `n`개의 강의가 있습니다.

일부 강의는 먼저 들어야 하는 선수 강의가 있습니다.  
예를 들어 `[2, 0]`은 `2번 강의를 듣기 전에 0번 강의를 먼저 들어야 한다`는 뜻입니다.

플랫폼은 모든 강의를 수강할 수 있는지 확인하려고 합니다.

선수 강의 조건이 서로 순환하면 모든 강의를 들을 수 없습니다.  
예를 들어 `0번 전에 1번`, `1번 전에 0번`이 필요하면 시작할 수 없습니다.

강의 개수 `n`과 선수 조건 배열 `prerequisites`가 주어질 때, 모든 강의를 수강할 수 있으면 `true`, 불가능하면 `false`를 반환하세요.

## 입출력 예시

```
입력: n = 4, prerequisites = [[1, 0], [2, 1], [3, 2]]
출력: true
설명: 0번 -> 1번 -> 2번 -> 3번 순서로 모든 강의를 들을 수 있습니다.
```

```
입력: n = 3, prerequisites = [[0, 1], [1, 2], [2, 0]]
출력: false
설명: 0번은 1번이 필요하고, 1번은 2번이 필요하고, 2번은 다시 0번이 필요합니다. 순환 구조라서 수강할 수 없습니다.
```

```
입력: n = 5, prerequisites = [[1, 0], [2, 0], [3, 1], [3, 2]]
출력: true
설명: 0번을 들은 뒤 1번과 2번을 듣고, 이후 3번을 들을 수 있습니다. 4번은 독립 강의입니다.
```

## 제약 조건

- `1 <= n <= 100,000`
- `0 <= prerequisites.length <= 200,000`
- `prerequisites[i] = [course, prerequisite]`
- `0 <= course, prerequisite < n`
- 같은 선수 조건이 중복으로 들어오지 않는다고 가정합니다.
- 시간 제한을 고려해 `O(n + prerequisites.length)` 풀이가 필요합니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 그래프에서 cycle이 있는지 확인하는 문제입니다.  
강의를 node로 보고, 선수 강의에서 다음 강의로 가는 방향 edge를 만듭니다.  
cycle이 없으면 위상 정렬로 모든 강의를 처리할 수 있고, cycle이 있으면 일부 강의는 끝까지 처리되지 않습니다.

### 단계별 풀이 과정
1. 각 강의의 진입 차수 `indegree`를 계산합니다.
2. 선수 조건 `[course, prerequisite]`마다 `prerequisite -> course` 방향으로 그래프를 만듭니다.
3. 진입 차수가 `0`인 강의를 queue에 넣습니다.
4. queue에서 강의를 하나씩 꺼내 수강 완료 처리합니다.
5. 해당 강의를 선수로 필요로 하는 다음 강의들의 진입 차수를 `1`씩 줄입니다.
6. 진입 차수가 새로 `0`이 된 강의를 queue에 넣습니다.
7. 처리한 강의 수가 `n`개이면 모든 강의를 들을 수 있습니다.
8. 처리한 강의 수가 `n`보다 작으면 cycle이 있으므로 불가능합니다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import List

def can_finish_courses(n: int, prerequisites: List[List[int]]) -> bool:
    graph = [[] for _ in range(n)]
    indegree = [0] * n

    # prerequisite -> course 방향으로 그래프 구성
    for course, prerequisite in prerequisites:
        graph[prerequisite].append(course)
        indegree[course] += 1

    queue = deque()

    # 바로 들을 수 있는 강의부터 시작
    for course in range(n):
        if indegree[course] == 0:
            queue.append(course)

    completed = 0

    while queue:
        current = queue.popleft()
        completed += 1

        for next_course in graph[current]:
            indegree[next_course] -= 1

            if indegree[next_course] == 0:
                queue.append(next_course)

    return completed == n


# 예시 실행
print(can_finish_courses(4, [[1, 0], [2, 1], [3, 2]]))  # True
print(can_finish_courses(3, [[0, 1], [1, 2], [2, 0]]))  # False
print(can_finish_courses(5, [[1, 0], [2, 0], [3, 1], [3, 2]]))  # True
```

### JavaScript
```javascript
function canFinishCourses(n, prerequisites) {
  const graph = Array.from({ length: n }, () => []);
  const indegree = Array(n).fill(0);

  // prerequisite -> course 방향으로 그래프 구성
  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course]++;
  }

  const queue = [];

  // 바로 들을 수 있는 강의부터 시작
  for (let course = 0; course < n; course++) {
    if (indegree[course] === 0) {
      queue.push(course);
    }
  }

  let head = 0;
  let completed = 0;

  while (head < queue.length) {
    const current = queue[head++];
    completed++;

    for (const nextCourse of graph[current]) {
      indegree[nextCourse]--;

      if (indegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return completed === n;
}

// 예시 실행
console.log(canFinishCourses(4, [[1, 0], [2, 1], [3, 2]])); // true
console.log(canFinishCourses(3, [[0, 1], [1, 2], [2, 0]])); // false
console.log(canFinishCourses(5, [[1, 0], [2, 0], [3, 1], [3, 2]])); // true
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n + m) — `m`은 선수 조건 개수이며, 모든 강의와 간선을 한 번씩 처리합니다.
- **공간 복잡도**: O(n + m) — 그래프, 진입 차수 배열, queue를 저장합니다.

## 틀리기 쉬운 포인트

- `[course, prerequisite]`의 방향을 반대로 만들면 결과가 틀릴 수 있습니다.
- 진입 차수가 `0`인 강의가 여러 개일 수 있습니다. 모두 queue에 넣어야 합니다.
- 독립 강의도 전체 강의 수에 포함됩니다. 선수 조건에 등장하지 않아도 처리해야 합니다.

## 유사 문제 패턴

- 작업 순서 정하기: 작업 간 의존성이 있을 때 가능한 실행 순서를 찾는 문제입니다.
- 빌드 시스템 의존성 검사: 어떤 모듈을 빌드하기 전에 필요한 모듈이 있는지 확인합니다.
- 순환 참조 탐지: 패키지, 파일 import, 조직 승인 단계에서 cycle이 있는지 검사합니다.