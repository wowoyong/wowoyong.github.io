---
title: "[코딩 테스트] 2026-04-09 — 최솟값 스택"
date: 2026-04-09 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, stack, queue]
---
## 오늘의 문제 선정 이유
> 설계형 자료구조 문제는 백엔드·풀스택 개발자가 자주 마주치는 상태 관리와 연산 최적화 감각을 함께 볼 수 있어서 오늘 주제로 적합합니다.

## 문제 설명

로그 수집 시스템에서 최근 작업 상태를 되돌리기 위해 스택을 사용하고 있습니다.  
이 스택은 일반적인 `push`, `pop`, `top` 기능뿐 아니라, 현재 스택에 들어 있는 값 중 최솟값을 빠르게 조회하는 `getMin` 기능도 지원해야 합니다.

정수만 저장하는 `MinStack` 클래스를 구현하세요.

지원해야 하는 연산은 아래와 같습니다.

- `push(x)`: 정수 `x`를 스택에 넣습니다.
- `pop()`: 스택의 맨 위 원소를 제거합니다.
- `top()`: 스택의 맨 위 원소를 반환합니다.
- `getMin()`: 현재 스택에 들어 있는 값 중 최솟값을 반환합니다.

모든 연산은 `O(1)` 시간에 동작해야 합니다.

빈 스택에서 `pop`, `top`, `getMin`이 호출되는 경우는 입력으로 주어지지 않습니다.

## 입출력 예시

```text
입력:
["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"]
[[], [5], [2], [4], [], [], [], []]

출력:
[null, null, null, null, 2, null, 2, 2]

설명:
push(5) -> 스택: [5]
push(2) -> 스택: [5, 2]
push(4) -> 스택: [5, 2, 4]
getMin() -> 2
pop() -> 스택: [5, 2]
top() -> 2
getMin() -> 2
```

```text
입력:
["MinStack", "push", "push", "push", "getMin", "pop", "getMin", "pop", "getMin"]
[[], [3], [3], [1], [], [], [], [], []]

출력:
[null, null, null, null, 1, null, 3, null, 3]

설명:
push(3) -> 스택: [3]
push(3) -> 스택: [3, 3]
push(1) -> 스택: [3, 3, 1]
getMin() -> 1
pop() -> 스택: [3, 3]
getMin() -> 3
pop() -> 스택: [3]
getMin() -> 3
```

## 제약 조건

- 저장되는 값 `x`의 범위: `-10^9 <= x <= 10^9`
- 전체 연산 수: `1 <= n <= 200,000`
- 각 연산은 평균이 아니라 항상 `O(1)`에 처리해야 함
- 시간 제한 예시: 1초 ~ 2초
- 빈 스택에 대한 잘못된 호출은 주어지지 않음

## 풀이 접근법

### 핵심 아이디어
이 문제는 최솟값을 매번 다시 계산하면 `O(n)`이 걸리기 때문에 조건을 만족할 수 없습니다.  
그래서 스택에 값을 넣을 때, 그 시점까지의 최솟값도 함께 저장합니다. 그러면 맨 위 원소만 보고도 현재 최솟값을 바로 알 수 있습니다.

### 단계별 풀이 과정
1. 스택의 각 칸에 `value`와 `currentMin`을 함께 저장합니다.
2. `push(x)` 할 때 현재 스택의 최솟값과 `x`를 비교해 새로운 최솟값을 계산합니다.
3. `pop()`은 맨 위 원소를 제거하면 끝입니다. 최솟값 정보도 같이 사라집니다.
4. `top()`은 맨 위의 `value`를 반환합니다.
5. `getMin()`은 맨 위의 `currentMin`을 반환합니다.

## 코드 풀이

### Python
```python
class MinStack:
    def __init__(self):
        # 각 원소는 [value, current_min] 형태로 저장
        self.stack = []

    def push(self, x: int) -> None:
        # 현재까지의 최솟값을 함께 저장
        if not self.stack:
            current_min = x
        else:
            current_min = min(x, self.stack[-1][1])

        self.stack.append([x, current_min])

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]
```

### JavaScript
```javascript
class MinStack {
  constructor() {
    // 각 원소는 [value, currentMin] 형태로 저장
    this.stack = [];
  }

  push(x) {
    let currentMin;

    if (this.stack.length === 0) {
      currentMin = x;
    } else {
      currentMin = Math.min(x, this.stack[this.stack.length - 1][1]);
    }

    this.stack.push([x, currentMin]);
  }

  pop() {
    this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1][0];
  }

  getMin() {
    return this.stack[this.stack.length - 1][1];
  }
}
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(1)` — 각 연산이 배열 끝에서 한 번만 처리됨
- **공간 복잡도**: `O(n)` — 원소 수만큼 값과 최솟값을 함께 저장함

## 틀리기 쉬운 포인트

`getMin()`을 위해 별도 변수 하나만 두고 `pop()` 때 갱신하지 않으면 이전 최솟값 복구가 안 됩니다.

최솟값이 같은 값이 여러 번 들어올 수 있습니다. `3, 3, 1` 같은 경우를 제대로 처리해야 합니다.

`push` 시점의 최솟값을 저장하지 않고 필요할 때마다 다시 탐색하면 시간 제한을 통과할 수 없습니다.

## 유사 문제 패턴

괄호 검사처럼 스택의 최근 상태를 빠르게 관리하는 문제에서도 같은 자료구조 감각이 필요합니다.

주식 가격 span, 온도 비교처럼 이전 상태를 유지하며 즉시 답을 내는 문제는 스택 설계 방식이 비슷합니다.

`max stack`, `min queue`처럼 최댓값이나 최솟값을 빠르게 꺼내야 하는 확장형 자료구조 문제로도 이어집니다.