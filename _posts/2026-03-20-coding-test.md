---
title: "[코딩 테스트] 2026-03-20 — 그래프 BFS/단어 사다리"
date: 2026-03-20 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, queue, bfs]
---
## 오늘의 문제 선정 이유
> AI, 학습 플랫폼, 인터뷰 준비가 동시에 주목받는 흐름에서, 문자열 상태를 최소 단계로 바꾸는 BFS 문제는 코딩 테스트 기본기 점검에 가장 잘 맞습니다.

## 문제 설명

한 스타트업은 서비스 배포 버전을 4글자 소문자 코드로 관리합니다.  
현재 버전 `start`에서 목표 버전 `target`으로 바꾸려 합니다.

한 번에 할 수 있는 변경은 다음과 같습니다.

- 현재 단어에서 글자 하나만 바꿀 수 있다.
- 바꾼 결과는 반드시 `words` 목록에 있는 단어여야 한다.

`start`는 `words`에 없을 수 있습니다.  
`target`이 `words`에 없으면 변환할 수 없습니다.

`start`에서 `target`으로 가는 최소 변환 횟수를 구하세요.  
불가능하면 `-1`을 반환하세요.

## 입출력 예시

```text
입력:
start = "code"
target = "data"
words = ["cade", "cate", "date", "data", "coda", "cada"]

출력:
4

설명:
code -> coda -> cada -> data 는 불가능합니다. 두 글자가 바뀌는 구간이 생깁니다.
가능한 최소 경로는
code -> cade -> cate -> date -> data
이므로 정답은 4입니다.
```

```text
입력:
start = "cold"
target = "warm"
words = ["cord", "card", "ward", "warm", "wold", "wald"]

출력:
4

설명:
cold -> cord -> card -> ward -> warm
총 4번 변환하면 됩니다.
```

```text
입력:
start = "game"
target = "math"
words = ["fame", "fate", "mate", "path", "bath"]

출력:
-1

설명:
target인 "math"가 words에 없으므로 도달할 수 없습니다.
```

## 제약 조건

- `1 <= len(start) <= 10`
- `len(start) == len(target)`
- `1 <= len(words) <= 5000`
- `words`의 모든 원소 길이는 `len(start)`와 같다
- 모든 단어는 소문자 알파벳으로만 이루어진다
- `words` 내 중복은 없다고 가정한다
- 시간 제한 예시: 1초~2초

## 풀이 접근법

### 핵심 아이디어
이 문제는 "최소 변환 횟수"를 묻습니다.  
가중치가 없는 그래프에서 최소 이동 횟수는 BFS가 가장 자연스럽고 안전한 방법입니다.

각 단어를 하나의 정점으로 보고, 글자 하나만 다른 단어끼리 간선이 있다고 생각하면 됩니다.  
BFS는 가까운 단계부터 탐색하므로 처음 `target`에 도달한 순간의 거리값이 곧 정답입니다.

### 단계별 풀이 과정
1. 먼저 `target`이 `words`에 있는지 확인합니다. 없으면 바로 `-1`입니다.
2. `start`를 시작점으로 BFS 큐에 넣습니다.
3. 현재 단어와 `words`의 각 단어를 비교하면서, 글자가 정확히 1개만 다른 후보만 다음 단계로 넣습니다.
4. 이미 방문한 단어는 다시 큐에 넣지 않습니다.
5. `target`을 처음 만났을 때의 변환 횟수를 반환합니다.
6. 큐가 빌 때까지 못 찾으면 `-1`입니다.

## 코드 풀이

### Python
```python
from collections import deque

def can_change(a, b):
    diff = 0
    for x, y in zip(a, b):
        if x != y:
            diff += 1
            if diff > 1:
                return False
    return diff == 1

def solution(start, target, words):
    if target not in words:
        return -1

    queue = deque([(start, 0)])
    visited = set()

    while queue:
        current, steps = queue.popleft()

        if current == target:
            return steps

        for word in words:
            if word not in visited and can_change(current, word):
                visited.add(word)
                queue.append((word, steps + 1))

    return -1


# 예시 실행
if __name__ == "__main__":
    print(solution("code", "data", ["cade", "cate", "date", "data", "coda", "cada"]))  # 4
    print(solution("cold", "warm", ["cord", "card", "ward", "warm", "wold", "wald"]))  # 4
    print(solution("game", "math", ["fame", "fate", "mate", "path", "bath"]))  # -1
```

### JavaScript
```javascript
function canChange(a, b) {
  let diff = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diff += 1;
      if (diff > 1) return false;
    }
  }

  return diff === 1;
}

function solution(start, target, words) {
  if (!words.includes(target)) {
    return -1;
  }

  const queue = [[start, 0]];
  let head = 0;
  const visited = new Set();

  while (head < queue.length) {
    const [current, steps] = queue[head++];
    
    if (current === target) {
      return steps;
    }

    for (const word of words) {
      if (!visited.has(word) && canChange(current, word)) {
        visited.add(word);
        queue.push([word, steps + 1]);
      }
    }
  }

  return -1;
}


// 예시 실행
console.log(solution("code", "data", ["cade", "cate", "date", "data", "coda", "cada"])); // 4
console.log(solution("cold", "warm", ["cord", "card", "ward", "warm", "wold", "wald"])); // 4
console.log(solution("game", "math", ["fame", "fate", "mate", "path", "bath"])); // -1
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N^2 * L) — BFS 중 각 단어에서 다른 단어들을 비교하고, 비교마다 길이 `L`만큼 확인하기 때문입니다.
- **공간 복잡도**: O(N) — `visited`와 BFS 큐에 단어들을 저장합니다.

## 틀리기 쉬운 포인트

- `target`이 `words`에 없는데도 탐색을 시작하는 경우가 많습니다. 이때는 바로 `-1`이어야 합니다.
- 두 단어가 "한 글자 이하"가 아니라 "정확히 한 글자 차이"인지 확인해야 합니다.
- 방문 처리를 큐에서 꺼낼 때가 아니라 넣을 때 해야 중복 삽입을 막을 수 있습니다.

## 유사 문제 패턴

- 최소 횟수 문자열 변환 문제: 한 상태에서 다음 상태로 바꾸는 규칙이 있고, 최소 단계 수를 구합니다.
- 정수 상태 변환 문제: `x -> x+1`, `x*2` 같은 연산으로 목표값까지 가는 최소 연산 횟수를 구합니다.
- 퍼즐 최단 경로 문제: 한 번의 이동 규칙이 정해져 있고, 가장 적은 이동으로 목표 상태에 도달하는 문제입니다.