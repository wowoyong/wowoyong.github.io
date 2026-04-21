---
title: "[코딩 테스트] 2026-04-21 — 트리 직렬화/역직렬화"
date: 2026-04-21 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, string, tree, queue, bfs]
---
## 오늘의 문제 선정 이유
> AI 도구, 교육 플랫폼, 대규모 오픈소스가 함께 주목받는 흐름에서, 구조화된 데이터를 안전하게 저장하고 복원하는 직렬화 문제는 지금도 매우 실무적이고 코딩 테스트에서도 자주 나온다.

## 문제 설명

로그 분석 시스템에서 이진 의사결정 트리를 문자열로 저장하고 다시 복원해야 합니다.

각 노드는 정수 값을 가집니다. 트리를 문자열로 저장할 때는 레벨 순회(BFS) 결과를 사용합니다. 자식이 없는 위치는 `#`로 표시합니다. 값은 쉼표(`,`)로 구분합니다.

예를 들어 아래와 같은 트리:

```text
        8
      /   \
     3     10
    / \      \
   1   6      14
```

는 다음과 같이 저장할 수 있습니다.

```text
8,3,10,1,6,#,14,#,#,#,#,#,#
```

문자열 끝부분에는 의미 없는 `#`가 여러 개 붙을 수 있습니다. 이런 중복 `#`는 제거한 뒤 저장해도 되고, 남겨도 됩니다. 단, 복원한 트리는 원래 트리와 구조와 값이 모두 같아야 합니다.

다음 두 함수를 구현하세요.

- `serialize(root)`  
  이진 트리를 문자열로 직렬화해서 반환합니다.
- `deserialize(data)`  
  직렬화된 문자열을 다시 이진 트리로 복원해서 루트 노드를 반환합니다.

추가로, 채점에서는 다음 조건을 확인합니다.

- `deserialize(serialize(root))` 결과가 원래 트리와 동일한가
- 빈 트리도 올바르게 처리하는가

## 입출력 예시

```text
입력: root = [8,3,10,1,6,null,14]
출력: "8,3,10,1,6,#,14"
설명: 레벨 순회 기준으로 저장한다. 마지막의 불필요한 #은 제거해도 정답이다.
```

```text
입력: data = "5,2,9,#,4,7,#"
출력: [5,2,9,null,4,7,null]
설명: 문자열을 순서대로 읽으며 부모 노드의 왼쪽, 오른쪽 자식을 복원한다.
```

```text
입력: root = []
출력: ""
설명: 빈 트리는 빈 문자열로 저장한다.
```

## 제약 조건

- 노드 개수는 `0` 이상 `100000` 이하
- 각 노드 값은 `-10^9` 이상 `10^9` 이하
- 직렬화 결과는 BFS 규칙을 따라야 함
- 시간 제한은 일반적인 코딩 테스트 기준에서 `O(N)` 내 통과 가능해야 함
- 재귀 깊이 제한에 걸릴 수 있으므로, 매우 치우친 트리도 고려해야 함

## 풀이 접근법

### 핵심 아이디어
이 문제는 트리의 구조까지 함께 저장해야 하므로, 값만 나열하면 안 됩니다. 빠진 자식 위치를 `#`로 함께 기록해야 역직렬화할 때 원래 모양을 정확히 복원할 수 있습니다.

구현은 BFS가 가장 자연스럽습니다. 직렬화할 때는 큐로 노드를 순서대로 꺼내고, 역직렬화할 때도 큐를 써서 부모 노드에 왼쪽, 오른쪽 자식을 차례대로 연결하면 됩니다.

### 단계별 풀이 과정
1. `serialize`에서는 루트가 없으면 빈 문자열을 반환합니다.
2. 루트가 있으면 큐에 넣고 BFS를 돌립니다.
3. 노드가 있으면 값을 문자열 배열에 추가하고, 왼쪽과 오른쪽 자식을 큐에 넣습니다.
4. 노드가 없으면 `#`를 추가합니다.
5. 마지막에 의미 없는 trailing `#`는 제거해서 문자열을 짧게 만듭니다.
6. `deserialize`에서는 빈 문자열이면 `None` 또는 `null`을 반환합니다.
7. 첫 번째 값을 루트로 만들고 큐에 넣습니다.
8. 큐에서 부모를 하나씩 꺼내며, 문자열 배열에서 다음 두 값을 읽어 왼쪽과 오른쪽 자식을 복원합니다.
9. 값이 `#`가 아니면 새 노드를 만들고 부모와 연결한 뒤 큐에 넣습니다.

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
        # 빈 트리는 빈 문자열로 저장
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

        # 뒤쪽의 불필요한 # 제거
        while result and result[-1] == "#":
            result.pop()

        return ",".join(result)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        # 빈 문자열이면 빈 트리
        if not data:
            return None

        values = data.split(",")
        root = TreeNode(int(values[0]))
        queue = deque([root])
        index = 1

        while queue and index < len(values):
            parent = queue.popleft()

            # 왼쪽 자식 복원
            if index < len(values) and values[index] != "#":
                left_node = TreeNode(int(values[index]))
                parent.left = left_node
                queue.append(left_node)
            index += 1

            # 오른쪽 자식 복원
            if index < len(values) and values[index] != "#":
                right_node = TreeNode(int(values[index]))
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
    // 빈 트리는 빈 문자열로 저장
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

    // 뒤쪽의 불필요한 # 제거
    while (result.length > 0 && result[result.length - 1] === "#") {
      result.pop();
    }

    return result.join(",");
  }

  deserialize(data) {
    // 빈 문자열이면 빈 트리
    if (data === "") return null;

    const values = data.split(",");
    const root = new TreeNode(Number(values[0]));
    const queue = [root];
    let head = 0;
    let index = 1;

    while (head < queue.length && index < values.length) {
      const parent = queue[head++];

      // 왼쪽 자식 복원
      if (index < values.length && values[index] !== "#") {
        const leftNode = new TreeNode(Number(values[index]));
        parent.left = leftNode;
        queue.push(leftNode);
      }
      index += 1;

      // 오른쪽 자식 복원
      if (index < values.length && values[index] !== "#") {
        const rightNode = new TreeNode(Number(values[index]));
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

- **시간 복잡도**: `O(N)` — 각 노드를 직렬화와 역직렬화 과정에서 한 번씩만 처리한다.
- **공간 복잡도**: `O(N)` — 결과 문자열 배열과 큐에 최대 노드 수만큼 저장될 수 있다.

## 틀리기 쉬운 포인트

- `null` 자리를 기록하지 않으면 구조가 달라진다. 같은 값 집합이어도 트리 모양이 다르면 다른 트리다.
- 직렬화 결과 뒤의 `#`를 제거할 때, 복원에 필요한 중간 `#`까지 지우면 안 된다. 끝부분만 제거해야 한다.
- 역직렬화에서 배열 인덱스를 두 칸씩 안전하게 이동해야 한다. 마지막 부모 노드에서 오른쪽 자식 값이 없을 수 있다.

## 유사 문제 패턴

- **N-ary Tree 직렬화/역직렬화**  
  자식 수가 가변적일 때 구분자를 어떻게 둘지 설계하는 문제다. 직렬화 포맷 설계 능력을 본다.
- **중첩 리스트 파싱**  
  문자열을 트리나 계층 구조로 복원하는 문제다. 스택이나 포인터 이동이 핵심이다.
- **파일 시스템 경로 복원**  
  문자열이나 배열 형태의 입력을 계층 구조로 되돌리는 문제다. 트리 구성과 노드 연결 로직이 비슷하다.