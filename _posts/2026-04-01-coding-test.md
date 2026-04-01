---
title: "[코딩 테스트] 2026-04-01 — 그래프 BFS/DFS"
date: 2026-04-01 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, queue, bfs, dfs]
---
## 오늘의 문제 선정 이유
> 분산 서비스, 지도 데이터, 인프라 토폴로지처럼 2차원 상태를 연결 요소로 나누는 문제는 여전히 자주 나온다.

## 문제 설명

클라우드 관제 시스템에서 `N x M` 크기의 서버 배치도를 점검하고 있습니다.

배치도의 각 칸은 다음 의미를 가집니다.

- `1`: 현재 실행 중인 서버
- `0`: 비어 있는 칸

상하좌우로 인접한 실행 중인 서버들은 하나의 서버 클러스터로 봅니다.  
대각선으로 닿은 경우는 같은 클러스터가 아닙니다.

배치도가 주어졌을 때, 서로 분리된 서버 클러스터의 개수를 구하세요.

## 입출력 예시

```text
입력:
grid = [
  ["1","1","0","0","0"],
  ["1","0","0","1","1"],
  ["0","0","0","1","0"],
  ["1","1","0","0","0"]
]

출력:
3

설명:
왼쪽 위 클러스터 1개, 오른쪽 위 클러스터 1개, 왼쪽 아래 클러스터 1개로 총 3개입니다.
```

```text
입력:
grid = [
  ["1","0","1","0"],
  ["0","0","0","0"],
  ["1","1","0","1"],
  ["0","1","0","1"]
]

출력:
4

설명:
각각 떨어진 서버 묶음을 세면 총 4개의 클러스터가 있습니다.
```

```text
입력:
grid = [
  ["0","0","0"],
  ["0","0","0"],
  ["0","0","0"]
]

출력:
0

설명:
실행 중인 서버가 없으므로 클러스터도 없습니다.
```

## 제약 조건

- `1 <= N, M <= 300`
- `grid[i][j]`는 `"0"` 또는 `"1"`
- 시간 제한: 1초~2초 수준
- 상하좌우 인접만 연결로 판단
- 입력 그리드는 직사각형 형태

## 풀이 접근법

### 핵심 아이디어
이 문제는 2차원 그래프에서 연결 요소의 개수를 세는 문제입니다.  
어떤 칸이 `1`이고 아직 방문하지 않았다면, 그 칸에서 DFS 또는 BFS로 연결된 모든 `1`을 한 번에 방문 처리하면 됩니다.

즉, 새로운 `1`을 만날 때마다 클러스터 개수를 1 증가시키고, 그 클러스터 전체를 탐색으로 지우듯 처리하면 중복 없이 셀 수 있습니다.

### 단계별 풀이 과정
1. `grid`를 처음부터 끝까지 순회합니다.
2. 현재 칸이 `1`이고 아직 방문하지 않았다면 새로운 섬 하나를 찾은 것입니다.
3. 정답을 1 증가시키고, 그 칸에서 DFS 또는 BFS를 시작합니다.
4. 탐색하면서 상하좌우에 있는 연결된 모든 `1`을 방문 처리합니다.
5. 전체 순회가 끝나면 누적한 개수가 섬의 개수입니다.

## 코드 풀이

### Python
```python
from collections import deque

def count_islands(grid):
    if not grid or not grid[0]:
        return 0

    n = len(grid)
    m = len(grid[0])
    visited = [[False] * m for _ in range(n)]
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    def bfs(sr, sc):
        queue = deque()
        queue.append((sr, sc))
        visited[sr][sc] = True

        while queue:
            r, c = queue.popleft()

            for dr, dc in directions:
                nr = r + dr
                nc = c + dc

                if 0 <= nr < n and 0 <= nc < m:
                    if grid[nr][nc] == "1" and not visited[nr][nc]:
                        visited[nr][nc] = True
                        queue.append((nr, nc))

    island_count = 0

    for i in range(n):
        for j in range(m):
            if grid[i][j] == "1" and not visited[i][j]:
                island_count += 1
                bfs(i, j)

    return island_count


# 예시 실행
grid = [
    ["1", "1", "0", "0", "0"],
    ["1", "0", "0", "1", "1"],
    ["0", "0", "0", "1", "0"],
    ["1", "1", "0", "0", "0"]
]

print(count_islands(grid))  # 3
```

### JavaScript
```javascript
function countIslands(grid) {
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return 0;
  }

  const n = grid.length;
  const m = grid[0].length;
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  function bfs(sr, sc) {
    const queue = [[sr, sc]];
    let head = 0;
    visited[sr][sc] = true;

    while (head < queue.length) {
      const [r, c] = queue[head++];

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < n && nc >= 0 && nc < m) {
          if (grid[nr][nc] === "1" && !visited[nr][nc]) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  let islandCount = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (grid[i][j] === "1" && !visited[i][j]) {
        islandCount += 1;
        bfs(i, j);
      }
    }
  }

  return islandCount;
}

// 예시 실행
const grid = [
  ["1", "1", "0", "0", "0"],
  ["1", "0", "0", "1", "1"],
  ["0", "0", "0", "1", "0"],
  ["1", "1", "0", "0", "0"]
];

console.log(countIslands(grid)); // 3
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N x M) — 각 칸을 최대 한 번씩만 방문합니다.
- **공간 복잡도**: O(N x M) — `visited` 배열과 BFS 큐에 최악의 경우 모든 칸이 들어갈 수 있습니다.

## 틀리기 쉬운 포인트

- 대각선을 연결로 착각하면 안 됩니다. 상하좌우만 연결입니다.
- 방문 체크를 늦게 하면 같은 칸이 큐에 여러 번 들어갈 수 있습니다.
- 입력이 모두 `0`인 경우를 놓치기 쉽습니다. 이때 정답은 `0`입니다.

## 유사 문제 패턴

- 최대 섬의 넓이 구하기: 섬의 개수 대신 각 섬의 칸 수를 세고 최댓값을 구합니다.
- 그림 개수와 넓이 구하기: 2차원 배열에서 연결된 영역의 개수와 크기를 함께 구합니다.
- 닫힌 영역 세기: 가장자리에 닿지 않는 연결 요소만 세는 변형 문제입니다.

---