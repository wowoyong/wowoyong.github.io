---
title: "[코딩 테스트] 2026-03-17 — 최소 공통 조상 (LCA)"
date: 2026-03-17 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, string, graph, stack, dfs]
---
## 오늘의 문제 선정 이유
> 서비스 의존성, 조직 구조, 파일 시스템처럼 계층형 데이터가 다시 주목받으면서 LCA는 실무형 코딩 테스트에 자주 연결되는 기본 유형입니다.

## 문제 설명

한 회사의 마이크로서비스 구조가 트리 형태로 관리되고 있습니다.  
루트 서비스는 `1`번이며, 다른 모든 서비스는 정확히 하나의 상위 서비스에만 연결됩니다.

장애 분석 도구는 두 서비스 `a`, `b`가 주어졌을 때,  
두 서비스가 모두 영향을 받기 시작하는 가장 가까운 공통 상위 서비스를 찾아야 합니다.

트리와 여러 개의 질의가 주어질 때, 각 질의마다 두 서비스의 최소 공통 조상(Lowest Common Ancestor, LCA)을 구하세요.

입력 형식은 다음과 같습니다.

- 첫 줄에 서비스 개수 `N`, 질의 개수 `Q`
- 다음 `N-1`개의 줄에 간선 정보 `u v`
- 다음 `Q`개의 줄에 질의 `a b`

각 질의에 대해 `a`와 `b`의 최소 공통 조상을 한 줄씩 출력하세요.

## 입출력 예시

```text
입력:
7 3
1 2
1 3
2 4
2 5
3 6
6 7
4 5
4 6
7 3

출력:
2
1
3

설명:
4와 5의 가장 가까운 공통 상위 서비스는 2입니다.
4와 6의 가장 가까운 공통 상위 서비스는 1입니다.
7과 3의 가장 가까운 공통 상위 서비스는 3입니다.
```

```text
입력:
9 4
1 2
1 3
2 4
2 5
4 8
5 9
3 6
3 7
8 9
6 7
8 6
2 8

출력:
2
3
1
2

설명:
8과 9의 최소 공통 조상은 2입니다.
6과 7의 최소 공통 조상은 3입니다.
8과 6의 최소 공통 조상은 1입니다.
2와 8의 최소 공통 조상은 2입니다.
```

## 제약 조건

- `2 <= N <= 100,000`
- `1 <= Q <= 100,000`
- `1 <= u, v, a, b <= N`
- 주어지는 간선은 항상 트리를 이룸
- 시간 제한: 2초
- 메모리 제한: 512MB

## 풀이 접근법

### 핵심 아이디어
질의가 매우 많기 때문에, 매번 부모를 하나씩 따라 올라가면 최악의 경우 너무 느립니다.  
그래서 각 노드의 `2^k`번째 부모를 미리 저장해 두고, 두 노드의 깊이를 빠르게 맞춘 뒤 동시에 위로 점프시키는 방식이 적합합니다.

### 단계별 풀이 과정
1. 트리를 인접 리스트로 저장합니다.
2. DFS 또는 스택 탐색으로 각 노드의 `depth`와 바로 위 부모 `parent[node][0]`를 구합니다.
3. `parent[node][k]`를 채워서 `2^k`번째 부모 정보를 전처리합니다.
4. 두 노드의 깊이가 다르면, 더 깊은 노드를 위로 끌어올려 깊이를 맞춥니다.
5. 깊이가 같아진 뒤, 가장 큰 점프부터 내려오면서 두 노드의 부모가 달라지는 구간까지 함께 올립니다.
6. 마지막에 남는 바로 위 부모가 최소 공통 조상입니다.

## 코드 풀이

