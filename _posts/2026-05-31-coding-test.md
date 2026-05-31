---
title: "[코딩 테스트] 2026-05-31 — 이진 탐색 기본"
date: 2026-05-31 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 개발자 로드맵과 인터뷰 준비 흐름에 맞춰, 가장 자주 나오고 경계 조건 실수가 많은 이진 탐색을 선택했습니다.

## 문제 설명

오름차순으로 정렬된 서버 ID 배열이 있습니다.

각 서버 ID는 정수입니다. 중복은 없습니다.

관리자는 특정 서버 ID가 배열에 존재하는지 빠르게 확인하려고 합니다.

서버 ID 배열과 찾고 싶은 `target`이 주어질 때, `target`이 존재하면 해당 인덱스를 출력하세요. 존재하지 않으면 `-1`을 출력하세요.

인덱스는 `0`부터 시작합니다.

## 입출력 예시

```
입력:
5
10 20 30 40 50
30

출력:
2

설명:
30은 배열의 2번 인덱스에 있습니다.
```

```
입력:
6
3 8 15 21 34 55
22

출력:
-1

설명:
22는 배열에 존재하지 않습니다.
```

```
입력:
1
7
7

출력:
0

설명:
원소가 하나뿐이고 target과 같으므로 0을 출력합니다.
```

## 제약 조건

- `1 <= n <= 100,000`
- `-1,000,000,000 <= server_id <= 1,000,000,000`
- 배열은 오름차순으로 정렬되어 있습니다.
- 배열에는 중복된 값이 없습니다.
- `-1,000,000,000 <= target <= 1,000,000,000`
- 시간 제한을 고려해 `O(log n)` 풀이가 필요합니다.

## 풀이 접근법

### 핵심 아이디어

정렬된 배열에서 값을 찾을 때는 이진 탐색을 사용합니다.  
매번 탐색 범위를 절반으로 줄이기 때문에 선형 탐색보다 훨씬 빠릅니다.  
핵심은 `left <= right` 조건을 유지하고, `mid` 값을 비교한 뒤 범위를 정확히 줄이는 것입니다.

### 단계별 풀이 과정

1. `left`를 `0`, `right`를 `n - 1`로 둡니다.
2. `left <= right`인 동안 반복합니다.
3. `mid = (left + right) // 2`를 구합니다.
4. `arr[mid]`가 `target`이면 `mid`를 반환합니다.
5. `arr[mid]`가 `target`보다 작으면 왼쪽 구간은 버리고 `left = mid + 1`로 이동합니다.
6. `arr[mid]`가 `target`보다 크면 오른쪽 구간은 버리고 `right = mid - 1`로 이동합니다.
7. 반복이 끝나면 찾는 값이 없다는 뜻이므로 `-1`을 반환합니다.

## 코드 풀이

### Python
```python
import sys


def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid

        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1


def main():
    input = sys.stdin.readline

    n = int(input().strip())
    arr = list(map(int, input().split()))
    target = int(input().strip())

    print(binary_search(arr, target))


if __name__ == "__main__":
    main()
```

### JavaScript
```javascript
const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

let index = 0;
const n = input[index++];
const arr = [];

for (let i = 0; i < n; i++) {
  arr.push(input[index++]);
}

const target = input[index++];

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

console.log(binarySearch(arr, target));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(log n) — 탐색 범위를 매번 절반으로 줄입니다.
- **공간 복잡도**: O(1) — 추가 배열 없이 포인터 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `while left < right`로 작성하면 마지막 원소를 검사하지 못할 수 있습니다.
- `left = mid`, `right = mid`처럼 갱신하면 무한 루프가 날 수 있습니다.
- 배열 길이가 `1`일 때도 정상 동작해야 합니다.

## 유사 문제 패턴

- 정렬된 배열에서 특정 값 존재 여부 찾기
- 정렬된 배열에서 삽입 위치 찾기
- 정렬된 배열에서 특정 값보다 작은 원소 개수 구하기