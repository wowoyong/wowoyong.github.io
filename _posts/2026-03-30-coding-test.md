---
title: "[코딩 테스트] 2026-03-30 — 이진 탐색, 행렬 k번째 최솟값"
date: 2026-03-30 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> AI, 추천 시스템, 물류 최적화처럼 큰 정렬 데이터에서 순위를 빠르게 찾는 문제가 많아서 오늘은 값 범위 이진 탐색 유형을 선택했다.

## 문제 설명

한 물류 플랫폼은 여러 지역 창고의 배송 비용 예측값을 표 형태로 관리합니다.

이 표는 `N x N` 행렬이며, 각 행은 왼쪽에서 오른쪽으로 오름차순 정렬되어 있고, 각 열도 위에서 아래로 오름차순 정렬되어 있습니다.

당신은 이 행렬에서 전체 원소를 오름차순으로 펼쳤을 때 `k`번째로 작은 값을 찾아야 합니다.

단, 모든 원소를 하나의 배열로 만들어 정렬하면 비효율적일 수 있습니다.  
행렬의 정렬 성질을 활용해서 더 빠르게 해결하세요.

## 입출력 예시

```text
입력:
matrix = [
  [3, 8, 12],
  [6, 10, 15],
  [9, 14, 20]
]
k = 5

출력: 10
설명: 전체 원소를 정렬하면 [3, 6, 8, 9, 10, 12, 14, 15, 20] 이고, 5번째 값은 10이다.
```

```text
입력:
matrix = [
  [1, 2, 4, 8],
  [2, 3, 6, 10],
  [5, 7, 9, 12],
  [11, 13, 15, 18]
]
k = 7

출력: 6
설명: 전체 원소를 정렬하면 [1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 18] 이고, 7번째 값은 6이다.
```

```text
입력:
matrix = [
  [-5, -2],
  [-1, 3]
]
k = 3

출력: -1
설명: 전체 원소를 정렬하면 [-5, -2, -1, 3] 이고, 3번째 값은 -1이다.
```

## 제약 조건

- `1 <= N <= 300`
- `1 <= k <= N * N`
- `-10^9 <= matrix[i][j] <= 10^9`
- 각 행은 오름차순 정렬
- 각 열은 오름차순 정렬
- 시간 제한 예시: 1초 ~ 2초

## 풀이 접근법

### 핵심 아이디어
이 문제는 "정답이 될 수 있는 값"을 이진 탐색하는 것이 핵심이다.  
행렬 인덱스를 탐색하는 것이 아니라, `x 이하인 값이 몇 개 있는가`를 빠르게 셀 수 있으면 `k`번째 수가 어디에 있는지 판단할 수 있다.

행과 열이 모두 정렬되어 있으므로, 왼쪽 아래 또는 오른쪽 위에서 시작하면 `x 이하 개수`를 한 번에 `O(N)`에 셀 수 있다.  
그래서 전체는 `O(N log(value range))`로 해결할 수 있다.

### 단계별 풀이 과정
1. `left`를 행렬의 최솟값 `matrix[0][0]`, `right`를 최댓값 `matrix[N-1][N-1]`로 둔다.
2. `mid`를 잡고, 행렬에서 `mid` 이하인 원소 개수를 센다.
3. 개수가 `k`보다 작으면 `k`번째 값은 더 커야 하므로 `left = mid + 1`로 이동한다.
4. 개수가 `k` 이상이면 `mid`가 정답 후보이므로 `right = mid`로 줄인다.
5. `left == right`가 되면 그 값이 `k`번째 최솟값이다.

## 코드 풀이

### Python
```python
def count_less_equal(matrix, target):
    n = len(matrix)
    row = n - 1
    col = 0
    count = 0

    # 왼쪽 아래에서 시작
    while row >= 0 and col < n:
        if matrix[row][col] <= target:
            # 현재 열에서 0 ~ row 까지는 모두 target 이하
            count += row + 1
            col += 1
        else:
            row -= 1

    return count


def kth_smallest(matrix, k):
    n = len(matrix)
    left = matrix[0][0]
    right = matrix[n - 1][n - 1]

    while left < right:
        mid = (left + right) // 2
        count = count_less_equal(matrix, mid)

        if count < k:
            left = mid + 1
        else:
            right = mid

    return left


# 예시 실행
if __name__ == "__main__":
    matrix1 = [
        [3, 8, 12],
        [6, 10, 15],
        [9, 14, 20]
    ]
    print(kth_smallest(matrix1, 5))  # 10

    matrix2 = [
        [1, 2, 4, 8],
        [2, 3, 6, 10],
        [5, 7, 9, 12],
        [11, 13, 15, 18]
    ]
    print(kth_smallest(matrix2, 7))  # 6
```

### JavaScript
```javascript
function countLessEqual(matrix, target) {
  const n = matrix.length;
  let row = n - 1;
  let col = 0;
  let count = 0;

  // 왼쪽 아래에서 시작
  while (row >= 0 && col < n) {
    if (matrix[row][col] <= target) {
      // 현재 열에서 0 ~ row 까지는 모두 target 이하
      count += row + 1;
      col += 1;
    } else {
      row -= 1;
    }
  }

  return count;
}

function kthSmallest(matrix, k) {
  const n = matrix.length;
  let left = matrix[0][0];
  let right = matrix[n - 1][n - 1];

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const count = countLessEqual(matrix, mid);

    if (count < k) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// 예시 실행
const matrix1 = [
  [3, 8, 12],
  [6, 10, 15],
  [9, 14, 20]
];
console.log(kthSmallest(matrix1, 5)); // 10

const matrix2 = [
  [1, 2, 4, 8],
  [2, 3, 6, 10],
  [5, 7, 9, 12],
  [11, 13, 15, 18]
];
console.log(kthSmallest(matrix2, 7)); // 6
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N log(maxValue - minValue))` — 값 범위를 이진 탐색하고, 매번 `O(N)`으로 개수를 센다.
- **공간 복잡도**: `O(1)` — 추가 배열 없이 변수만 사용한다.

## 틀리기 쉬운 포인트

- `count == k`라고 바로 `mid`를 반환하면 안 된다. 중복 값이 있을 수 있어서 더 작은 정답 후보가 남아 있을 수 있다.
- `mid 이하 개수`를 셀 때 한 칸씩 모두 확인하면 `O(N^2)`가 된다. 반드시 행렬 정렬 성질을 이용해야 한다.
- `left`, `right`는 인덱스가 아니라 값의 범위다. 이 점을 헷갈리면 구현이 꼬이기 쉽다.

## 유사 문제 패턴

- 정렬된 배열에서 `k`번째 수 찾기: 값 범위 이진 탐색으로 바꿔 생각하는 연습에 좋다.
- `x` 이하 원소 개수 구하기: 이 문제처럼 판별 함수가 있으면 파라메트릭 서치로 풀 수 있다.
- 두 배열의 곱셈표에서 `k`번째 수 찾기: 행렬은 아니지만 "개수를 세서 정답 범위를 줄이는" 접근이 같다.