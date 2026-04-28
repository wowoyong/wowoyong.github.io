---
title: "[코딩 테스트] 2026-04-28 — 그래프 DFS/백트래킹 (단어 탐색 격자)"
date: 2026-04-28 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, bfs, dfs]
---
## 오늘의 문제 선정 이유
> 개발자 교육, 인터뷰 준비, 학습 로드맵 같은 흐름과 잘 맞고, DFS와 백트래킹을 묻는 격자 탐색 문제는 실전 코딩 테스트에도 자주 나온다.

## 문제 설명

온라인 프로그래밍 인터뷰 튜터 서비스에서 학습 키워드를 격자 보드에 배치해 두었습니다.  
각 칸에는 소문자 알파벳, 와일드카드 `?`, 또는 막힌 칸 `#` 이 들어 있습니다.

주어진 target word를 보드 위에서 만들 수 있는지 판별하세요.

단어를 만들 때는 다음 규칙을 따릅니다.

- 시작 위치는 아무 칸이나 가능하다.
- 현재 칸에서 상하좌우 인접 칸으로만 이동할 수 있다.
- 같은 칸은 한 번만 사용할 수 있다.
- `#` 칸은 지나갈 수 없다.
- `?` 칸은 target word의 어떤 한 글자와도 매칭될 수 있다.

target word를 만들 수 있으면 `true`, 아니면 `false`를 반환하세요.

## 입출력 예시

```text
입력:
board = [
  ["a","i","?","d"],
  ["t","#","o","e"],
  ["u","t","r","n"]
]
word = "aiode"

출력: true
설명:
(0,0) a -> (0,1) i -> (0,2) ? -> (1,2) o -> (1,3) e
여기서 ?는 d로 사용하면 안 되나 싶을 수 있지만,
실제 경로는 a -> i -> ?(o) 가 아니라,
a -> i -> ?(o) 형태로는 다음 글자 d를 만들 수 없다.
올바른 경로를 다시 찾으면
(0,0) a -> (1,0) t 는 맞지 않으므로 실패,
다른 시작/경로를 모두 탐색한 끝에
(0,0) a -> (0,1) i -> (0,2) ?(o) -> (0,3) d -> (1,3) e
로 만들 수 있다.
```

```text
입력:
board = [
  ["c","o","d","e"],
  ["a","#","?","r"],
  ["t","e","s","t"]
]
word = "coder"

출력: true
설명:
(0,0) c -> (0,1) o -> (0,2) d -> (0,3) e -> (1,3) r
```

```text
입력:
board = [
  ["b","a","?"],
  ["#","c","d"],
  ["e","f","g"]
]
word = "badge"

출력: false
설명:
중간에 필요한 이동 경로가 상하좌우 규칙으로 이어지지 않는다.
```

## 제약 조건

- `1 <= rows, cols <= 8`
- `1 <= len(word) <= 15`
- `board[i][j]` 는 소문자 알파벳, `?`, `#` 중 하나
- 시간 제한은 일반적인 코딩 테스트 기준 1~2초
- 같은 칸은 한 번만 방문 가능

## 풀이 접근법

### 핵심 아이디어
이 문제는 한 칸에서 다음 칸으로 분기하며 탐색해야 하므로 DFS와 백트래킹이 가장 자연스럽다.  
왜 이 방법인가 하면, 현재까지 경로가 맞더라도 다음 글자에서 막힐 수 있어서 한 경로를 끝까지 시도해 보고, 실패하면 이전 상태로 되돌아가 다른 경로를 탐색해야 하기 때문이다.

### 단계별 풀이 과정
1. 보드의 모든 칸을 시작점 후보로 본다.
2. 현재 칸이 `word[idx]` 와 매칭되는지 확인한다. `?` 는 항상 매칭 가능하고 `#` 는 불가능하다.
3. 현재 글자를 맞췄다면 방문 표시를 하고, 상하좌우 4방향으로 다음 글자 `idx + 1` 를 찾는다.
4. 다음 탐색 중 하나라도 성공하면 `true` 를 반환한다.
5. 모두 실패하면 방문 표시를 되돌리고 `false` 를 반환한다.
6. 모든 시작점을 시도해도 성공하지 못하면 최종 답은 `false` 다.

## 코드 풀이

