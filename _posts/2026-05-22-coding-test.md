---
title: "[코딩 테스트] 2026-05-22 — 트리 직렬화/역직렬화"
date: 2026-05-22 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, string, tree, queue, bfs, dfs]
---
## 오늘의 문제 선정 이유
> AI 도구와 서비스가 많아질수록 트리 구조를 안전하게 저장하고 다시 복원하는 설계 문제가 더 자주 나온다.

## 문제 설명

AI assistant의 작업 흐름을 이진 트리로 관리하고 있다.  
각 노드는 정수 `id`를 가지며, 왼쪽 자식과 오른쪽 자식을 가질 수 있다.

이 트리를 네트워크로 전송하기 위해 문자열로 저장해야 한다.  
또, 저장한 문자열로부터 원래 트리를 정확히 복원해야 한다.

다음 두 함수를 구현하라.

- `serialize(root)`: 이진 트리를 문자열로 변환한다.
- `deserialize(data)`: 문자열을 이진 트리로 복원한다.

직렬화 규칙은 아래와 같다.

1. 레벨 순회(BFS) 순서로 노드를 기록한다.
2. `null` 자리는 `#`으로 기록한다.
3. 값은 `,`로 구분한다.
4. 문자열 길이를 줄이기 위해, 맨 뒤에 연속해서 붙는 `#`들은 모두 제거한다.
5. 빈 트리는 빈 문자열 `""`로 표현한다.

복원한 트리를 다시 직렬화했을 때, 원래 문자열과 같아야 한다.

## 입출력 예시

```text
입력: root = [10,5,15,2,7,null,20]
출력: "10,5,15,2,7,#,20"
설명:
레벨 순회 결과는 [10,5,15,2,7,#,20,#,#,#,#,#,#] 이다.
뒤쪽의 연속된 # 을 제거하면 "10,5,15,2,7,#,20" 이 된다.
이 문자열을 deserialize 하면 원래 트리와 같은 구조가 복원되어야 한다.
```

```text
입력: root = [1,null,3,2]
출력: "1,#,3,2"
설명:
왼쪽 자식이 비어 있어도 # 을 기록해야 구조가 유지된다.
복원하지 않으면 2가 어느 위치의 자식인지 알 수 없다.
```

```text
입력: root = []
출력: ""
설명:
빈 트리는 빈 문자열로 저장한다.
```

## 제약 조건

- 노드 개수 `n`은 `0 <= n <= 100000`
- 노드 값 범위는 `-10^9 <= val <= 10^9`
- 시간 제한은 `O(n)` 수준을 요구
- 재귀 깊이 초과를 피하기 위해 반복 기반 구현을 권장
- `deserialize(serialize(root))` 결과는 원래 트리와 동일해야 함

## 풀이 접근법

### 핵심 아이디어
이 문제의 핵심은 값만 저장하는 것이 아니라 트리의 "구조"까지 함께 저장하는 것이다.  
BFS로 순회하면서 `null` 자리를 `#`으로 기록하면, 각 노드의 왼쪽과 오른쪽 위치가 그대로 남아서 복원이 쉬워진다.

구현은 큐 하나로 충분하다.  
직렬화에서는 큐에서 꺼내며 값을 기록하고, 역직렬화에서는 문자열 토큰을 앞에서부터 읽으면서 부모 노드에 왼쪽, 오른쪽 자식을 차례로 연결하면 된다.

### 단계별 풀이 과정
1. `serialize`에서 루트가 없으면 빈 문자열을 반환한다.
2. 큐를 사용해 레벨 순회하며, 노드가 있으면 값 기록 후 자식을 큐에 넣고, 없으면 `#`을 기록한다.
3. 기록이 끝나면 뒤에서부터 연속된 `#`을 제거하고 `,`로 합쳐 문자열로 만든다.
4. `deserialize`에서 빈 문자열이면 `null`을 반환한다.
5. 첫 번째 값을 루트로 만들고 큐에 넣는다.
6. 큐에서 부모를 하나씩 꺼내며 토큰 두 개씩 읽어서 왼쪽, 오른쪽 자식을 연결한다.
7. 모든 토큰을 처리하면 복원 완료다.

## 코드 풀이

