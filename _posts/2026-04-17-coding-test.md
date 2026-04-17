---
title: "[코딩 테스트] 2026-04-17 — 그래프 DFS/백트래킹 (단어 탐색 격자)"
date: 2026-04-17 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, bfs, dfs]
---
## 오늘의 문제 선정 이유
> 격자 탐색과 백트래킹은 코딩 테스트에서 꾸준히 나오고, 오늘 트렌드의 교육·인터뷰 준비 흐름과도 잘 맞는 기본 유형이기 때문입니다.

## 문제 설명

온라인 코딩 인터뷰 튜터 서비스를 준비하는 팀이 단어 퍼즐 기능을 만들고 있습니다.  
알파벳 대문자로 이루어진 `R x C` 격자가 주어집니다. 그리고 찾고 싶은 단어 `target`이 함께 주어집니다.

단어는 격자 안에서 다음 규칙으로 만들 수 있어야 합니다.

- 시작 위치는 아무 칸이나 가능
- 현재 칸에서 상하좌우 인접한 칸으로만 이동 가능
- 같은 칸은 한 번만 사용할 수 있음
- 이동하면서 방문한 문자들을 순서대로 이어 붙였을 때 `target`과 같아야 함

`target`을 만들 수 있으면 `true`, 만들 수 없으면 `false`를 반환하세요.

## 입출력 예시

```text
입력:
board = [
  ["C", "O", "D", "E"],
  ["A", "L", "G", "O"],
  ["T", "E", "S", "T"]
]
target = "CODE"

출력:
true

설명:
첫 번째 행에서 왼쪽부터 오른쪽으로 이동하면 "CODE"를 만들 수 있습니다.
```

```text
입력:
board = [
  ["N", "O", "D"],
  ["E", "J", "S"],
  ["R", "E", "A"]
]
target = "NODE"

출력:
true

설명:
(0,0) N -> (0,1) O -> (0,2) D -> (1,2) E 순서로 이동할 수 있습니다.
```

```text
입력:
board = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I"]
]
target = "ABEHFA"

출력:
false

설명:
중간까지는 만들 수 있지만 마지막 A를 만들려면 이미 사용한 칸을 다시 방문해야 합니다.
```

## 제약 조건

- `1 <= R, C <= 6`
- `1 <= R * C <= 36`
- `1 <= len(target) <= 12`
- `board[i][j]`는 알파벳 대문자
- `target`은 알파벳 대문자
- 시간 제한은 일반적인 코딩 테스트 기준에서 DFS/백트래킹으로 통과 가능한 수준

## 풀이 접근법

### 핵심 아이디어
이 문제는 한 칸에서 시작해서 가능한 경로를 모두 시도해야 하므로 DFS와 백트래킹이 가장 자연스럽습니다.  
왜 이 방법인가 하면, 특정 위치가 정답 경로에 포함되는지는 그 다음 이동 결과까지 봐야 알 수 있기 때문입니다. 그래서 현재 경로를 따라 깊게 들어가 보고, 막히면 다시 돌아오는 방식이 필요합니다.

### 단계별 풀이 과정
1. 격자의 모든 칸을 시작점 후보로 본다.
2. 현재 칸의 문자가 `target[idx]`와 다르면 바로 실패한다.
3. 문자가 같으면 해당 칸을 방문 처리하고, 상하좌우 네 방향으로 다음 글자 `target[idx + 1]`를 찾는다.
4. 네 방향 중 하나라도 끝까지 성공하면 `true`를 반환한다.
5. 현재 경로가 실패하면 방문 처리를 원복하고 다른 경로를 시도한다.
6. 모든 시작점이 실패하면 `false`를 반환한다.

## 코드 풀이

### Python
```python
def can_make_word(board, target):
    rows = len(board)
    cols = len(board[0])

    # target이 격자 전체 칸 수보다 길면 애초에 만들 수 없다.
    if len(target) > rows * cols:
        return False

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def dfs(r, c, idx):
        # 현재 칸 문자가 target의 idx번째 문자와 다르면 실패
        if board[r][c] != target[idx]:
            return False

        # 마지막 문자까지 일치하면 성공
        if idx == len(target) - 1:
            return True

        # 현재 칸 방문 처리
        original = board[r][c]
        board[r][c] = "#"

        # 상하좌우 탐색
        for dr, dc in directions:
            nr = r + dr
            nc = c + dc

            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                if dfs(nr, nc, idx + 1):
                    board[r][c] = original
                    return True

        # 다른 경로를 위해 원복
        board[r][c] = original
        return False

    # 모든 칸을 시작점으로 시도
    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True

    return False


# 예시 실행
board1 = [
    ["C", "O", "D", "E"],
    ["A", "L", "G", "O"],
    ["T", "E", "S", "T"]
]
print(can_make_word(board1, "CODE"))  # True

board2 = [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["G", "H", "I"]
]
print(can_make_word(board2, "ABEHFA"))  # False
```

### JavaScript
```javascript
function canMakeWord(board, target) {
  const rows = board.length;
  const cols = board[0].length;

  // target이 격자 전체 칸 수보다 길면 만들 수 없다.
  if (target.length > rows * cols) {
    return false;
  }

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function dfs(r, c, idx) {
    // 현재 칸 문자가 target의 idx번째 문자와 다르면 실패
    if (board[r][c] !== target[idx]) {
      return false;
    }

    // 마지막 문자까지 일치하면 성공
    if (idx === target.length - 1) {
      return true;
    }

    // 현재 칸 방문 처리
    const original = board[r][c];
    board[r][c] = "#";

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        board[nr][nc] !== "#"
      ) {
        if (dfs(nr, nc, idx + 1)) {
          board[r][c] = original;
          return true;
        }
      }
    }

    // 실패했으면 원복
    board[r][c] = original;
    return false;
  }

  // 모든 칸을 시작점으로 시도
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (dfs(r, c, 0)) {
        return true;
      }
    }
  }

  return false;
}


// 예시 실행
const board1 = [
  ["C", "O", "D", "E"],
  ["A", "L", "G", "O"],
  ["T", "E", "S", "T"],
];
console.log(canMakeWord(board1, "CODE")); // true

const board2 = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["G", "H", "I"],
];
console.log(canMakeWord(board2, "ABEHFA")); // false
```

## 시간·공간 복잡도

- **시간 복잡도**: O(R * C * 4^L) — 각 칸을 시작점으로 보고, 길이 `L`의 단어를 최대 4방향으로 탐색할 수 있기 때문
- **공간 복잡도**: O(L) — 재귀 호출 깊이가 최대 단어 길이만큼 늘어나기 때문

## 틀리기 쉬운 포인트

- 방문한 칸을 재사용하면 안 되는데, 이를 체크하지 않아서 잘못 `true`가 나오는 경우가 많습니다.
- DFS가 끝난 뒤 방문 표시를 반드시 원복해야 합니다. 원복하지 않으면 다른 시작점 탐색이 깨집니다.
- 현재 칸이 마지막 문자와 일치할 때 바로 성공 처리해야 합니다. 이 종료 조건이 빠지면 불필요한 탐색이 늘어납니다.

## 유사 문제 패턴

- 2D 격자에서 경로 존재 여부를 찾는 문제: 미로 탐색, 섬 개수 세기처럼 DFS/BFS 기본기가 그대로 쓰입니다.
- 조건을 만족하는 문자열 경로 찾기 문제: 문자판에서 특정 패턴을 만드는 유형으로 확장할 수 있습니다.
- 방문 중복이 금지된 경로 탐색 문제: 백트래킹으로 현재 선택을 기록하고 실패 시 되돌리는 방식이 동일합니다.