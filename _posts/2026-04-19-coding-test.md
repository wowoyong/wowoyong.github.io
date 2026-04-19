---
title: "[코딩 테스트] 2026-04-19 — 이진 탐색 트리 검증"
date: 2026-04-19 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, tree, queue, binary-search, dfs]
---
## 오늘의 문제 선정 이유
> AI 도구와 복잡한 시스템이 주목받는 날일수록, 그 기반이 되는 트리 탐색과 검증 같은 기본기 문제가 다시 중요해집니다.

## 문제 설명

사내 검색 서비스에서 카테고리 인덱스를 트리 구조로 저장하고 있습니다.  
이 인덱스는 빠른 검색을 위해 이진 탐색 트리(Binary Search Tree, BST) 규칙을 따라야 합니다.

각 노드는 정수 값을 가지며, 왼쪽 자식은 부모보다 작은 값만 가져야 하고, 오른쪽 자식은 부모보다 큰 값만 가져야 합니다.  
또한 이 규칙은 바로 아래 자식뿐 아니라 모든 하위 서브트리에도 동일하게 적용되어야 합니다.

주어진 이진 트리가 유효한 BST인지 판별하는 함수를 작성하세요.

함수는 유효하면 `true`, 아니면 `false`를 반환하면 됩니다.

트리는 level-order 배열로 주어집니다.  
`null`은 해당 위치에 노드가 없음을 뜻합니다.

## 입출력 예시

```text
입력: [10, 5, 15, 2, 7, 12, 20]
출력: true
설명: 모든 노드가 BST 조건을 만족합니다.
```

```text
입력: [10, 5, 15, 2, 12, 11, 20]
출력: false
설명: 값 12는 10의 왼쪽 서브트리에 있으므로 10보다 작아야 하지만, 12이므로 BST가 아닙니다.
```

```text
입력: [8, 4, 10, 2, 6, 9, 12, null, null, 5, 7]
출력: true
설명: 각 서브트리에서도 왼쪽은 더 작고 오른쪽은 더 큰 규칙이 유지됩니다.
```

```text
입력: [8, 4, 10, 2, 9, null, 12]
출력: false
설명: 값 9는 8의 왼쪽 서브트리에 있으므로 8보다 작아야 하지만, 9이므로 BST가 아닙니다.
```

## 제약 조건

- 노드 개수 `n`: `1 <= n <= 10^5`
- 각 노드의 값: `-10^9 <= value <= 10^9`
- 중복 값은 허용하지 않음
- 시간 제한: 1초 ~ 2초
- 입력은 level-order 배열 형식
- 재귀 풀이를 사용할 경우, 언어별 재귀 깊이 제한에 주의

## 풀이 접근법

### 핵심 아이디어
이 문제는 "부모와만 비교"하면 틀릴 수 있습니다.  
어떤 노드가 BST인지 확인하려면, 그 노드가 들어갈 수 있는 값의 범위까지 함께 내려가야 합니다. 그래서 DFS를 하면서 각 노드가 `(min_value, max_value)` 범위 안에 있는지 검사하는 방법이 가장 안전합니다.

### 단계별 풀이 과정
1. level-order 배열을 이용해 이진 트리를 구성합니다.
2. DFS 함수에서 현재 노드가 가질 수 있는 최소값과 최대값을 함께 전달합니다.
3. 현재 노드 값이 `(low, high)` 범위를 벗어나면 바로 `false`를 반환합니다.
4. 왼쪽 서브트리는 `high`를 현재 노드 값으로 바꿔 검사합니다.
5. 오른쪽 서브트리는 `low`를 현재 노드 값으로 바꿔 검사합니다.
6. 모든 노드가 조건을 통과하면 `true`를 반환합니다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import List, Optional


class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left: Optional["TreeNode"] = None
        self.right: Optional["TreeNode"] = None


