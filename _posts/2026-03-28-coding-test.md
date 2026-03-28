---
title: "[코딩 테스트] 2026-03-28 — 행렬 90도 회전"
date: 2026-03-28 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> UI 렌더링, 이미지 처리, 2D 데이터 변환처럼 프론트엔드와 백엔드 모두에서 자주 만나는 행렬 조작의 기본이기 때문입니다.

## 문제 설명

당신은 대시보드용 썸네일 편집기를 만들고 있습니다.  
편집기는 정사각형 픽셀 보드를 `N x N` 정수 행렬로 관리합니다.  
각 칸의 값은 해당 위치의 픽셀 ID를 뜻합니다.

이 보드를 시계 방향으로 90도 회전해야 합니다.

단, 다음 조건을 반드시 지켜야 합니다.

- 새로운 `N x N` 행렬을 만들면 안 됩니다.
- 입력으로 주어진 행렬 내부에서 직접 값을 바꿔야 합니다.
- 함수는 회전이 끝난 같은 행렬을 반환하거나, 제자리 수정만 수행하면 됩니다.

## 입출력 예시

```text
입력:
[
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

출력:
[
  [7, 4, 1],
  [8, 5, 2],
  [9, 6, 3]
]

설명:
맨 아래 행이 첫 번째 열로 올라가며, 전체 행렬이 시계 방향으로 90도 회전합니다.
```

```text
입력:
[
  [5, 1, 9, 11],
  [2, 4, 8, 10],
  [13, 3, 6, 7],
  [15, 14, 12, 16]
]

출력:
[
  [15, 13, 2, 5],
  [14, 3, 4, 1],
  [12, 6, 8, 9],
  [16, 7, 10, 11]
]

설명:
바깥 테두리부터 안쪽 테두리까지 4개 칸씩 자리를 교환하면 됩니다.
```

```text
입력:
[
  [42]
]

출력:
[
  [42]
]

설명:
크기가 1인 행렬은 회전해도 그대로입니다.
```

## 제약 조건

- `1 <= N <= 200`
- 행렬의 크기는 항상 `N x N`
- 각 원소의 값은 `-10^9 <= matrix[i][j] <= 10^9`
- 추가적인 `N x N` 배열 생성 금지
- 시간 제한 예시: 1초 ~ 2초

## 풀이 접근법

### 핵심 아이디어
이 문제는 새 배열을 만들 수 없으므로, 각 원소를 제자리에서 이동시켜야 합니다.  
가장 안전한 방법은 행렬을 두 단계로 변환하는 것입니다. 먼저 `transpose`를 하고, 그다음 각 행을 뒤집으면 시계 방향 90도 회전이 됩니다.

### 단계별 풀이 과정
1. `matrix[i][j]`와 `matrix[j][i]`를 바꿔서 행렬을 대각선 기준으로 뒤집습니다.
2. 각 행마다 왼쪽과 오른쪽 값을 서로 교환하며 `reverse` 합니다.
3. 이렇게 하면 각 원소가 시계 방향 90도 회전한 위치로 이동합니다.

## 코드 풀이

### Python
```python
def rotate(matrix):
    n = len(matrix)

    # 1. transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

    # 2. reverse each row
    for i in range(n):
        left, right = 0, n - 1
        while left < right:
            matrix[i][left], matrix[i][right] = matrix[i][right], matrix[i][left]
            left += 1
            right -= 1

    return matrix


# 실행 예시
if __name__ == "__main__":
    matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]
    print(rotate(matrix))
```

### JavaScript
```javascript
function rotate(matrix) {
  const n = matrix.length;

  // 1. transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }

  // 2. reverse each row
  for (let i = 0; i < n; i++) {
    let left = 0;
    let right = n - 1;

    while (left < right) {
      const temp = matrix[i][left];
      matrix[i][left] = matrix[i][right];
      matrix[i][right] = temp;
      left++;
      right--;
    }
  }

  return matrix;
}

// 실행 예시
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

console.log(rotate(matrix));
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N^2)` — 모든 원소를 많아야 두 번 정도 방문합니다.
- **공간 복잡도**: `O(1)` — 추가 행렬 없이 몇 개의 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `transpose` 할 때 `j`를 `0`부터 돌리면 같은 원소를 두 번 바꿉니다. `j = i + 1`부터 시작해야 합니다.
- 행 전체를 뒤집어야 시계 방향 90도 회전입니다. 열을 뒤집으면 반시계 방향이나 다른 변환이 됩니다.
- `N = 1`인 경우도 정상 동작해야 합니다. 예외 처리 없이도 돌아가게 짜는 것이 좋습니다.

## 유사 문제 패턴

- 행렬 `transpose`: 대각선 기준 대칭 변환을 묻는 문제입니다.
- 이미지 뒤집기와 반전: 각 행을 뒤집거나 비트를 반전하는 식으로 제자리 수정이 자주 나옵니다.
- 테두리 단위 회전: 행렬의 바깥 레이어부터 안쪽 레이어까지 원소를 순환 이동시키는 문제입니다.

---