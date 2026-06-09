---
title: "[코딩 테스트] 2026-06-09 — 빗물 트래핑"
date: 2026-06-09 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, dp]
---
## 오늘의 문제 선정 이유
> 알고리즘 학습 콘텐츠와 인터뷰 준비가 함께 주목받는 흐름에 맞춰, 배열과 투 포인터 기본기를 동시에 검증하기 좋은 유형입니다.

## 문제 설명

한 개발팀은 데이터센터 바닥에 설치된 냉각 덕트의 단면을 점검하고 있습니다.

덕트는 왼쪽에서 오른쪽으로 `n`개의 구역으로 나뉘어 있습니다.  
각 구역에는 높이가 다른 칸막이가 세워져 있고, 비상 냉각수 테스트 후 칸막이 사이에 물이 고일 수 있습니다.

각 구역의 칸막이 높이가 배열 `height`로 주어질 때, 고일 수 있는 물의 총량을 구하세요.

각 구역의 너비는 `1`입니다.

## 입출력 예시

```
입력: height = [0, 3, 0, 2, 0, 4]
출력: 7
설명: 인덱스 2에는 3만큼, 인덱스 3에는 1만큼, 인덱스 4에는 3만큼 물이 고입니다.
총 7입니다.
```

```
입력: height = [4, 1, 1, 0, 2, 3]
출력: 8
설명: 왼쪽의 높이 4와 오른쪽의 높이 3 사이에 물이 고입니다.
각 위치별 고이는 양은 [0, 2, 2, 3, 1, 0]입니다.
총 8입니다.
```

```
입력: height = [1, 2, 3, 4]
출력: 0
설명: 오른쪽으로 갈수록 높아지므로 물을 막을 오른쪽 벽이 없습니다.
```

## 제약 조건

- `1 <= height.length <= 100,000`
- `0 <= height[i] <= 100,000`
- 시간 제한은 `O(n)` 풀이를 통과할 수 있는 수준입니다.
- 정답은 32-bit signed integer 범위 안에 들어옵니다.

## 풀이 접근법

### 핵심 아이디어

각 위치에 고이는 물의 양은 `min(왼쪽 최대 높이, 오른쪽 최대 높이) - 현재 높이`입니다.  
그래서 DP 배열로 왼쪽 최대값과 오른쪽 최대값을 미리 구할 수 있습니다.

하지만 실제 코딩 테스트에서는 공간을 줄인 투 포인터 풀이도 자주 요구됩니다.  
왼쪽 최대 높이와 오른쪽 최대 높이 중 더 낮은 쪽이 현재 물 높이를 결정하므로, 낮은 쪽 포인터를 이동하면 됩니다.

### 단계별 풀이 과정

1. `left`를 배열 시작, `right`를 배열 끝에 둡니다.
2. `leftMax`와 `rightMax`를 각각 현재까지 본 왼쪽, 오른쪽 최대 높이로 관리합니다.
3. `height[left] < height[right]`이면 왼쪽 위치의 물 양은 `leftMax`로 결정됩니다.
4. 반대로 `height[right] <= height[left]`이면 오른쪽 위치의 물 양은 `rightMax`로 결정됩니다.
5. 각 위치에서 현재 높이가 최대 높이보다 낮으면 차이만큼 물을 더합니다.
6. 두 포인터가 만날 때까지 반복합니다.

## 코드 풀이

### Python
```python
from typing import List


def trap(height: List[int]) -> int:
    n = len(height)
    if n < 3:
        return 0

    left = 0
    right = n - 1

    left_max = 0
    right_max = 0
    water = 0

    while left < right:
        if height[left] < height[right]:
            # 왼쪽이 더 낮으면 왼쪽의 물 높이는 left_max가 결정한다.
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            # 오른쪽이 더 낮거나 같으면 오른쪽의 물 높이는 right_max가 결정한다.
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1

    return water


# 예시 실행
print(trap([0, 3, 0, 2, 0, 4]))      # 7
print(trap([4, 1, 1, 0, 2, 3]))      # 8
print(trap([1, 2, 3, 4]))            # 0
```

### JavaScript
```javascript
function trap(height) {
  const n = height.length;
  if (n < 3) return 0;

  let left = 0;
  let right = n - 1;

  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      // 왼쪽이 더 낮으면 왼쪽의 물 높이는 leftMax가 결정한다.
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      // 오른쪽이 더 낮거나 같으면 오른쪽의 물 높이는 rightMax가 결정한다.
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }

  return water;
}

// 예시 실행
console.log(trap([0, 3, 0, 2, 0, 4])); // 7
console.log(trap([4, 1, 1, 0, 2, 3])); // 8
console.log(trap([1, 2, 3, 4]));       // 0
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 각 포인터가 배열을 한 번씩만 지나갑니다.
- **공간 복잡도**: O(1) — 추가 배열 없이 변수 몇 개만 사용합니다.

## 틀리기 쉬운 포인트

- `leftMax`와 `rightMax`를 갱신하기 전에 물을 더하면 음수가 나올 수 있습니다.
- `height[left] == height[right]`일 때 어느 쪽을 움직여도 되지만, 한쪽으로 일관되게 처리해야 합니다.
- 배열 길이가 3보다 작으면 물이 고일 수 없습니다.

## 유사 문제 패턴

- **양쪽 조건 중 더 작은 값이 결과를 결정하는 문제**: 예를 들어 두 벽 사이의 최대 물 용량 문제에 투 포인터를 사용할 수 있습니다.
- **왼쪽 최대값과 오른쪽 최대값을 함께 보는 문제**: DP 배열로 각 위치의 주변 정보를 미리 계산하는 패턴입니다.
- **배열을 한 번만 훑으며 상태를 갱신하는 문제**: 최대값, 최소값, 누적 조건을 관리하는 실무형 코딩 테스트 문제에 자주 나옵니다.