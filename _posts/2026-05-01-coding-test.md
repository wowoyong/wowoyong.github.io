---
title: "[코딩 테스트] 2026-05-01 — 그래프 BFS"
date: 2026-05-01 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, queue, bfs, dfs]
---
## 오늘의 문제 선정 이유
> AI 도구와 개발자 생산성 이야기가 많은 오늘, 문자열 상태를 단계적으로 바꾸는 탐색 문제는 그래프 사고력과 BFS 기본기를 함께 점검하기 좋습니다.

## 문제 설명

사내 배포 시스템에서 기능 플래그를 나타내는 코드가 모두 같은 길이의 소문자 문자열로 관리됩니다.  
한 번의 배포에서는 문자열의 한 글자만 바꿀 수 있습니다.  
단, 바꾼 결과는 반드시 승인된 코드 목록에 있어야 합니다.

시작 코드 `begin`, 목표 코드 `target`, 그리고 승인된 코드 목록 `words`가 주어질 때, `begin`에서 `target`으로 변환하는 최소 횟수를 구하세요.

변환 규칙은 다음과 같습니다.

- 한 번에 한 글자만 바꿀 수 있습니다.
- 바꾼 결과 문자열은 반드시 `words` 안에 있어야 합니다.
- `begin`은 `words`에 없어도 됩니다.
- `target`에 도달할 수 없으면 `-1`을 반환합니다.

## 입출력 예시

```text
입력:
begin = "code"
target = "data"
words = ["cade", "cate", "date", "data", "coda", "dode"]

출력: 4
설명:
"code" -> "cade" -> "cate" -> "date" -> "data"
최소 4번 변환해야 합니다.
```

```text
입력:
begin = "hit"
target = "cog"
words = ["hot", "dot", "dog", "lot", "log", "cog"]

출력: 4
설명:
"hit" -> "hot" -> "dot" -> "dog" -> "cog"
또는
"hit" -> "hot" -> "lot" -> "log" -> "cog"
둘 다 4번입니다.
```

```text
입력:
begin = "aaa"
target = "bbb"
words = ["aab", "abb", "aba", "baa"]

출력: -1
설명:
승인된 코드만 사용해서는 "bbb"에 도달할 수 없습니다.
```

## 제약 조건

- `1 <= len(begin) <= 10`
- `begin`과 `target`의 길이는 같습니다.
- `1 <= len(words) <= 5000`
- `words[i]`는 소문자 알파벳으로만 이루어집니다.
- `words`의 모든 문자열 길이는 `begin`과 같습니다.
- `words` 안의 문자열은 서로 다릅니다.
- 시간 제한은 일반적인 코딩 테스트 기준 1초~2초를 가정합니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 문자열 하나를 정점으로 보는 그래프 문제입니다.  
두 문자열이 한 글자만 다르면 간선이 있다고 볼 수 있고, 우리는 `begin`에서 `target`까지의 최소 간선 수를 구해야 합니다. 최소 변환 횟수 문제이므로 DFS보다 BFS가 맞습니다.

구현은 큐를 사용한 BFS로 합니다. 현재 단어에서 갈 수 있는 다음 단어를 찾고, 아직 방문하지 않았다면 큐에 넣습니다. 처음 `target`을 만나는 순간의 거리값이 최소 변환 횟수입니다.

### 단계별 풀이 과정
1. `target`이 `words`에 없으면 애초에 도달할 수 없으므로 `-1`을 반환합니다.
2. 큐에 `(begin, 0)`을 넣고 BFS를 시작합니다.
3. 큐에서 단어를 하나 꺼낸 뒤, `words` 중 아직 방문하지 않은 단어와 한 글자만 다른지 확인합니다.
4. 조건을 만족하면 방문 처리하고 `(nextWord, count + 1)` 형태로 큐에 넣습니다.
5. BFS 중 `target`을 만나면 그때의 변환 횟수를 반환합니다.
6. 큐가 끝날 때까지 `target`을 만나지 못하면 `-1`을 반환합니다.

## 코드 풀이

### Python
```python
from collections import deque


def is_one_diff(a, b):
    # 두 문자열이 정확히 한 글자만 다른지 확인
    diff = 0
    for i in range(len(a)):
        if a[i] != b[i]:
            diff += 1
            if diff > 1:
                return False
    return diff == 1


def min_transform(begin, target, words):
    if target not in words:
        return -1

    queue = deque([(begin, 0)])
    visited = set([begin])

    while queue:
        current, steps = queue.popleft()

        if current == target:
            return steps

        for word in words:
            if word in visited:
                continue

            if is_one_diff(current, word):
                visited.add(word)
                queue.append((word, steps + 1))

    return -1


# 예시 실행
if __name__ == "__main__":
    print(min_transform("code", "data", ["cade", "cate", "date", "data", "coda", "dode"]))  # 4
    print(min_transform("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))  # 4
    print(min_transform("aaa", "bbb", ["aab", "abb", "aba", "baa"]))  # -1
```

### JavaScript
```javascript
function isOneDiff(a, b) {
  // 두 문자열이 정확히 한 글자만 다른지 확인
  let diff = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diff += 1;
      if (diff > 1) {
        return false;
      }
    }
  }

  return diff === 1;
}

function minTransform(begin, target, words) {
  if (!words.includes(target)) {
    return -1;
  }

  const queue = [[begin, 0]];
  const visited = new Set([begin]);
  let head = 0;

  while (head < queue.length) {
    const [current, steps] = queue[head++];
    
    if (current === target) {
      return steps;
    }

    for (const word of words) {
      if (visited.has(word)) {
        continue;
      }

      if (isOneDiff(current, word)) {
        visited.add(word);
        queue.push([word, steps + 1]);
      }
    }
  }

  return -1;
}

// 예시 실행
console.log(minTransform("code", "data", ["cade", "cate", "date", "data", "coda", "dode"])); // 4
console.log(minTransform("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"])); // 4
console.log(minTransform("aaa", "bbb", ["aab", "abb", "aba", "baa"])); // -1
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N^2 * L) — BFS 과정에서 각 단어 쌍의 한 글자 차이 여부를 검사할 수 있기 때문입니다.
- **공간 복잡도**: O(N) — `visited`와 BFS 큐에 최대 `N`개의 단어가 들어갈 수 있기 때문입니다.

## 틀리기 쉬운 포인트

- `target`이 `words`에 없는데도 탐색을 시작하는 실수. 이 경우 바로 `-1`이어야 합니다.
- 글자 차이 개수가 `1개 이하`라고 잘못 처리하는 실수. 정확히 `1개`여야 한 번의 변환입니다.
- 최소 횟수 문제인데 DFS로 풀어서 더 긴 경로를 먼저 찾는 실수. 이 문제는 BFS가 정답입니다.

## 유사 문제 패턴

- 최단 경로 미로 탐색: 격자에서 시작점부터 도착점까지 최소 이동 횟수를 구하는 문제입니다.
- 정수 상태 변환 문제: `x`에서 `y`로 `+1`, `-1`, `*2` 같은 연산만 써서 최소 연산 횟수를 구하는 문제입니다.
- 문자열 상태 탐색 문제: 괄호 문자열, 비밀번호, 토큰 상태를 한 번에 하나씩 바꾸며 목표 상태까지 가는 문제입니다.