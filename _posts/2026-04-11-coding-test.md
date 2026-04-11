---
title: "[코딩 테스트] 2026-04-11 — 백트래킹, 재귀, N-Queens"
date: 2026-04-11 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array]
---
## 오늘의 문제 선정 이유
> AI, 로드맵, 인터뷰 준비가 함께 주목받는 날이라, 구현력과 탐색 사고를 동시에 보는 대표 고난도 유형인 N-Queens를 골랐습니다.

## 문제 설명

N×N 체스판에 N개의 퀸을 놓으려고 합니다.

퀸은 같은 행, 같은 열, 같은 대각선에 있는 다른 퀸을 공격할 수 있습니다.  
서로 공격하지 않도록 퀸 N개를 놓는 모든 배치를 구하세요.

각 배치는 길이 N의 문자열 배열로 표현합니다.

- `Q`는 퀸이 있는 칸
- `.`는 빈 칸

배치 결과는 어떤 순서로 반환해도 됩니다.

## 입출력 예시

```text
입력: n = 4
출력:
[
  [".Q..","...Q","Q...","..Q."],
  ["..Q.","Q...","...Q",".Q.."]
]
설명:
4x4 체스판에서 조건을 만족하는 배치는 총 2개입니다.
```

```text
입력: n = 1
출력:
[
  ["Q"]
]
설명:
칸이 1개뿐이므로 퀸 1개를 그대로 놓으면 됩니다.
```

```text
입력: n = 3
출력:
[]
설명:
3x3 체스판에서는 퀸 3개를 서로 공격하지 않게 놓을 수 없습니다.
```

## 제약 조건

- `1 <= n <= 10`
- 시간 제한: 일반적인 코딩 테스트 기준 1~2초
- 정답은 모든 가능한 배치를 반환해야 함
- 각 행에는 정확히 1개의 퀸만 놓아야 함

## 풀이 접근법

### 핵심 아이디어
이 문제는 가능한 배치를 하나씩 만들어 보다가, 중간에 조건을 만족할 수 없으면 바로 되돌아가는 방식이 가장 자연스럽습니다.  
모든 칸을 무작정 검사하면 경우의 수가 너무 크기 때문에, 각 행에 퀸을 하나씩 놓으면서 `열`, `좌상향 대각선`, `우상향 대각선`의 사용 여부를 빠르게 체크해야 합니다.

### 단계별 풀이 과정
1. 첫 번째 행부터 마지막 행까지 순서대로 퀸을 놓습니다.
2. 현재 행에서 모든 열을 확인합니다.
3. 이미 사용한 열이거나, 대각선이 겹치면 그 칸은 건너뜁니다.
4. 놓을 수 있는 칸이면 퀸을 배치하고 다음 행으로 재귀 호출합니다.
5. 마지막 행까지 모두 배치했다면 현재 보드를 정답에 추가합니다.
6. 다음 경우를 찾기 위해 방금 놓은 퀸을 다시 제거하고 탐색을 이어갑니다.

## 코드 풀이

### Python
```python
def solve_n_queens(n):
    results = []
    board = [["." for _ in range(n)] for _ in range(n)]

    # 사용 중인 열
    cols = set()
    # row - col 값이 같으면 같은 좌상향 대각선
    diag1 = set()
    # row + col 값이 같으면 같은 우상향 대각선
    diag2 = set()

    def backtrack(row):
        # 모든 행에 퀸을 놓았으면 현재 보드를 저장
        if row == n:
            results.append(["".join(board[r]) for r in range(n)])
            return

        for col in range(n):
            if col in cols:
                continue
            if (row - col) in diag1:
                continue
            if (row + col) in diag2:
                continue

            # 퀸 배치
            board[row][col] = "Q"
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)

            # 다음 행 탐색
            backtrack(row + 1)

            # 원상 복구
            board[row][col] = "."
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)

    backtrack(0)
    return results


# 예시 실행
if __name__ == "__main__":
    n = 4
    answer = solve_n_queens(n)
    for arrangement in answer:
        print(arrangement)
```

### JavaScript
```javascript
function solveNQueens(n) {
  const results = [];
  const board = Array.from({ length: n }, () => Array(n).fill("."));

  // 사용 중인 열
  const cols = new Set();
  // row - col 값이 같으면 같은 좌상향 대각선
  const diag1 = new Set();
  // row + col 값이 같으면 같은 우상향 대각선
  const diag2 = new Set();

  function backtrack(row) {
    // 모든 행에 퀸을 놓았으면 현재 보드를 저장
    if (row === n) {
      results.push(board.map((line) => line.join("")));
      return;
    }

    for (let col = 0; col < n; col++) {
      if (cols.has(col)) continue;
      if (diag1.has(row - col)) continue;
      if (diag2.has(row + col)) continue;

      // 퀸 배치
      board[row][col] = "Q";
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);

      // 다음 행 탐색
      backtrack(row + 1);

      // 원상 복구
      board[row][col] = ".";
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }

  backtrack(0);
  return results;
}

// 예시 실행
const n = 4;
const answer = solveNQueens(n);
for (const arrangement of answer) {
  console.log(arrangement);
}
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N!) — 각 행마다 가능한 열을 고르며 가지치기하지만, 최악에는 순열 수준으로 탐색합니다.
- **공간 복잡도**: O(N) — 재귀 호출 스택과 `cols`, `diag1`, `diag2`에 최대 N개 수준의 상태를 저장합니다. 정답 저장 공간은 제외합니다.

## 틀리기 쉬운 포인트

- 대각선 체크를 배열 인덱스로만 생각하다가 음수 처리를 놓치기 쉽습니다. `row - col`은 음수가 될 수 있으니 `set`으로 관리하면 편합니다.
- 한 행에 퀸 하나를 놓았으면, 재귀가 끝난 뒤 반드시 다시 `.`으로 복구해야 합니다.
- `row == n`이 되었을 때 보드를 그대로 참조로 넣으면 이후 탐색에서 값이 바뀔 수 있습니다. 문자열 배열로 복사해서 저장해야 합니다.

## 유사 문제 패턴

- 부분집합 생성: 원소를 넣거나 넣지 않으면서 가능한 모든 조합을 탐색합니다.
- 순열 생성: 방문 체크를 하며 순서를 만들어 가는 전형적인 백트래킹 문제입니다.
- 스도쿠 채우기: 후보를 하나씩 넣고, 조건이 깨지면 되돌아가는 방식이 같습니다.