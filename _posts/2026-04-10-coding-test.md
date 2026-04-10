---
title: "[코딩 테스트] 2026-04-10 — LRU 캐시"
date: 2026-04-10 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, hash, linked-list]
---
## 오늘의 문제 선정 이유
> AI 도구, 대시보드, 추천 시스템처럼 최근에 본 데이터를 빠르게 재사용하는 서비스가 많아서 LRU 캐시 설계가 실무와 코딩 테스트 모두에 잘 맞습니다.

## 문제 설명

당신은 개발자용 AI 문서 검색 서비스를 만들고 있습니다.  
이 서비스는 최근 조회한 문서를 메모리에 캐시해 응답 속도를 높입니다.

캐시는 최대 `capacity`개의 문서만 저장할 수 있습니다.  
캐시 정책은 `LRU(Least Recently Used)`입니다.

즉, 가장 오래 사용하지 않은 문서를 먼저 제거해야 합니다.

아래 두 연산을 처리하는 `LRUCache` 클래스를 구현하세요.

- `get(key)`
  - `key`에 해당하는 문서가 캐시에 있으면 그 값을 반환합니다.
  - 조회된 문서는 가장 최근에 사용한 문서가 됩니다.
  - 없으면 `-1`을 반환합니다.

- `put(key, value)`
  - `key`에 해당하는 문서를 캐시에 저장합니다.
  - 이미 존재하면 값을 갱신하고, 가장 최근에 사용한 문서로 바꿉니다.
  - 존재하지 않으면 새로 추가합니다.
  - 캐시 크기가 `capacity`를 초과하면, 가장 오래 사용하지 않은 문서를 제거합니다.

각 연산은 평균적으로 `O(1)`에 동작해야 합니다.

## 입출력 예시

```text
입력:
capacity = 2
commands = ["put(10, 100)", "put(20, 200)", "get(10)", "put(30, 300)", "get(20)", "get(30)"]

출력:
[null, null, 100, null, -1, 300]

설명:
put(10, 100) -> {10=100}
put(20, 200) -> {10=100, 20=200}
get(10) -> 100, 10이 최근 사용됨
put(30, 300) -> capacity 초과, 가장 오래된 20 제거
get(20) -> 없음, -1
get(30) -> 300
```

```text
입력:
capacity = 3
commands = ["put(1, 10)", "put(2, 20)", "put(3, 30)", "get(2)", "put(4, 40)", "get(1)", "put(2, 25)", "get(2)"]

출력:
[null, null, null, 20, null, -1, null, 25]

설명:
처음 상태는 {1=10, 2=20, 3=30}
get(2) 후 사용 순서는 1, 3, 2
put(4, 40) 시 가장 오래된 1 제거
get(1) -> -1
put(2, 25) -> 기존 값 갱신, 2를 가장 최근으로 이동
get(2) -> 25
```

## 제약 조건

- `1 <= capacity <= 300000`
- `0 <= key <= 10^9`
- `0 <= value <= 10^9`
- 호출 횟수는 최대 `300000`
- 각 `get`, `put`은 평균 `O(1)`이어야 함
- 시간 제한 예시: 1초 ~ 2초
- 단순 배열 이동 방식은 시간 초과 가능

## 풀이 접근법

### 핵심 아이디어
이 문제는 "빠른 조회"와 "빠른 순서 변경"을 동시에 처리해야 합니다.  
`hash map`만 쓰면 조회는 빠르지만 사용 순서 정리가 어렵고, `linked list`만 쓰면 삭제할 위치를 바로 찾기 어렵습니다.  
그래서 `hash map + doubly linked list`를 함께 써서 `get`, `put`, 삭제, 맨 뒤 이동을 모두 `O(1)`로 처리합니다.

### 단계별 풀이 과정
1. `hash map`에 `key -> node`를 저장합니다. 이렇게 하면 특정 key의 노드를 바로 찾을 수 있습니다.
2. `doubly linked list`에는 사용 순서를 저장합니다. 맨 앞은 가장 오래된 데이터, 맨 뒤는 가장 최근 데이터입니다.
3. `get(key)`를 호출하면 map에서 노드를 찾고, 있으면 그 노드를 리스트 맨 뒤로 옮긴 뒤 값을 반환합니다.
4. `put(key, value)`에서 key가 이미 있으면 값만 바꾸고 맨 뒤로 옮깁니다.
5. key가 없으면 새 노드를 맨 뒤에 추가합니다.
6. 추가 후 크기가 `capacity`를 넘으면, 리스트 맨 앞 노드를 제거하고 map에서도 삭제합니다.