def build_tree(levels: List[Optional[int]]) -> Optional[TreeNode]:
    if not levels or levels[0] is None:
        return None

    root = TreeNode(levels[0])
    queue = deque([root])
    index = 1

    while queue and index < len(levels):
        current = queue.popleft()

        if index < len(levels) and levels[index] is not None:
            current.left = TreeNode(levels[index])
            queue.append(current.left)
        index += 1

        if index < len(levels) and levels[index] is not None:
            current.right = TreeNode(levels[index])
            queue.append(current.right)
        index += 1

    return root


def is_valid_bst(root: Optional[TreeNode]) -> bool:
    def dfs(node: Optional[TreeNode], low: float, high: float) -> bool:
        if node is None:
            return True

        # 현재 노드 값이 허용 범위 안에 있어야 한다.
        if not (low < node.val < high):
            return False

        # 왼쪽은 현재 값보다 작아야 하고, 오른쪽은 현재 값보다 커야 한다.
        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

    return dfs(root, float("-inf"), float("inf"))


# 예시 실행
levels1 = [10, 5, 15, 2, 7, 12, 20]
root1 = build_tree(levels1)
print(is_valid_bst(root1))  # True

levels2 = [10, 5, 15, 2, 12, 11, 20]
root2 = build_tree(levels2)
print(is_valid_bst(root2))  # False
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

function buildTree(levels) {
  if (!levels.length || levels[0] === null) {
    return null;
  }

  const root = new TreeNode(levels[0]);
  const queue = [root];
  let index = 1;
  let front = 0;

  while (front < queue.length && index < levels.length) {
    const current = queue[front++];

    if (index < levels.length && levels[index] !== null) {
      current.left = new TreeNode(levels[index]);
      queue.push(current.left);
    }
    index += 1;

    if (index < levels.length && levels[index] !== null) {
      current.right = new TreeNode(levels[index]);
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

    // 현재 값이 허용 범위를 벗어나면 BST가 아니다.
    if (!(low < node.val && node.val < high)) {
      return false;
    }

    // 왼쪽은 현재 값보다 작고, 오른쪽은 현재 값보다 커야 한다.
    return dfs(node.left, low, node.val) && dfs(node.right, node.val, high);
  }

  return dfs(root, -Infinity, Infinity);
}

// 예시 실행
const levels1 = [10, 5, 15, 2, 7, 12, 20];
const root1 = buildTree(levels1);
console.log(isValidBST(root1)); // true

const levels2 = [10, 5, 15, 2, 12, 11, 20];
const root2 = buildTree(levels2);
console.log(isValidBST(root2)); // false
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n)` — 모든 노드를 정확히 한 번씩 방문합니다.
- **공간 복잡도**: `O(h)` — DFS 호출 스택에 트리 높이만큼 공간이 필요합니다. 최악의 경우 `O(n)`입니다.

## 틀리기 쉬운 포인트

부모 노드와만 비교하면 틀립니다.  
예를 들어 `10`의 왼쪽 서브트리에 있는 값은, 바로 부모보다 작은 것만으로는 부족하고 `10`보다도 작아야 합니다.

중복 값을 허용하면 안 됩니다.  
BST 조건은 보통 `left < root < right`입니다. 따라서 `<=`, `>=` 비교를 잘못 쓰면 오답이 됩니다.

정수 최솟값, 최댓값이 들어올 수 있습니다.  
초기 범위를 잡을 때 임의의 작은 수나 큰 수를 쓰지 말고 `-inf`, `inf` 같은 개념을 쓰는 편이 안전합니다.

## 유사 문제 패턴

이진 탐색 트리에서 특정 구간 값만 세기  
각 노드가 범위 제한을 받으므로, DFS와 범위 전달 방식이 그대로 통합니다.

정렬된 배열이 높이 균형 BST인지 검증하기  
트리 구조와 중위 순회 성질을 함께 이해해야 해서 같은 BST 기본기가 필요합니다.

중위 순회 결과가 strictly increasing인지 확인하기  
BST 검증은 범위 체크 말고도 중위 순회로 풀 수 있습니다. 결국 핵심은 "BST의 전체 정렬 조건"을 확인하는 것입니다.