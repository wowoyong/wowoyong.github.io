---
title: "[코딩 테스트] 2026-03-24 — 레벨 순서 순회"
date: 2026-03-24 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, tree, queue, bfs, dfs]
---
## 오늘의 문제 선정 이유
> React, AI 도구, 대규모 서비스 구조처럼 계층형 데이터를 다루는 일이 많아서, 트리의 레벨 단위 탐색은 오늘도 실무와 코딩 테스트 모두에서 자주 연결됩니다.

## 문제 설명

사내 플랫폼에서는 기능 플래그를 트리 구조로 관리합니다. 각 노드는 하나의 기능 ID를 가지며, 왼쪽 자식과 오른쪽 자식은 하위 기능을 의미합니다.

루트 노드가 주어졌을 때, 트리를 위에서 아래로 레벨 순서대로 순회한 결과를 2차원 배열로 반환하세요.

각 레벨에서 방문한 노드 값들은 왼쪽에서 오른쪽 순서로 담아야 합니다.

함수 시그니처는 다음과 같습니다.

- `level_order(root)` in Python
- `levelOrder(root)` in JavaScript

반환 형식:

- `[[level0 값들], [level1 값들], [level2 값들], ...]`

빈 트리라면 빈 배열을 반환합니다.

## 입출력 예시

```text
입력: root = [7, 3, 11, 1, 5, null, 14]
출력: [[7], [3, 11], [1, 5, 14]]
설명:
레벨 0에는 7
레벨 1에는 3, 11
레벨 2에는 1, 5, 14가 있습니다.
```

```text
입력: root = [10]
출력: [[10]]
설명:
루트 노드만 있으므로 한 개의 레벨만 존재합니다.
```

```text
입력: root = []
출력: []
설명:
노드가 없으므로 결과도 빈 배열입니다.
```

## 제약 조건

- 노드 개수는 `0` 이상 `100,000` 이하
- 각 노드의 값은 `-1,000,000` 이상 `1,000,000` 이하
- 시간 제한은 일반적인 코딩 테스트 기준에서 `O(N)` 풀이를 기대
- 입력 트리는 이진 트리
- 각 노드는 `val`, `left`, `right`를 가짐

## 풀이 접근법

### 핵심 아이디어
이 문제는 레벨별로 묶어서 반환해야 하므로 DFS보다 BFS가 더 자연스럽습니다.  
왜 이 방법인가 하면, BFS는 큐를 사용해 같은 깊이의 노드들을 순서대로 처리하기 때문에 각 레벨을 한 번에 모으기 쉽기 때문입니다.

어떻게 구현하는가는 간단합니다. 큐에 현재 레벨의 노드들을 넣고, 매 반복마다 큐 길이만큼만 꺼내면 그 범위가 정확히 한 레벨이 됩니다.

### 단계별 풀이 과정
1. `root`가 없으면 빈 배열을 반환합니다.
2. 큐에 `root`를 넣고 BFS를 시작합니다.
3. 현재 큐의 길이를 `level_size`로 저장합니다. 이 값이 현재 레벨의 노드 수입니다.
4. `level_size`만큼 노드를 꺼내면서 값은 `current_level`에 담고, 자식 노드는 큐 뒤에 넣습니다.
5. 한 레벨 처리가 끝나면 `current_level`을 결과 배열에 추가합니다.
6. 큐가 빌 때까지 반복합니다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import List, Optional


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root: Optional[TreeNode]) -> List[List[int]]:
    # 빈 트리 처리
    if root is None:
        return []

    result = []
    queue = deque([root])

    while queue:
        # 현재 큐 길이만큼만 처리하면 한 레벨을 정확히 순회할 수 있다.
        level_size = len(queue)
        current_level = []

        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)

            if node.left is not None:
                queue.append(node.left)

            if node.right is not None:
                queue.append(node.right)

        result.append(current_level)

    return result
```

### JavaScript
```javascript
class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function levelOrder(root) {
  // 빈 트리 처리
  if (root === null) {
    return [];
  }

  const result = [];
  const queue = [root];
  let front = 0;

  while (front < queue.length) {
    // 현재 레벨의 노드 수를 먼저 고정한다.
    const levelSize = queue.length - front;
    const currentLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue[front++];
      currentLevel.push(node.val);

      if (node.left !== null) {
        queue.push(node.left);
      }

      if (node.right !== null) {
        queue.push(node.right);
      }
    }

    result.push(currentLevel);
  }

  return result;
}
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N)` — 모든 노드를 정확히 한 번씩만 방문합니다.
- **공간 복잡도**: `O(N)` — 결과 배열과 큐에 최악의 경우 많은 노드가 저장될 수 있습니다.

## 틀리기 쉬운 포인트

`for`문 안에서 `len(queue)`를 바로 쓰면 안 됩니다. 자식 노드를 넣는 순간 길이가 바뀌어서 같은 레벨과 다음 레벨이 섞일 수 있습니다.

빈 트리일 때 `[]`를 바로 반환해야 합니다. 이 처리가 없으면 `null` 접근 에러가 날 수 있습니다.

JavaScript에서 `shift()`를 계속 쓰면 성능이 나빠질 수 있습니다. 코딩 테스트에서는 `front` 인덱스를 따로 두는 방식이 더 안전합니다.

## 유사 문제 패턴

이진 트리의 오른쪽 뷰 문제도 레벨 순회가 자주 쓰입니다. 각 레벨의 마지막 노드만 고르면 됩니다.

레벨별 평균값 구하기 문제도 같은 방식입니다. 각 레벨 값을 배열에 담는 대신 합계를 구해 평균을 계산하면 됩니다.

최단 단계 전파 문제도 같은 패턴입니다. 그래프나 트리에서 BFS로 한 단계씩 넓혀 가며 레벨 단위로 처리합니다.