---
title: "[코딩 테스트] 2026-06-04 — 최솟값 스택"
date: 2026-06-04 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, stack]
---
## 오늘의 문제 선정 이유
> 개발 도구와 학습 플랫폼 트렌드가 강한 날이라, 인터뷰에서 자주 나오는 기본 자료구조 설계 문제를 선택했습니다.

## 문제 설명

프로그래밍 인터뷰 연습 플랫폼에서 사용할 `MinStack`을 구현하세요.

이 스택은 일반 스택처럼 값을 넣고 빼는 기능을 지원합니다.  
추가로 현재 스택에 들어 있는 값 중 최솟값을 O(1)에 조회할 수 있어야 합니다.

다음 연산을 처리하세요.

- `push x`: 정수 `x`를 스택에 넣습니다.
- `pop`: 스택의 가장 위 값을 제거합니다.
- `top`: 스택의 가장 위 값을 출력합니다.
- `getMin`: 현재 스택의 최솟값을 출력합니다.

단, `pop`, `top`, `getMin`은 스택이 비어 있지 않을 때만 호출됩니다.

## 입출력 예시

```
입력:
["push 5", "push 3", "push 7", "getMin", "pop", "top", "getMin"]

출력:
[3, 3, 3]

설명:
5, 3, 7을 넣으면 최솟값은 3입니다.
7을 제거한 뒤 top은 3입니다.
현재 최솟값도 3입니다.
```

```
입력:
["push 2", "push 2", "push 4", "getMin", "pop", "pop", "getMin"]

출력:
[2, 2]

설명:
중복된 최솟값 2가 두 번 들어갑니다.
4와 위쪽의 2를 제거해도 아래쪽 2가 남아 있으므로 최솟값은 2입니다.
```

## 제약 조건

- 연산 개수는 1 이상 100,000 이하입니다.
- `push`로 들어오는 값은 -1,000,000 이상 1,000,000 이하의 정수입니다.
- `pop`, `top`, `getMin`은 스택이 비어 있지 않을 때만 호출됩니다.
- 모든 연산은 O(1)에 처리해야 합니다.

## 풀이 접근법

### 핵심 아이디어
일반 스택 하나만 쓰면 최솟값을 찾을 때 매번 전체를 훑어야 합니다. 그러면 `getMin`이 O(n)이 됩니다.  
따라서 값 스택과 함께, 각 시점의 최솟값을 저장하는 보조 스택을 같이 관리합니다.

### 단계별 풀이 과정
1. `stack`에는 실제 값을 저장합니다.
2. `minStack`에는 현재까지의 최솟값을 저장합니다.
3. `push x`를 할 때 `x`와 현재 최솟값 중 더 작은 값을 `minStack`에 같이 넣습니다.
4. `pop`을 할 때 두 스택에서 동시에 하나씩 제거합니다.
5. `top`은 `stack`의 마지막 값을 반환합니다.
6. `getMin`은 `minStack`의 마지막 값을 반환합니다.

## 코드 풀이

### Python
```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x):
        self.stack.append(x)

        if not self.min_stack:
            self.min_stack.append(x)
        else:
            current_min = min(x, self.min_stack[-1])
            self.min_stack.append(current_min)

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]


def solve(operations):
    min_stack = MinStack()
    result = []

    for op in operations:
        parts = op.split()
        command = parts[0]

        if command == "push":
            value = int(parts[1])
            min_stack.push(value)
        elif command == "pop":
            min_stack.pop()
        elif command == "top":
            result.append(min_stack.top())
        elif command == "getMin":
            result.append(min_stack.getMin())

    return result


# 예시 실행
operations = ["push 5", "push 3", "push 7", "getMin", "pop", "top", "getMin"]
print(solve(operations))  # [3, 3, 3]
```

### JavaScript
```javascript
class MinStack {
  constructor() {
    this.stack = [];
    this.minStack = [];
  }

  push(x) {
    this.stack.push(x);

    if (this.minStack.length === 0) {
      this.minStack.push(x);
    } else {
      const currentMin = Math.min(x, this.minStack[this.minStack.length - 1]);
      this.minStack.push(currentMin);
    }
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

function solve(operations) {
  const minStack = new MinStack();
  const result = [];

  for (const op of operations) {
    const parts = op.split(" ");
    const command = parts[0];

    if (command === "push") {
      const value = Number(parts[1]);
      minStack.push(value);
    } else if (command === "pop") {
      minStack.pop();
    } else if (command === "top") {
      result.push(minStack.top());
    } else if (command === "getMin") {
      result.push(minStack.getMin());
    }
  }

  return result;
}

// 예시 실행
const operations = ["push 5", "push 3", "push 7", "getMin", "pop", "top", "getMin"];
console.log(solve(operations)); // [3, 3, 3]
```

## 시간·공간 복잡도

- **시간 복잡도**: O(1) per operation — 각 연산은 배열의 마지막 원소만 다룹니다.
- **공간 복잡도**: O(n) — 값 스택과 최솟값 스택에 최대 n개의 원소를 저장합니다.

## 틀리기 쉬운 포인트

- 최솟값이 중복될 수 있습니다. `minStack`에 최솟값이 바뀔 때만 넣으면 중복 최솟값 처리에서 실수하기 쉽습니다.
- `pop`할 때 `stack`만 제거하면 `minStack` 상태가 어긋납니다. 두 스택을 항상 같이 제거해야 합니다.
- 음수 값도 들어올 수 있습니다. 초기 최솟값을 `0` 같은 임의 값으로 두면 틀립니다.

## 유사 문제 패턴

- 최댓값 스택: `getMax`를 O(1)에 지원하는 스택입니다.
- 괄호 문자열 검사: 스택의 push/pop 흐름을 이해하는 기본 문제입니다.
- 히스토그램 최대 직사각형: 스택으로 이전 상태를 유지하며 O(n)에 해결하는 대표 문제입니다.