---
title: "[코딩 테스트] 2026-06-02 — 부분 집합"
date: 2026-06-02 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 개발 학습, 인터뷰 준비, 기능 조합 테스트처럼 모든 선택 조합을 탐색하는 상황이 자주 나오기 때문에 부분 집합을 선택했습니다.

## 문제 설명

SaaS 제품에는 여러 개의 선택 기능이 있습니다.

각 기능은 켜거나 끌 수 있습니다.  
주어진 기능 목록으로 만들 수 있는 모든 기능 조합을 출력하세요.

단, 조합 안의 기능 순서는 입력 순서를 유지해야 합니다.  
출력 순서는 백트래킹으로 탐색하는 순서를 따릅니다.

탐색 규칙은 다음과 같습니다.

1. 현재 선택한 조합을 먼저 출력 후보에 넣습니다.
2. 현재 위치 이후의 기능을 하나씩 선택합니다.
3. 선택한 뒤 다음 위치로 재귀 탐색합니다.
4. 탐색이 끝나면 선택을 취소하고 다음 기능을 봅니다.

빈 조합은 `EMPTY`로 출력합니다.

## 입출력 예시

```
입력:
3
login payment analytics

출력:
EMPTY
login
login payment
login payment analytics
login analytics
payment
payment analytics
analytics

설명:
각 기능을 선택하거나 선택하지 않는 모든 조합을 출력한다.
조합 내부의 순서는 입력 순서를 유지한다.
```

```
입력:
2
chat storage

출력:
EMPTY
chat
chat storage
storage

설명:
가능한 부분 집합은 빈 조합, chat, chat storage, storage 총 4개다.
```

## 제약 조건

- `1 <= n <= 15`
- 기능 이름은 알파벳 소문자로만 구성된다.
- 기능 이름의 길이는 `1` 이상 `20` 이하이다.
- 기능 이름은 중복되지 않는다.
- 출력해야 하는 조합 수는 정확히 `2^n`개이다.
- 시간 제한은 모든 부분 집합을 출력할 수 있는 수준으로 주어진다.

## 풀이 접근법

### 핵심 아이디어

부분 집합은 각 원소를 선택할지 말지의 결과입니다.  
모든 경우를 빠짐없이 만들려면 백트래킹이 가장 직관적입니다.  
현재까지 선택한 배열을 유지하면서, 다음에 선택할 수 있는 원소들을 차례로 붙여 보면 됩니다.

### 단계별 풀이 과정

1. `result`에 현재 선택한 조합을 문자열로 저장합니다.
2. `start` 인덱스부터 끝까지 반복합니다.
3. 현재 기능을 `path`에 추가합니다.
4. 다음 인덱스부터 다시 재귀 탐색합니다.
5. 재귀가 끝나면 마지막에 넣은 기능을 제거합니다.
6. 모든 탐색이 끝나면 `result`를 줄 단위로 출력합니다.

## 코드 풀이

### Python
```python
import sys

def solve():
    input_data = sys.stdin.read().strip().split()

    n = int(input_data[0])
    features = input_data[1:1 + n]

    result = []
    path = []

    def backtrack(start):
        # 현재 조합을 먼저 저장한다.
        if path:
            result.append(" ".join(path))
        else:
            result.append("EMPTY")

        # start 이후의 기능을 하나씩 선택한다.
        for i in range(start, n):
            path.append(features[i])
            backtrack(i + 1)
            path.pop()

    backtrack(0)

    print("\n".join(result))

if __name__ == "__main__":
    solve()
```

### JavaScript
```javascript
const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/);

const n = Number(input[0]);
const features = input.slice(1, 1 + n);

const result = [];
const path = [];

function backtrack(start) {
  // 현재 조합을 먼저 저장한다.
  if (path.length > 0) {
    result.push(path.join(" "));
  } else {
    result.push("EMPTY");
  }

  // start 이후의 기능을 하나씩 선택한다.
  for (let i = start; i < n; i++) {
    path.push(features[i]);
    backtrack(i + 1);
    path.pop();
  }
}

backtrack(0);

console.log(result.join("\n"));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n * 2^n) — 부분 집합은 `2^n`개이고, 각 조합을 문자열로 만들 때 최대 `n`개 원소를 확인한다.
- **공간 복잡도**: O(n * 2^n) — 모든 출력 결과를 저장하면 전체 조합 크기만큼 공간이 필요하다.

## 틀리기 쉬운 포인트

- 빈 조합을 빼먹기 쉽다. 부분 집합에는 항상 빈 집합이 포함된다.
- `path.pop()`을 하지 않으면 이전 선택이 다음 탐색에 남는다.
- 재귀 호출을 `backtrack(i)`로 하면 같은 원소를 다시 고를 수 있다. 반드시 `i + 1`로 넘겨야 한다.

## 유사 문제 패턴

- 배열의 모든 조합 구하기: 길이가 `k`인 조합만 출력하는 문제.
- 부분 집합 합 문제: 모든 부분 집합 중 합이 특정 값이 되는 경우를 찾는 문제.
- 기능 플래그 테스트 케이스 생성: 여러 옵션의 모든 활성화 조합을 만드는 문제.