---
title: "[코딩 테스트] 2026-06-07 — N-Queens"
date: 2026-06-07 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 프로그래밍 교육, 인터뷰 준비, 알고리즘 학습 흐름과 잘 맞는 대표적인 백트래킹 문제이기 때문입니다.

## 문제 설명

한 온라인 코딩 인터뷰 튜터 서비스는 지원자에게 N-Queens 연습 문제를 제공합니다.

크기가 `N x N`인 체스판이 있습니다.  
체스판에는 이미 사용할 수 없는 칸이 몇 개 있습니다.

당신은 이 체스판에 `N`개의 퀸을 배치해야 합니다.

조건은 다음과 같습니다.

- 각 행에는 퀸을 정확히 1개만 놓아야 합니다.
- 각 열에는 퀸을 최대 1개만 놓을 수 있습니다.
- 두 퀸은 서로 대각선 방향으로 공격할 수 없어야 합니다.
- 사용할 수 없는 칸에는 퀸을 놓을 수 없습니다.

가능한 모든 배치의 개수를 구하세요.

## 입출력 예시

```
입력:
N = 4
blocked = []

출력:
2

설명:
일반적인 4-Queens 문제와 같으며 가능한 배치는 2가지입니다.
```

```
입력:
N = 4
blocked = [[0, 1], [2, 3]]

출력:
1

설명:
0행 1열과 2행 3열에는 퀸을 놓을 수 없습니다.
이 제약을 만족하면서 4개의 퀸을 놓는 방법은 1가지입니다.
```

```
입력:
N = 3
blocked = []

출력:
0

설명:
3 x 3 체스판에서는 서로 공격하지 않게 3개의 퀸을 배치할 수 없습니다.
```

## 제약 조건

- `1 <= N <= 12`
- `0 <= blocked.length <= N * N`
- `blocked[i] = [row, col]`
- `0 <= row, col < N`
- 같은 막힌 칸이 중복으로 주어지지 않습니다.
- 시간 제한은 백트래킹으로 통과 가능한 수준입니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 모든 칸을 무작정 탐색하면 경우의 수가 너무 커집니다.  
하지만 각 행에 퀸을 정확히 1개만 놓는다고 생각하면, 행을 기준으로 재귀 탐색할 수 있습니다.

각 행에서 가능한 열을 하나씩 고르고, 이미 사용한 열과 대각선을 기록합니다.  
충돌이 없을 때만 다음 행으로 내려가면 불필요한 탐색을 크게 줄일 수 있습니다.

### 단계별 풀이 과정

1. 막힌 칸을 빠르게 확인하기 위해 `set`으로 저장합니다.
2. `row = 0`부터 시작해서 한 행씩 퀸을 놓습니다.
3. 현재 행에서 모든 열 `col`을 확인합니다.
4. `(row, col)`이 막힌 칸이면 건너뜁니다.
5. 같은 열에 퀸이 있으면 건너뜁니다.
6. 왼쪽 아래 방향 대각선은 `row - col` 값으로 구분합니다.
7. 오른쪽 아래 방향 대각선은 `row + col` 값으로 구분합니다.
8. 세 조건을 모두 통과하면 퀸을 놓고 다음 행으로 재귀 호출합니다.
9. 재귀가 끝나면 방금 놓은 퀸 정보를 제거합니다.
10. `row == N`이 되면 퀸을 모두 놓은 것이므로 정답을 1 증가시킵니다.

## 코드 풀이

### Python
```python
from typing import List, Set, Tuple

def count_n_queens_with_blocked(N: int, blocked: List[List[int]]) -> int:
    blocked_set: Set[Tuple[int, int]] = set()

    for row, col in blocked:
        blocked_set.add((row, col))

    used_cols = set()
    used_diag1 = set()  # row - col
    used_diag2 = set()  # row + col

    def backtrack(row: int) -> int:
        if row == N:
            return 1

        count = 0

        for col in range(N):
            if (row, col) in blocked_set:
                continue

            diag1 = row - col
            diag2 = row + col

            if col in used_cols:
                continue

            if diag1 in used_diag1:
                continue

            if diag2 in used_diag2:
                continue

            # 현재 위치에 퀸을 놓는다.
            used_cols.add(col)
            used_diag1.add(diag1)
            used_diag2.add(diag2)

            count += backtrack(row + 1)

            # 다음 후보를 위해 원상복구한다.
            used_cols.remove(col)
            used_diag1.remove(diag1)
            used_diag2.remove(diag2)

        return count

    return backtrack(0)


# 예시 실행
print(count_n_queens_with_blocked(4, []))  # 2
print(count_n_queens_with_blocked(4, [[0, 1], [2, 3]]))  # 1
print(count_n_queens_with_blocked(3, []))  # 0
```

### JavaScript
```javascript
function countNQueensWithBlocked(N, blocked) {
  const blockedSet = new Set();

  for (const [row, col] of blocked) {
    blockedSet.add(`${row},${col}`);
  }

  const usedCols = new Set();
  const usedDiag1 = new Set(); // row - col
  const usedDiag2 = new Set(); // row + col

  function backtrack(row) {
    if (row === N) {
      return 1;
    }

    let count = 0;

    for (let col = 0; col < N; col++) {
      if (blockedSet.has(`${row},${col}`)) {
        continue;
      }

      const diag1 = row - col;
      const diag2 = row + col;

      if (usedCols.has(col)) {
        continue;
      }

      if (usedDiag1.has(diag1)) {
        continue;
      }

      if (usedDiag2.has(diag2)) {
        continue;
      }

      // 현재 위치에 퀸을 놓는다.
      usedCols.add(col);
      usedDiag1.add(diag1);
      usedDiag2.add(diag2);

      count += backtrack(row + 1);

      // 다음 후보를 위해 원상복구한다.
      usedCols.delete(col);
      usedDiag1.delete(diag1);
      usedDiag2.delete(diag2);
    }

    return count;
  }

  return backtrack(0);
}

// 예시 실행
console.log(countNQueensWithBlocked(4, [])); // 2
console.log(countNQueensWithBlocked(4, [[0, 1], [2, 3]])); // 1
console.log(countNQueensWithBlocked(3, [])); // 0
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N!) — 각 행마다 가능한 열을 하나씩 선택하며, 열 중복을 막기 때문에 최악의 경우 순열 탐색에 가깝습니다.
- **공간 복잡도**: O(N + B) — 재귀 깊이는 최대 N이고, 막힌 칸 개수 B를 set에 저장합니다.

## 틀리기 쉬운 포인트

- 대각선 조건을 잘못 계산하기 쉽습니다. 한 방향은 `row - col`, 다른 방향은 `row + col`입니다.
- 재귀 호출 후 `used_cols`, `used_diag1`, `used_diag2`에서 값을 제거해야 합니다.
- 막힌 칸을 배열로 매번 찾으면 느려질 수 있습니다. `set`으로 바꿔야 합니다.
- 각 행에 퀸을 정확히 1개 놓는 구조이므로 행 중복 체크는 필요 없습니다.

## 유사 문제 패턴

- **스도쿠 풀이**: 빈 칸에 가능한 숫자를 넣고, 조건을 만족할 때만 다음 단계로 갑니다.
- **순열 생성 문제**: 이미 사용한 원소를 기록하면서 재귀적으로 선택합니다.
- **조합 탐색 문제**: 가능한 후보를 고르고, 조건을 만족하지 않으면 더 깊이 들어가지 않습니다.