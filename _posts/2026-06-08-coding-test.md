---
title: "[코딩 테스트] 2026-06-08 — 빗물 담기"
date: 2026-06-08 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, greedy]
---
## 오늘의 문제 선정 이유
> 물류 최적화와 알고리즘 자동화 트렌드에 맞춰, 배열과 greedy 판단을 함께 연습할 수 있는 two-pointer 유형을 선택했습니다.

## 문제 설명

한 회사는 서버 냉각용 물 저장 장치를 설계하고 있습니다.

가로로 일렬 배치된 `n`개의 기둥이 있습니다.  
각 기둥의 높이는 `heights[i]`입니다.

두 개의 기둥을 선택하면, 두 기둥 사이에 물을 담을 수 있습니다.  
담을 수 있는 물의 양은 다음과 같습니다.

- 두 기둥 중 더 낮은 높이
- 두 기둥 사이의 거리
- 위 두 값을 곱한 값

즉, `i < j`인 두 기둥을 선택했을 때 물의 양은 다음과 같습니다.

```text
min(heights[i], heights[j]) * (j - i)
```

가장 많은 물을 담을 수 있는 두 기둥을 선택했을 때의 최대 물의 양을 구하세요.

## 입출력 예시

```
입력: heights = [2, 3, 4, 5, 18, 17, 6]
출력: 17
설명: 높이 18인 기둥과 높이 17인 기둥을 선택하면 거리 1, 최소 높이 17이므로 17만큼 담을 수 있습니다.
```

```
입력: heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
출력: 49
설명: 높이 8인 1번 기둥과 높이 7인 8번 기둥을 선택하면 거리 7, 최소 높이 7이므로 49만큼 담을 수 있습니다.
```

```
입력: heights = [5, 5, 5, 5]
출력: 15
설명: 양 끝 기둥을 선택하면 거리 3, 최소 높이 5이므로 15만큼 담을 수 있습니다.
```

## 제약 조건

- `2 <= heights.length <= 100,000`
- `0 <= heights[i] <= 10,000`
- 시간 제한은 `O(n)` 풀이를 요구한다고 가정합니다.
- 입력 배열은 정수로만 구성됩니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 모든 기둥 쌍을 확인하면 `O(n^2)`이 되어 비효율적입니다.  
가장 넓은 거리에서 시작한 뒤, 더 낮은 기둥 쪽 포인터를 움직이는 greedy 방식이 적합합니다.  
물의 높이는 두 기둥 중 낮은 쪽이 결정하므로, 높은 쪽을 움직여도 더 나은 답을 만들 가능성이 낮습니다.

### 단계별 풀이 과정

1. 왼쪽 포인터 `left`를 `0`, 오른쪽 포인터 `right`를 `n - 1`로 둡니다.
2. 현재 두 기둥으로 담을 수 있는 물의 양을 계산합니다.
3. 최대값 `answer`를 갱신합니다.
4. `heights[left] < heights[right]`이면 `left`를 오른쪽으로 이동합니다.
5. 그렇지 않으면 `right`를 왼쪽으로 이동합니다.
6. `left < right`인 동안 반복합니다.

## 코드 풀이

### Python
```python
from typing import List

def max_water_container(heights: List[int]) -> int:
    left = 0
    right = len(heights) - 1
    answer = 0

    while left < right:
        width = right - left
        height = min(heights[left], heights[right])
        water = width * height

        answer = max(answer, water)

        # 낮은 기둥이 물 높이를 제한한다.
        # 따라서 낮은 쪽을 움직여야 더 큰 높이를 기대할 수 있다.
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1

    return answer


# 예시 실행
print(max_water_container([2, 3, 4, 5, 18, 17, 6]))  # 17
print(max_water_container([1, 8, 6, 2, 5, 4, 8, 3, 7]))  # 49
print(max_water_container([5, 5, 5, 5]))  # 15
```

### JavaScript
```javascript
function maxWaterContainer(heights) {
  let left = 0;
  let right = heights.length - 1;
  let answer = 0;

  while (left < right) {
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    const water = width * height;

    answer = Math.max(answer, water);

    // 낮은 기둥이 물 높이를 제한한다.
    // 따라서 낮은 쪽을 움직여야 더 큰 높이를 기대할 수 있다.
    if (heights[left] < heights[right]) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return answer;
}

// 예시 실행
console.log(maxWaterContainer([2, 3, 4, 5, 18, 17, 6])); // 17
console.log(maxWaterContainer([1, 8, 6, 2, 5, 4, 8, 3, 7])); // 49
console.log(maxWaterContainer([5, 5, 5, 5])); // 15
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 각 포인터는 배열을 한 번씩만 이동합니다.
- **공간 복잡도**: O(1) — 추가 배열 없이 상수 개의 변수만 사용합니다.

## 틀리기 쉬운 포인트

- 낮은 기둥이 아니라 높은 기둥 쪽 포인터를 움직이면 최적해를 놓칠 수 있습니다.
- 넓이 계산에서 `right - left`를 사용해야 합니다. `right - left + 1`이 아닙니다.
- 높이가 `0`인 기둥이 포함될 수 있으므로, 물의 양이 `0`인 경우도 처리해야 합니다.

## 유사 문제 패턴

- 정렬된 배열에서 두 수의 합 찾기: 양 끝 포인터를 좁히며 조건을 만족하는 쌍을 찾습니다.
- 삼각형 둘레 최대화: 후보를 줄이는 greedy 판단이 중요합니다.
- 최소 차이 쌍 찾기: 두 배열 또는 정렬 배열에서 포인터를 이동하며 최적값을 갱신합니다.