### Python
```python
def can_form_word(board, word):
    rows = len(board)
    cols = len(board[0])

    # 현재 칸이 target char와 매칭되는지 확인
    def matches(r, c, ch):
        if board[r][c] == '#':
            return False
        return board[r][c] == ch or board[r][c] == '?'

    def dfs(r, c, idx, visited):
        # 현재 칸이 현재 글자와 맞지 않으면 실패
        if not matches(r, c, word[idx]):
            return False

        # 마지막 글자까지 맞췄으면 성공
        if idx == len(word) - 1:
            return True

        visited[r][c] = True

        # 상하좌우 탐색
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for dr, dc in directions:
            nr = r + dr
            nc = c + dc

            if 0 <= nr < rows and 0 <= nc < cols and not visited[nr][nc]:
                if dfs(nr, nc, idx + 1, visited):
                    visited[r][c] = False
                    return True

        # 다른 경로를 위해 원상 복구
        visited[r][c] = False
        return False

    # 단어 길이가 사용 가능한 칸 수보다 크면 바로 불가능
    available_cells = 0
    for r in range(rows):
        for c in range(cols):
            if board[r][c] != '#':
                available_cells += 1

    if len(word) > available_cells:
        return False

    visited = [[False] * cols for _ in range(rows)]

    # 모든 칸을 시작점으로 시도
    for r in range(rows):
        for c in range(cols):
            if board[r][c] != '#':
                if dfs(r, c, 0, visited):
                    return True

    return False


# 예시 실행
board = [
    ["c", "o", "d", "e"],
    ["a", "#", "?", "r"],
    ["t", "e", "s", "t"]
]
word = "coder"
print(can_form_word(board, word))  # True
```

### JavaScript
```javascript
function canFormWord(board, word) {
  const rows = board.length;
  const cols = board[0].length;

  function matches(r, c, ch) {
    if (board[r][c] === "#") return false;
    return board[r][c] === ch || board[r][c] === "?";
  }

  function dfs(r, c, idx, visited) {
    // 현재 칸이 현재 글자와 맞지 않으면 실패
    if (!matches(r, c, word[idx])) {
      return false;
    }

    // 마지막 글자까지 맞췄으면 성공
    if (idx === word.length - 1) {
      return true;
    }

    visited[r][c] = true;

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !visited[nr][nc]
      ) {
        if (dfs(nr, nc, idx + 1, visited)) {
          visited[r][c] = false;
          return true;
        }
      }
    }

    // 백트래킹
    visited[r][c] = false;
    return false;
  }

  // 사용 가능한 칸 수보다 단어가 길면 불가능
  let availableCells = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== "#") {
        availableCells++;
      }
    }
  }

  if (word.length > availableCells) {
    return false;
  }

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

  // 모든 칸을 시작점으로 시도
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== "#") {
        if (dfs(r, c, 0, visited)) {
          return true;
        }
      }
    }
  }

  return false;
}

// 예시 실행
const board = [
  ["c", "o", "d", "e"],
  ["a", "#", "?", "r"],
  ["t", "e", "s", "t"],
];
const word = "coder";
console.log(canFormWord(board, word)); // true
```

## 시간·공간 복잡도

- **시간 복잡도**: O(R × C × 4^L) — 각 칸을 시작점으로 보고, 단어 길이 `L` 만큼 최대 4방향 분기 탐색을 할 수 있다.
- **공간 복잡도**: O(R × C + L) — 방문 배열과 재귀 호출 스택이 필요하다.

## 틀리기 쉬운 포인트

- `?` 를 만났을 때 다음 글자를 소비해야 한다. 그냥 지나가는 빈 칸처럼 처리하면 안 된다.
- 방문 처리를 했으면 재귀가 끝날 때 반드시 되돌려야 한다. 이걸 놓치면 다른 시작 경로가 모두 틀어진다.
- `#` 칸은 시작점 후보도 될 수 없다. 탐색 중에만 막는 것이 아니라 처음부터 제외해야 한다.

## 유사 문제 패턴

- 여러 단어 찾기: 같은 격자에서 단어 여러 개를 찾아야 하면 Trie + DFS 조합으로 확장된다.
- 미로 경로 탐색: 시작점에서 도착점까지 갈 수 있는지 확인하는 문제도 DFS/BFS와 방문 관리가 핵심이다.
- 조합형 백트래킹: 순열, 부분집합, N-Queen처럼 현재 선택이 이후 가능성에 영향을 주는 문제도 같은 사고방식을 쓴다.