### Python
```python
from collections import deque
from typing import Optional


class TreeNode:
    def __init__(self, val: int = 0, left: Optional["TreeNode"] = None, right: Optional["TreeNode"] = None):
        self.val = val
        self.left = left
        self.right = right


class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        # 빈 트리는 빈 문자열로 표현한다.
        if not root:
            return ""

        result = []
        queue = deque([root])

        while queue:
            node = queue.popleft()

            if node is None:
                result.append("#")
                continue

            result.append(str(node.val))
            queue.append(node.left)
            queue.append(node.right)

        # 뒤쪽의 불필요한 null 표시는 제거한다.
        while result and result[-1] == "#":
            result.pop()

        return ",".join(result)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        # 빈 문자열이면 빈 트리다.
        if not data:
            return None

        tokens = data.split(",")
        root = TreeNode(int(tokens[0]))
        queue = deque([root])
        index = 1

        while queue and index < len(tokens):
            parent = queue.popleft()

            # 왼쪽 자식 처리
            if index < len(tokens) and tokens[index] != "#":
                left_node = TreeNode(int(tokens[index]))
                parent.left = left_node
                queue.append(left_node)
            index += 1

            # 오른쪽 자식 처리
            if index < len(tokens) and tokens[index] != "#":
                right_node = TreeNode(int(tokens[index]))
                parent.right = right_node
                queue.append(right_node)
            index += 1

        return root
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

class Codec {
  serialize(root) {
    // 빈 트리는 빈 문자열로 표현한다.
    if (!root) return "";

    const result = [];
    const queue = [root];
    let head = 0;

    while (head < queue.length) {
      const node = queue[head++];

      if (node === null) {
        result.push("#");
        continue;
      }

      result.push(String(node.val));
      queue.push(node.left);
      queue.push(node.right);
    }

    // 뒤쪽의 불필요한 null 표시는 제거한다.
    while (result.length > 0 && result[result.length - 1] === "#") {
      result.pop();
    }

    return result.join(",");
  }

  deserialize(data) {
    // 빈 문자열이면 빈 트리다.
    if (data === "") return null;

    const tokens = data.split(",");
    const root = new TreeNode(Number(tokens[0]));
    const queue = [root];
    let head = 0;
    let index = 1;

    while (head < queue.length && index < tokens.length) {
      const parent = queue[head++];

      // 왼쪽 자식 처리
      if (index < tokens.length && tokens[index] !== "#") {
        const leftNode = new TreeNode(Number(tokens[index]));
        parent.left = leftNode;
        queue.push(leftNode);
      }
      index += 1;

      // 오른쪽 자식 처리
      if (index < tokens.length && tokens[index] !== "#") {
        const rightNode = new TreeNode(Number(tokens[index]));
        parent.right = rightNode;
        queue.push(rightNode);
      }
      index += 1;
    }

    return root;
  }
}
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n)` — 각 노드를 직렬화와 역직렬화에서 한 번씩만 처리한다.
- **공간 복잡도**: `O(n)` — 결과 문자열 토큰과 큐에 최대 `n`개 수준의 데이터가 들어간다.

## 틀리기 쉬운 포인트

- `null` 자리를 빼먹으면 구조가 깨진다. 값만 저장하면 같은 값 배열로 여러 트리가 만들어질 수 있다.
- 뒤쪽 `#` 제거는 가능하지만, 중간의 `#`까지 제거하면 복원이 불가능해진다.
- 재귀 DFS로 구현하면 편해 보여도, 편향 트리에서 재귀 깊이 문제가 날 수 있다.
- 빈 문자열 `""`과 `" # "` 같은 잘못된 표현을 섞지 않도록 직렬화 규칙을 끝까지 일관되게 유지해야 한다.

## 유사 문제 패턴

- **N-ary Tree 직렬화/역직렬화**: 자식 수가 고정되지 않아 길이 정보나 구분자가 추가로 필요하다.
- **BST 직렬화 최적화**: BST 성질을 이용하면 `null` 없이도 복원 가능한 경우가 있다.
- **중첩 구조 파싱**: JSON, 폴더 트리, 댓글 트리처럼 구조 정보를 잃지 않고 저장하고 복원하는 문제와 연결된다.