### Python
```python
import sys
input = sys.stdin.readline

def solve():
    N, Q = map(int, input().split())
    graph = [[] for _ in range(N + 1)]

    for _ in range(N - 1):
        u, v = map(int, input().split())
        graph[u].append(v)
        graph[v].append(u)

    LOG = (N).bit_length()
    parent = [[0] * LOG for _ in range(N + 1)]
    depth = [0] * (N + 1)
    visited = [False] * (N + 1)

    # iterative DFS로 depth와 1칸 부모를 구한다.
    stack = [1]
    visited[1] = True

    while stack:
        node = stack.pop()
        for nxt in graph[node]:
            if visited[nxt]:
                continue
            visited[nxt] = True
            depth[nxt] = depth[node] + 1
            parent[nxt][0] = node
            stack.append(nxt)

    # binary lifting 테이블 구성
    for k in range(1, LOG):
        for node in range(1, N + 1):
            mid = parent[node][k - 1]
            if mid != 0:
                parent[node][k] = parent[mid][k - 1]

    def lca(a, b):
        # 항상 a가 더 깊거나 같게 맞춘다.
        if depth[a] < depth[b]:
            a, b = b, a

        # 깊이 차이만큼 a를 위로 올린다.
        diff = depth[a] - depth[b]
        for k in range(LOG):
            if diff & (1 << k):
                a = parent[a][k]

        # 이미 같다면 그 노드가 LCA
        if a == b:
            return a

        # 가장 큰 점프부터 보며 부모가 달라지는 동안 같이 올린다.
        for k in range(LOG - 1, -1, -1):
            if parent[a][k] != parent[b][k]:
                a = parent[a][k]
                b = parent[b][k]

        # 바로 위 부모가 최소 공통 조상
        return parent[a][0]

    result = []
    for _ in range(Q):
        a, b = map(int, input().split())
        result.append(str(lca(a, b)))

    print("\n".join(result))

solve()
```

### JavaScript
```javascript
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

let idx = 0;
const N = input[idx++];
const Q = input[idx++];

const graph = Array.from({ length: N + 1 }, () => []);

for (let i = 0; i < N - 1; i++) {
  const u = input[idx++];
  const v = input[idx++];
  graph[u].push(v);
  graph[v].push(u);
}

const LOG = Math.ceil(Math.log2(N)) + 1;
const parent = Array.from({ length: N + 1 }, () => Array(LOG).fill(0));
const depth = Array(N + 1).fill(0);
const visited = Array(N + 1).fill(false);

// iterative DFS로 depth와 1칸 부모를 구한다.
const stack = [1];
visited[1] = true;

while (stack.length > 0) {
  const node = stack.pop();

  for (const next of graph[node]) {
    if (visited[next]) continue;
    visited[next] = true;
    depth[next] = depth[node] + 1;
    parent[next][0] = node;
    stack.push(next);
  }
}

// binary lifting 테이블 구성
for (let k = 1; k < LOG; k++) {
  for (let node = 1; node <= N; node++) {
    const mid = parent[node][k - 1];
    if (mid !== 0) {
      parent[node][k] = parent[mid][k - 1];
    }
  }
}

function lca(a, b) {
  // 항상 a가 더 깊거나 같게 맞춘다.
  if (depth[a] < depth[b]) {
    [a, b] = [b, a];
  }

  // 깊이 차이만큼 a를 위로 올린다.
  let diff = depth[a] - depth[b];
  for (let k = 0; k < LOG; k++) {
    if (diff & (1 << k)) {
      a = parent[a][k];
    }
  }

  // 이미 같다면 그 노드가 LCA
  if (a === b) return a;

  // 가장 큰 점프부터 보며 부모가 달라지는 동안 같이 올린다.
  for (let k = LOG - 1; k >= 0; k--) {
    if (parent[a][k] !== parent[b][k]) {
      a = parent[a][k];
      b = parent[b][k];
    }
  }

  // 바로 위 부모가 최소 공통 조상
  return parent[a][0];
}

const answer = [];
for (let i = 0; i < Q; i++) {
  const a = input[idx++];
  const b = input[idx++];
  answer.push(String(lca(a, b)));
}

console.log(answer.join("\n"));
```

## 시간·공간 복잡도

- **시간 복잡도**: `O((N + Q) log N)` — 전처리에 `O(N log N)`, 각 질의마다 `O(log N)`이 걸립니다.
- **공간 복잡도**: `O(N log N)` — 부모 점프 테이블을 저장해야 합니다.

## 틀리기 쉬운 포인트

- 한 노드가 다른 노드의 조상인 경우를 따로 처리하지 않으면 답이 틀립니다.
- 깊이를 맞추기 전에 바로 동시에 올리면 잘못된 조상을 찾게 됩니다.
- 재귀 DFS를 쓰면 입력이 큰 경우 스택 오버플로가 날 수 있습니다. Python과 JavaScript에서는 특히 주의가 필요합니다.

## 유사 문제 패턴

- 파일 시스템 경로 트리에서 두 파일의 가장 가까운 공통 디렉터리 찾기
- 조직도에서 두 직원의 가장 가까운 공통 관리자 찾기
- 댓글 트리나 카테고리 트리에서 두 항목의 가장 가까운 공통 상위 항목 찾기