---
title: "[코딩 테스트] 2026-04-08 — 그래프 위상 정렬"
date: 2026-04-08 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, graph, queue]
---
## 오늘의 문제 선정 이유
> 오늘 트렌드처럼 학습 로드맵과 커리큘럼에 대한 관심이 높아서, 선수 과목 관계를 판별하는 위상 정렬 문제를 선택했습니다.

## 문제 설명

온라인 교육 플랫폼에서 `1`번부터 `N`번까지 총 `N`개의 강의를 제공합니다.

일부 강의는 선수 과목이 있습니다. 예를 들어 `[3, 1]`은 `3번 강의를 듣기 전에 1번 강의를 먼저 들어야 한다`는 뜻입니다.

당신은 모든 강의를 한 번씩 수강하려고 합니다.  
선수 과목 조건을 모두 지키면서 `N`개의 강의를 전부 수강할 수 있으면 `true`, 불가능하면 `false`를 반환하세요.

함수 형식은 다음과 같습니다.

- `can_finish_courses(n, prerequisites)` in Python
- `canFinishCourses(n, prerequisites)` in JavaScript

## 입출력 예시

```text
입력: n = 4, prerequisites = [[2,1],[3,2],[4,2]]
출력: true
설명: 1 -> 2 -> 3 순서로 들을 수 있고, 4는 2 이후에 들으면 된다. 모든 강의 수강이 가능하다.
```

```text
입력: n = 3, prerequisites = [[1,2],[2,3],[3,1]]
출력: false
설명: 1을 들으려면 2가 필요하고, 2를 들으려면 3이 필요하며, 3을 들으려면 다시 1이 필요하다. 순환이 생겨 모든 강의를 들을 수 없다.
```

```text
입력: n = 5, prerequisites = [[2,1],[3,1],[4,2],[4,3],[5,4]]
출력: true
설명: 1을 먼저 듣고, 2와 3을 들은 뒤, 4와 5를 순서대로 들으면 된다.
```

## 제약 조건

- `1 <= n <= 100,000`
- `0 <= prerequisites.length <= 200,000`
- `prerequisites[i].length == 2`
- `1 <= a, b <= n`
- `prerequisites[i] = [a, b]`는 `a`를 듣기 전에 `b`를 먼저 들어야 함을 의미
- 시간 제한 내에 통과하려면 `O(N + M)` 수준의 풀이가 필요
- 여기서 `M`은 선수 과목 관계의 개수

## 풀이 접근법

### 핵심 아이디어

이 문제는 강의와 선수 과목 관계를 그래프로 보면 풀 수 있습니다.  
모든 강의를 들을 수 있다는 말은 그래프에 순환이 없다는 뜻이고, 이를 확인하는 대표적인 방법이 위상 정렬입니다.

진입 차수(`indegree`)가 0인 강의부터 순서대로 꺼내며 처리하면, 선수 과목 조건을 만족하는 수강 순서를 만들 수 있습니다. 끝까지 처리한 강의 수가 `N`과 같으면 가능하고, 중간에 막히면 순환이 있다는 뜻입니다.

### 단계별 풀이 과정

1. 그래프를 만든다. `b -> a` 방향으로 간선을 저장한다.
2. 각 강의의 진입 차수 `indegree`를 계산한다.
3. 진입 차수가 0인 강의를 큐에 모두 넣는다.
4. 큐에서 하나씩 꺼내며 연결된 다음 강의들의 진입 차수를 1씩 줄인다.
5. 진입 차수가 0이 된 강의를 다시 큐에 넣는다.
6. 최종적으로 처리한 강의 수가 `N`이면 `true`, 아니면 `false`를 반환한다.

## 코드 풀이

### Python
```python
from collections import deque

def can_finish_courses(n, prerequisites):
    # 그래프와 진입 차수 배열 초기화
    graph = [[] for _ in range(n + 1)]
    indegree = [0] * (n + 1)

    # b를 먼저 들어야 a를 들을 수 있으므로 b -> a
    for course, pre in prerequisites:
        graph[pre].append(course)
        indegree[course] += 1

    # 먼저 들을 수 있는 강의들부터 시작
    queue = deque()
    for i in range(1, n + 1):
        if indegree[i] == 0:
            queue.append(i)

    taken_count = 0

    while queue:
        current = queue.popleft()
        taken_count += 1

        # 현재 강의를 들었으므로 다음 강의들의 선수 조건 하나 제거
        for next_course in graph[current]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)

    return taken_count == n


# 예시 실행
if __name__ == "__main__":
    print(can_finish_courses(4, [[2, 1], [3, 2], [4, 2]]))  # True
    print(can_finish_courses(3, [[1, 2], [2, 3], [3, 1]]))  # False
```

### JavaScript
```javascript
function canFinishCourses(n, prerequisites) {
  // 그래프와 진입 차수 배열 초기화
  const graph = Array.from({ length: n + 1 }, () => []);
  const indegree = Array(n + 1).fill(0);

  // b를 먼저 들어야 a를 들을 수 있으므로 b -> a
  for (const [course, pre] of prerequisites) {
    graph[pre].push(course);
    indegree[course] += 1;
  }

  // 먼저 들을 수 있는 강의들부터 시작
  const queue = [];
  let head = 0;

  for (let i = 1; i <= n; i++) {
    if (indegree[i] === 0) {
      queue.push(i);
    }
  }

  let takenCount = 0;

  while (head < queue.length) {
    const current = queue[head++];
    takenCount += 1;

    // 현재 강의를 들었으므로 다음 강의들의 선수 조건 하나 제거
    for (const nextCourse of graph[current]) {
      indegree[nextCourse] -= 1;
      if (indegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return takenCount === n;
}

// 예시 실행
console.log(canFinishCourses(4, [[2, 1], [3, 2], [4, 2]])); // true
console.log(canFinishCourses(3, [[1, 2], [2, 3], [3, 1]])); // false
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N + M) — 각 강의와 각 선수 과목 관계를 한 번씩만 처리한다.
- **공간 복잡도**: O(N + M) — 그래프와 진입 차수 배열, 큐를 저장한다.

## 틀리기 쉬운 포인트

- 간선 방향을 반대로 두면 결과가 완전히 틀립니다. `pre -> course` 방향이어야 합니다.
- 큐에 처음 넣는 대상은 `indegree == 0`인 강의입니다. `outdegree`가 아닙니다.
- 큐를 다 돌았다고 바로 성공이 아닙니다. 처리한 강의 수가 `N`인지 반드시 확인해야 합니다.

## 유사 문제 패턴

- 작업 스케줄 가능 여부 판별: 선행 작업이 있을 때 전체 작업 완료 가능 여부를 묻는 문제입니다.
- 프로젝트 빌드 순서 결정: 모듈 간 의존성이 있을 때 빌드 가능한 순서를 찾는 문제입니다.
- 사전 순 커스텀 알파벳 추론: 문자 간 선후 관계를 그래프로 만들고 위상 정렬하는 문제입니다.