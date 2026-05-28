---
title: "[코딩 테스트] 2026-05-28 — 레벨 순서 순회"
date: 2026-05-28 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, tree, queue, bfs]
---
## 오늘의 문제 선정 이유
> 개발자 학습과 인터뷰 준비가 오늘 트렌드에 많이 보였고, 이진 트리 BFS는 초중급 백엔드 코딩 테스트에서 자주 나오는 기본기 문제입니다.

## 문제 설명

회사 내부 조직도를 이진 트리로 관리한다고 가정합니다.

각 노드는 한 명의 개발자를 의미합니다.  
노드의 값은 개발자의 사번입니다.

조직도를 위에서 아래로, 같은 깊이에서는 왼쪽에서 오른쪽 순서로 조회해야 합니다.

이진 트리의 root가 주어졌을 때, 각 레벨에 있는 노드 값을 2차원 배열로 반환하세요.

루트 노드가 1레벨입니다.

## 입출력 예시

```
입력: root = [10, 6, 15, 3, 8, null, 20]
출력: [[10], [6, 15], [3, 8, 20]]
설명: 
1레벨에는 10이 있습니다.
2레벨에는 6, 15가 있습니다.
3레벨에는 3, 8, 20이 왼쪽에서 오른쪽 순서로 있습니다.
```

```
입력: root = [1]
출력: [[1]]
설명: 노드가 하나뿐이므로 한 레벨만 반환합니다.
```

```
입력: root = []
출력: []
설명: 빈 트리이므로 빈 배열을 반환합니다.
```

## 제약 조건

- 노드 개수는 0개 이상 10,000개 이하입니다.
- 각 노드의 값은 -100,000 이상 100,000 이하입니다.
- 입력 트리는 이진 트리입니다.
- 시간 제한은 O(n) 풀이를 기대합니다.
- n은 트리의 전체 노드 수입니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 트리를 깊이 순서대로 방문해야 하므로 BFS가 적합합니다.  
BFS는 queue를 사용하면 현재 레벨의 노드를 먼저 모두 처리한 뒤, 다음 레벨 노드를 처리할 수 있습니다.  
각 반복에서 현재 queue의 길이를 저장하면 한 레벨에 속한 노드만 정확히 묶을 수 있습니다.

### 단계별 풀이 과정

1. root가 없으면 빈 배열을 반환합니다.
2. queue에 root를 넣고 BFS를 시작합니다.
3. 매 반복마다 현재 queue의 길이를 level_size로 저장합니다.
4. level_size만큼 노드를 꺼내 현재 레벨 배열에 값을 추가합니다.
5. 꺼낸 노드의 left, right 자식이 있으면 queue에 넣습니다.
6. 현재 레벨 배열을 정답 배열에 추가합니다.
7. queue가 빌 때까지 반복합니다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import Optional, List


class TreeNode:
    def __init__(self, val: int = 0, left: Optional["TreeNode"] = None, right: Optional["TreeNode"] = None):
        self.val = val
        self.left = left
        self.right = right


def level_order(root: Optional[TreeNode]) -> List[List[int]]:
    if root is None:
        return []

    result = []
    queue = deque([root])

    while queue:
        level_size = len(queue)
        level_values = []

        for _ in range(level_size):
            node = queue.popleft()
            level_values.append(node.val)

            if node.left is not None:
                queue.append(node.left)

            if node.right is not None:
                queue.append(node.right)

        result.append(level_values)

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
  if (root === null) {
    return [];
  }

  const result = [];
  const queue = [root];
  let head = 0;

  while (head < queue.length) {
    const levelSize = queue.length - head;
    const levelValues = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue[head++];
      levelValues.push(node.val);

      if (node.left !== null) {
        queue.push(node.left);
      }

      if (node.right !== null) {
        queue.push(node.right);
      }
    }

    result.push(levelValues);
  }

  return result;
}
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 모든 노드를 정확히 한 번씩 방문합니다.
- **공간 복잡도**: O(n) — queue와 결과 배열에 노드 값이 저장됩니다.

## 틀리기 쉬운 포인트

- 현재 레벨 크기를 미리 저장하지 않으면 다음 레벨 노드까지 같은 배열에 섞일 수 있습니다.
- JavaScript에서 `shift()`를 쓰면 배열 앞쪽 삭제 비용 때문에 성능이 나빠질 수 있습니다.
- root가 `null`인 빈 트리 입력을 처리하지 않으면 런타임 에러가 발생합니다.

## 유사 문제 패턴

- 이진 트리의 오른쪽에서 보이는 노드만 반환하는 문제
- 각 레벨의 평균값을 구하는 문제
- 최단 거리나 최소 이동 횟수를 구하는 그래프 BFS 문제