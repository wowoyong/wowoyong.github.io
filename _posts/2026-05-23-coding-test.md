---
title: "[코딩 테스트] 2026-05-23 — 이진 탐색 트리 검증"
date: 2026-05-23 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, tree, queue, dfs]
---
## 오늘의 문제 선정 이유
> 트리와 검증 로직은 실무에서도 자주 나오고, 오늘 트렌드의 학습 플랫폼·로드맵 관심사와도 잘 맞는 기본기 주제이기 때문입니다.

## 문제 설명

사내 학습 플랫폼에서 강의 난이도를 트리로 관리하고 있습니다. 각 강의는 고유한 `level` 값을 가집니다.

플랫폼 팀은 이 트리가 아래 규칙을 만족하면 "유효한 학습 경로 트리"라고 정의합니다.

- 어떤 노드의 왼쪽 서브트리에 있는 모든 노드의 `level` 값은 현재 노드보다 작아야 합니다.
- 어떤 노드의 오른쪽 서브트리에 있는 모든 노드의 `level` 값은 현재 노드보다 커야 합니다.
- 왼쪽과 오른쪽 서브트리도 각각 같은 규칙을 만족해야 합니다.

즉, 이 트리가 유효한 이진 탐색 트리(BST)인지 판별해야 합니다.

트리는 레벨 순서 배열로 주어집니다. 없는 노드는 `null`로 표시합니다.

유효한 BST이면 `true`, 아니면 `false`를 반환하세요.

## 입출력 예시

```text
입력: [8, 4, 12, 2, 6, 10, 14]
출력: true
설명: 모든 노드가 "왼쪽 < 부모 < 오른쪽" 규칙을 만족한다.
```

```text
입력: [8, 4, 12, 2, 9, 10, 14]
출력: false
설명: 값 9는 노드 4의 오른쪽 자식이라 4보다 큰 것은 맞지만,
전체적으로는 8의 왼쪽 서브트리에 있으므로 8보다 작아야 한다.
규칙을 위반하므로 유효한 BST가 아니다.
```

```text
입력: [5, 3, 7, 2, 4, 5, 8]
출력: false
설명: 오른쪽 서브트리에 있는 값 5는 루트 5보다 커야 한다.
같은 값은 허용하지 않으므로 유효한 BST가 아니다.
```

## 제약 조건

- 트리의 노드 개수는 `0` 이상 `100000` 이하
- 각 노드의 값은 `-10^9` 이상 `10^9` 이하
- 입력 배열의 원소는 정수 또는 `null`
- 시간 제한: `1초 ~ 2초` 수준
- 중복 값은 허용하지 않음

## 풀이 접근법

### 핵심 아이디어
이 문제는 각 노드가 부모와만 비교해서는 안 됩니다. 어떤 노드는 조상 노드의 범위까지 함께 만족해야 합니다.

그래서 DFS를 하면서 각 노드가 가질 수 있는 값의 범위 `(min_value, max_value)`를 계속 내려보내는 방식이 가장 안전합니다. 현재 값이 이 범위를 벗어나면 바로 BST가 아닙니다.

### 단계별 풀이 과정
1. 레벨 순서 배열을 실제 이진 트리 형태로 변환합니다.
2. `dfs(node, low, high)` 형태의 재귀 함수를 만듭니다.
3. 현재 노드 값이 `low < node.val < high`를 만족하는지 확인합니다.
4. 왼쪽 자식은 `(low, node.val)` 범위로 검사합니다.
5. 오른쪽 자식은 `(node.val, high)` 범위로 검사합니다.
6. 모든 노드가 조건을 만족하면 `true`를 반환합니다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import Optional, List


class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left: Optional["TreeNode"] = None
        self.right: Optional["TreeNode"] = None


def build_tree(values: List[Optional[int]]) -> Optional[TreeNode]:
    # 빈 트리는 유효한 BST로 본다.
    if not values or values[0] is None:
        return None

    root = TreeNode(values[0])
    queue = deque([root])
    index = 1

    while queue and index < len(values):
        current = queue.popleft()

        if index < len(values) and values[index] is not None:
            current.left = TreeNode(values[index])
            queue.append(current.left)
        index += 1

        if index < len(values) and values[index] is not None:
            current.right = TreeNode(values[index])
            queue.append(current.right)
        index += 1

    return root


def is_valid_bst(root: Optional[TreeNode]) -> bool:
    def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:
        if node is None:
            return True

        # 현재 노드 값은 반드시 (low, high) 범위 안에 있어야 한다.
        if not (low < node.val < high):
            return False

        # 왼쪽은 현재 값보다 작아야 하고, 오른쪽은 현재 값보다 커야 한다.
        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

    return dfs(root, float("-inf"), float("inf"))


# 예시 실행
values = [8, 4, 12, 2, 6, 10, 14]
root = build_tree(values)
print(is_valid_bst(root))  # True
```

### JavaScript
```javascript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function buildTree(values) {
  // 빈 트리는 유효한 BST로 본다.
  if (!values.length || values[0] === null) {
    return null;
  }

  const root = new TreeNode(values[0]);
  const queue = [root];
  let index = 1;
  let head = 0;

  while (head < queue.length && index < values.length) {
    const current = queue[head++];

    if (index < values.length && values[index] !== null) {
      current.left = new TreeNode(values[index]);
      queue.push(current.left);
    }
    index += 1;

    if (index < values.length && values[index] !== null) {
      current.right = new TreeNode(values[index]);
      queue.push(current.right);
    }
    index += 1;
  }

  return root;
}

function isValidBST(root) {
  function dfs(node, low, high) {
    if (node === null) {
      return true;
    }

    // 현재 노드 값은 반드시 (low, high) 범위 안에 있어야 한다.
    if (!(low < node.val && node.val < high)) {
      return false;
    }

    // 왼쪽은 현재 값보다 작아야 하고, 오른쪽은 현재 값보다 커야 한다.
    return dfs(node.left, low, node.val) && dfs(node.right, node.val, high);
  }

  return dfs(root, -Infinity, Infinity);
}

// 예시 실행
const values = [8, 4, 12, 2, 6, 10, 14];
const root = buildTree(values);
console.log(isValidBST(root)); // true
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 모든 노드를 한 번씩만 방문한다.
- **공간 복잡도**: O(h) — 재귀 호출 스택에 트리 높이만큼 공간이 필요하다. 최악의 경우 O(n)이다.

## 틀리기 쉬운 포인트

- 부모 노드와만 비교하면 오답입니다. 조상 노드가 만든 전체 범위를 함께 확인해야 합니다.
- 중복 값을 허용하지 않는다면 `<=`, `>=` 조건을 정확히 처리해야 합니다.
- 빈 트리는 보통 유효한 BST로 처리합니다. 이 조건을 놓치기 쉽습니다.

## 유사 문제 패턴

- 이진 탐색 트리에서 특정 값 탐색: BST의 정렬 성질을 이용해 한쪽만 내려가는 문제입니다.
- 이진 탐색 트리의 k번째 작은 값 찾기: 중위 순회를 활용하는 대표 문제입니다.
- 균형 이진 트리 판별: DFS로 각 서브트리 정보를 올려 보내며 조건을 검증하는 문제입니다.