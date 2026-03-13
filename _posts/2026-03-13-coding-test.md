---
title: "[코딩 테스트] 2026-03-13 — 행렬 k번째 최솟값"
date: 2026-03-13 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, sort]
---
## 오늘의 문제 선정 이유
> 대용량 데이터와 추천·최적화 같은 트렌드가 강한 날이라, 정렬된 구조에서 빠르게 답을 찾는 이진 탐색 유형을 골랐습니다.

## 문제 설명

물류 센터의 처리 비용을 분석하기 위해 `N x N` 비용 행렬이 주어집니다.  
이 행렬은 각 행이 왼쪽에서 오른쪽으로 오름차순 정렬되어 있고, 각 열도 위에서 아래로 오름차순 정렬되어 있습니다.

당신은 이 행렬 안의 모든 값을 작은 순서대로 펼쳤을 때, `k`번째로 작은 값을 찾아야 합니다.

같은 값이 여러 번 나올 수 있으며, 중복도 각각 개별 원소로 계산합니다.

함수는 `matrix`와 정수 `k`를 입력받아 `k`번째로 작은 값을 반환해야 합니다.

## 입출력 예시

```text
입력:
matrix = [
  [2, 5, 8],
  [4, 7, 10],
  [6, 9, 12]
]
k = 5

출력: 7

설명:
전체 원소를 펼치면 [2, 4, 5, 6, 7, 8, 9, 10, 12] 이고,
5번째로 작은 값은 7이다.
```

```text
입력:
matrix = [
  [1, 3, 3],
  [2, 4, 6],
  [3, 5, 7]
]
k = 4

출력: 3

설명:
전체 원소를 펼치면 [1, 2, 3, 3, 3, 4, 5, 6, 7] 이고,
4번째로 작은 값은 3이다.
```

```text
입력:
matrix = [
  [-5, -2],
  [-1, 3]
]
k = 3

출력: -1

설명:
전체 원소를 펼치면 [-5, -2, -1, 3] 이고,
3번째로 작은 값은 -1이다.
```

## 제약 조건

- `1 <= N <= 300`
- `N == matrix.length == matrix[i].length`
- `-10^9 <= matrix[i][j] <= 10^9`
- 각 행은 오름차순 정렬
- 각 열은 오름차순 정렬
- `1 <= k <= N * N`
- 시간 제한: 일반적인 코딩 테스트 기준 1~2초

## 풀이 접근법

### 핵심 아이디어
이 문제는 행렬을 전부 펼쳐서 정렬하면 풀 수 있지만, `N`이 크면 비효율적입니다.  
행과 열이 모두 정렬되어 있다는 점을 이용하면, "어떤 값 `mid` 이하인 원소가 몇 개 있는가?"를 빠르게 셀 수 있습니다. 그래서 값의 범위에 대해 이진 탐색을 하면 `k`번째 작은 값을 찾을 수 있습니다.

### 단계별 풀이 과정
1. 탐색 범위를 `left = matrix[0][0]`, `right = matrix[N-1][N-1]`로 둡니다.
2. `mid`를 정한 뒤, 행렬에서 `mid` 이하인 원소 개수를 셉니다.
3. 개수가 `k`보다 작으면 답은 더 큰 쪽에 있으므로 `left = mid + 1`로 이동합니다.
4. 개수가 `k` 이상이면 답이 될 수 있으므로 `right = mid`로 줄입니다.
5. `left == right`가 되면 그 값이 `k`번째 작은 값입니다.

## 코드 풀이

### Python
```python
def kth_smallest_in_sorted_matrix(matrix, k):
    n = len(matrix)

    def count_less_equal(target):
        # 왼쪽 아래에서 시작하면 한 번의 스캔으로 개수를 셀 수 있다.
        row = n - 1
        col = 0
        count = 0

        while row >= 0 and col < n:
            if matrix[row][col] <= target:
                # 현재 위치 위쪽은 모두 target 이하
                count += row + 1
                col += 1
            else:
                row -= 1

        return count

    left = matrix[0][0]
    right = matrix[n - 1][n - 1]

    while left < right:
        mid = (left + right) // 2
        cnt = count_less_equal(mid)

        if cnt < k:
            left = mid + 1
        else:
            right = mid

    return left


# 예시 실행
if __name__ == "__main__":
    matrix1 = [
        [2, 5, 8],
        [4, 7, 10],
        [6, 9, 12]
    ]
    print(kth_smallest_in_sorted_matrix(matrix1, 5))  # 7

    matrix2 = [
        [1, 3, 3],
        [2, 4, 6],
        [3, 5, 7]
    ]
    print(kth_smallest_in_sorted_matrix(matrix2, 4))  # 3
```

### JavaScript
```javascript
function kthSmallestInSortedMatrix(matrix, k) {
  const n = matrix.length;

  function countLessEqual(target) {
    // 왼쪽 아래에서 시작하면 O(N)에 개수를 셀 수 있다.
    let row = n - 1;
    let col = 0;
    let count = 0;

    while (row >= 0 && col < n) {
      if (matrix[row][col] <= target) {
        // 현재 위치 위쪽은 모두 target 이하
        count += row + 1;
        col += 1;
      } else {
        row -= 1;
      }
    }

    return count;
  }

  let left = matrix[0][0];
  let right = matrix[n - 1][n - 1];

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const count = countLessEqual(mid);

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
  [2, 5, 8],
  [4, 7, 10],
  [6, 9, 12]
];
console.log(kthSmallestInSortedMatrix(matrix1, 5)); // 7

const matrix2 = [
  [1, 3, 3],
  [2, 4, 6],
  [3, 5, 7]
];
console.log(kthSmallestInSortedMatrix(matrix2, 4)); // 3
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N log(Max-Min))` — 값의 범위를 이진 탐색하고, 매번 `O(N)`에 개수를 셉니다.
- **공간 복잡도**: `O(1)` — 추가 배열 없이 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `k`번째 "서로 다른 값"이 아니라, 중복을 포함한 `k`번째 원소입니다.
- `count < k`일 때만 오른쪽이 아니라 왼쪽 범위를 올려야 합니다. `count == k`인 경우도 답 후보입니다.
- 개수를 셀 때 각 행마다 이진 탐색을 해도 되지만, 이 문제에서는 왼쪽 아래 또는 오른쪽 위 포인터 방식이 더 간단하고 빠릅니다.

## 유사 문제 패턴

- 정렬된 배열에서 조건을 만족하는 최소값 찾기: 답을 직접 찾기보다 "가능 여부"를 기준으로 이진 탐색합니다.
- `k`번째 거리값, `k`번째 곱셈표 값 찾기: 값의 범위 위에서 이진 탐색하고 개수를 세는 패턴이 같습니다.
- 행렬에서 특정 값 이하 원소 개수 세기: 행·열 정렬 성질을 이용한 포인터 이동이 자주 나옵니다.

---