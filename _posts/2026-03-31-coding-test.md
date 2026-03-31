---
title: "[코딩 테스트] 2026-03-31 — Union-Find (유니온 파인드)"
date: 2026-03-31 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, bfs, dfs]
---
## 오늘의 문제 선정 이유
> AI 도구, 대규모 서비스, 네트워크 구조처럼 "연결 관계"를 빠르게 판단하는 문제가 많아져서 오늘은 Union-Find를 선택했습니다.

## 문제 설명

한 개발팀이 여러 오픈소스 저장소를 관리하고 있습니다.  
각 저장소는 `1`번부터 `N`번까지 번호가 붙어 있습니다.

저장소 사이에는 "직접 연동" 정보가 주어집니다.  
직접 연동된 두 저장소는 같은 작업 그룹에 속합니다.  
또한 연동 관계는 전이됩니다.

예를 들어 `1`번과 `2`번이 연동되고, `2`번과 `3`번이 연동되면  
`1`, `2`, `3`은 모두 같은 작업 그룹입니다.

당신의 목표는 다음 두 가지입니다.

1. 전체 작업 그룹의 개수를 구한다.
2. 각 질의에 대해 두 저장소가 같은 작업 그룹인지 판단한다.

입력으로 저장소 개수 `N`, 직접 연동 정보 `M`개, 질의 `Q`개가 주어질 때  
전체 작업 그룹 수와 각 질의의 결과를 출력하세요.

## 입출력 예시

```text
입력:
N = 7
links = [[1, 2], [2, 3], [4, 5], [6, 7]]
queries = [[1, 3], [1, 4], [6, 7]]

출력:
components = 3
answers = [True, False, True]

설명:
1,2,3은 한 그룹
4,5는 한 그룹
6,7은 한 그룹
총 3개의 작업 그룹이 있다.
```

```text
입력:
N = 5
links = [[1, 2], [3, 4], [2, 3]]
queries = [[1, 4], [4, 5], [2, 5]]

출력:
components = 2
answers = [True, False, False]

설명:
1,2,3,4는 하나의 그룹이 되고
5는 혼자 남는다.
총 2개의 작업 그룹이 있다.
```

```text
입력:
N = 4
links = []
queries = [[1, 2], [3, 4], [2, 2]]

출력:
components = 4
answers = [False, False, True]

설명:
연동 정보가 없으므로 모든 저장소가 각각 하나의 그룹이다.
같은 번호끼리의 질의는 항상 True이다.
```

## 제약 조건

- `1 <= N <= 100000`
- `0 <= M <= 200000`
- `0 <= Q <= 200000`
- `links[i] = [a, b]`
- `queries[i] = [u, v]`
- `1 <= a, b, u, v <= N`
- 시간 제한: 2초
- 같은 연동 정보가 여러 번 들어올 수 있다.
- 자기 자신과의 연동 `[x, x]`가 들어올 수 있다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 "두 노드가 같은 그룹인지 빠르게 합치고, 빠르게 확인하는 것"이 핵심입니다.  
그래프를 매 질의마다 BFS나 DFS로 탐색하면 너무 느립니다. 그래서 그룹 병합과 대표자 조회에 강한 Union-Find를 사용합니다.

### 단계별 풀이 과정
1. 처음에는 모든 저장소가 자기 자신만의 그룹이라고 본다.
2. `links`를 순회하면서 두 저장소를 `union` 한다.
3. `union`이 실제로 서로 다른 두 그룹을 합친 경우에만 컴포넌트 수를 1 감소시킨다.
4. 모든 연동 처리가 끝나면 현재 컴포넌트 수가 전체 작업 그룹 수이다.
5. 각 질의 `u, v`에 대해 `find(u) == find(v)`인지 확인해서 같은 그룹 여부를 출력한다.

## 코드 풀이

### Python
```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n + 1))
        self.rank = [0] * (n + 1)
        self.components = n

    def find(self, x):
        # path compression
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)

        if root_a == root_b:
            return False

        # union by rank
        if self.rank[root_a] < self.rank[root_b]:
            self.parent[root_a] = root_b
        elif self.rank[root_a] > self.rank[root_b]:
            self.parent[root_b] = root_a
        else:
            self.parent[root_b] = root_a
            self.rank[root_a] += 1

        self.components -= 1
        return True


def solve(n, links, queries):
    uf = UnionFind(n)

    for a, b in links:
        uf.union(a, b)

    answers = []
    for u, v in queries:
        answers.append(uf.find(u) == uf.find(v))

    return uf.components, answers


# 예시 실행
if __name__ == "__main__":
    N = 7
    links = [[1, 2], [2, 3], [4, 5], [6, 7]]
    queries = [[1, 3], [1, 4], [6, 7]]

    components, answers = solve(N, links, queries)
    print("components =", components)
    print("answers =", answers)
```

### JavaScript
```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n + 1 }, (_, i) => i);
    this.rank = Array(n + 1).fill(0);
    this.components = n;
  }

  find(x) {
    // path compression
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) {
      return false;
    }

    // union by rank
    if (this.rank[rootA] < this.rank[rootB]) {
      this.parent[rootA] = rootB;
    } else if (this.rank[rootA] > this.rank[rootB]) {
      this.parent[rootB] = rootA;
    } else {
      this.parent[rootB] = rootA;
      this.rank[rootA] += 1;
    }

    this.components -= 1;
    return true;
  }
}

function solve(n, links, queries) {
  const uf = new UnionFind(n);

  for (const [a, b] of links) {
    uf.union(a, b);
  }

  const answers = [];
  for (const [u, v] of queries) {
    answers.push(uf.find(u) === uf.find(v));
  }

  return {
    components: uf.components,
    answers: answers,
  };
}

// 예시 실행
const N = 7;
const links = [[1, 2], [2, 3], [4, 5], [6, 7]];
const queries = [[1, 3], [1, 4], [6, 7]];

const result = solve(N, links, queries);
console.log("components =", result.components);
console.log("answers =", result.answers);
```

## 시간·공간 복잡도

- **시간 복잡도**: `O((N + M + Q) * alpha(N))` — `find`와 `union`이 거의 상수 시간처럼 동작하기 때문
- **공간 복잡도**: `O(N)` — `parent`, `rank` 배열을 사용하기 때문

## 틀리기 쉬운 포인트

- 같은 간선이 여러 번 들어와도 컴포넌트 수를 여러 번 줄이면 안 됩니다. `union`이 실제 병합에 성공했을 때만 감소해야 합니다.
- `find`에 path compression이 없으면 큰 입력에서 성능이 급격히 떨어질 수 있습니다.
- 노드 번호가 `1`부터 시작하는데 배열을 `0`부터만 만들면 인덱스 오류가 날 수 있습니다.

## 유사 문제 패턴

- 네트워크 연결 문제: 컴퓨터나 서버가 몇 개의 네트워크로 나뉘는지 구하는 유형
- 섬 연결 문제: 여러 섬이나 도시가 연결될 때 같은 그룹인지 판단하는 유형
- 계정 병합 문제: 이메일이나 사용자 정보가 겹치면 같은 사람으로 묶는 유형