## 코드 풀이

### Python
```python
class Node:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = {}

        # dummy head, tail
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node) -> None:
        prev_node = node.prev
        next_node = node.next
        prev_node.next = next_node
        next_node.prev = prev_node

    def _add_to_end(self, node: Node) -> None:
        last = self.tail.prev

        last.next = node
        node.prev = last
        node.next = self.tail
        self.tail.prev = node

    def _move_to_end(self, node: Node) -> None:
        self._remove(node)
        self._add_to_end(node)

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1

        node = self.cache[key]
        self._move_to_end(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._move_to_end(node)
            return

        new_node = Node(key, value)
        self.cache[key] = new_node
        self._add_to_end(new_node)

        if len(self.cache) > self.capacity:
            # 가장 오래 사용하지 않은 노드는 head.next
            lru = self.head.next
            self._remove(lru)
            del self.cache[lru.key]


# 사용 예시
if __name__ == "__main__":
    lru = LRUCache(2)

    lru.put(10, 100)
    lru.put(20, 200)
    print(lru.get(10))  # 100
    lru.put(30, 300)    # 20 제거
    print(lru.get(20))  # -1
    print(lru.get(30))  # 300
```

### JavaScript
```javascript
class Node {
  constructor(key = 0, value = 0) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();

    // dummy head, tail
    this.head = new Node();
    this.tail = new Node();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  remove(node) {
    const prevNode = node.prev;
    const nextNode = node.next;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
  }

  addToEnd(node) {
    const last = this.tail.prev;

    last.next = node;
    node.prev = last;
    node.next = this.tail;
    this.tail.prev = node;
  }

  moveToEnd(node) {
    this.remove(node);
    this.addToEnd(node);
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }

    const node = this.cache.get(key);
    this.moveToEnd(node);
    return node.value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      const node = this.cache.get(key);
      node.value = value;
      this.moveToEnd(node);
      return;
    }

    const newNode = new Node(key, value);
    this.cache.set(key, newNode);
    this.addToEnd(newNode);

    if (this.cache.size > this.capacity) {
      // 가장 오래 사용하지 않은 노드는 head.next
      const lru = this.head.next;
      this.remove(lru);
      this.cache.delete(lru.key);
    }
  }
}

// 사용 예시
const lru = new LRUCache(2);

lru.put(10, 100);
lru.put(20, 200);
console.log(lru.get(10)); // 100
lru.put(30, 300);         // 20 제거
console.log(lru.get(20)); // -1
console.log(lru.get(30)); // 300
```

## 시간·공간 복잡도

- **시간 복잡도**: O(1) — `get`, `put`, 노드 삭제, 맨 뒤 추가를 모두 해시맵과 이중 연결 리스트로 상수 시간에 처리
- **공간 복잡도**: O(capacity) — 캐시에 저장된 노드와 해시맵 크기만큼 사용

## 틀리기 쉬운 포인트

- `get`만 하고 끝내면 안 됩니다. 조회한 데이터도 최근 사용으로 처리해서 맨 뒤로 옮겨야 합니다.
- `put`에서 기존 key를 갱신할 때도 최근 사용으로 바꿔야 합니다. 값만 수정하면 오답이 됩니다.
- 단일 연결 리스트로 구현하면 이전 노드 찾기가 어려워 `O(1)` 삭제가 깨집니다. 이 문제는 이중 연결 리스트가 핵심입니다.

## 유사 문제 패턴

- LFU 캐시 구현: 사용 횟수와 최근 사용 순서를 함께 관리해야 해서 설계형 문제로 자주 확장됩니다.
- 최근 본 상품 목록: 중복 제거, 최신 순서 유지, 최대 개수 제한이 함께 나오는 경우가 많습니다.
- 스트리밍 데이터 중 최근 K개 상태 유지: 큐, 덱, 해시를 섞어 순서와 빠른 접근을 동시에 관리하는 패턴으로 이어집니다.