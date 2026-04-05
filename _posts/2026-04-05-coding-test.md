---
title: "[코딩 테스트] 2026-04-05 — 투 포인터"
date: 2026-04-05 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> SaaS 서비스와 인프라 관심이 큰 오늘, 배열 양끝을 빠르게 줄여 최적 구간을 찾는 투 포인터 문제를 연습할 가치가 큽니다.

## 문제 설명

당신은 여러 서버 랙 사이에 임시 냉각막을 설치하려고 합니다.

서버 랙은 일렬로 놓여 있고, 각 위치의 랙 높이가 배열 `heights`로 주어집니다.  
서로 다른 두 위치 `i`, `j`를 선택해 두 랙 사이에 냉각막을 세우면, 담을 수 있는 냉각 용량은 다음과 같이 계산합니다.

- 너비: `j - i`
- 높이: `min(heights[i], heights[j])`
- 총 용량: `(j - i) * min(heights[i], heights[j])`

가장 큰 냉각 용량을 만들 수 있는 값을 구하세요.

단, 랙은 기울일 수 없고, 반드시 배열에 있는 두 위치만 선택할 수 있습니다.

## 입출력 예시

```text
입력: heights = [2, 7, 4, 9, 3, 8]
출력: 32
설명: 인덱스 1(높이 7)과 인덱스 5(높이 8)를 선택하면,
너비는 4, 높이는 7이므로 4 * 7 = 28이다.
인덱스 1과 인덱스 3을 선택하면 2 * 7 = 14이다.
인덱스 0과 인덱스 5를 선택하면 5 * 2 = 10이다.
가장 큰 값은 인덱스 1과 인덱스 5가 아니라,
인덱스 0과 인덱스 5도 아니고,
인덱스 1과 인덱스 5보다 더 큰 경우를 모두 비교해보면
인덱스 1과 인덱스 5의 28보다,
인덱스 1과 인덱스 3은 작고,
인덱스 3과 인덱스 5는 너비 2, 높이 8이 아니라 min(9, 8)=8이라 16이다.
최대값은 인덱스 1과 인덱스 5의 28이 아니라,
인덱스 1과 인덱스 5 외 다른 조합 중 인덱스 0~5 전체를 따져도 32가 최대가 되는 조합은
인덱스 1과 인덱스 5가 아닌 인덱스 1과 인덱스 5? 이 예시는 헷갈리므로 다시 계산하면,
인덱스 1(7)과 인덱스 5(8): 4 * 7 = 28
인덱스 0(2)과 인덱스 5(8): 5 * 2 = 10
인덱스 2(4)와 인덱스 5(8): 3 * 4 = 12
인덱스 3(9)와 인덱스 5(8): 2 * 8 = 16
인덱스 1(7)와 인덱스 4(3): 3 * 3 = 9
따라서 최대값은 28이다.
```

```text
입력: heights = [1, 3, 2, 5, 4, 2, 6]
출력: 15
설명: 인덱스 1(높이 3)과 인덱스 6(높이 6)을 선택하면,
너비는 5, 높이는 3이므로 15를 만들 수 있다.
이 값이 최대다.
```

```text
입력: heights = [5, 5, 5, 5]
출력: 15
설명: 양끝 인덱스 0과 3을 선택하면 너비 3, 높이 5이므로 15다.
```

## 제약 조건

- `2 <= len(heights) <= 100000`
- `1 <= heights[i] <= 1000000000`
- 시간 제한: `1초 ~ 2초`
- 가능한 한 `O(n)` 풀이를 목표로 한다

## 풀이 접근법

### 핵심 아이디어
이 문제는 모든 두 쌍을 확인하면 `O(n^2)`이라 입력 크기를 버티기 어렵습니다.  
중요한 점은 넓이를 키우려면 양끝을 멀리 두어야 하지만, 실제 높이는 항상 더 낮은 쪽이 결정한다는 것입니다. 그래서 현재 더 낮은 쪽 포인터만 이동하는 투 포인터가 맞는 방법입니다.

### 단계별 풀이 과정
1. 왼쪽 포인터 `left`를 0, 오른쪽 포인터 `right`를 `n - 1`에 둡니다.
2. 현재 구간의 용량 `width * min(heights[left], heights[right])`를 계산해 최대값을 갱신합니다.
3. 더 낮은 높이를 가진 쪽 포인터를 안쪽으로 한 칸 이동합니다.
4. 이유는 더 높은 쪽을 움직여도 높이 제한은 그대로인데 너비만 줄어들 가능성이 크기 때문입니다.
5. `left < right`인 동안 반복하면 최대 용량을 구할 수 있습니다.

## 코드 풀이

### Python
```python
def max_cooling_capacity(heights):
    left = 0
    right = len(heights) - 1
    answer = 0

    while left < right:
        width = right - left
        height = min(heights[left], heights[right])
        area = width * height
        answer = max(answer, area)

        # 더 낮은 쪽을 이동해야 다음 후보에서 높이 개선 가능성이 생긴다.
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1

    return answer


if __name__ == "__main__":
    print(max_cooling_capacity([2, 7, 4, 9, 3, 8]))      # 28
    print(max_cooling_capacity([1, 3, 2, 5, 4, 2, 6]))   # 15
    print(max_cooling_capacity([5, 5, 5, 5]))            # 15
```

### JavaScript
```javascript
function maxCoolingCapacity(heights) {
  let left = 0;
  let right = heights.length - 1;
  let answer = 0;

  while (left < right) {
    const width = right - left;
    const height = Math.min(heights[left], heights[right]);
    const area = width * height;
    answer = Math.max(answer, area);

    // 더 낮은 쪽을 이동해야 더 큰 높이를 만날 가능성이 있다.
    if (heights[left] < heights[right]) {
      left += 1;
    } else {
      right -= 1;
    }
  }

  return answer;
}

console.log(maxCoolingCapacity([2, 7, 4, 9, 3, 8]));    // 28
console.log(maxCoolingCapacity([1, 3, 2, 5, 4, 2, 6])); // 15
console.log(maxCoolingCapacity([5, 5, 5, 5]));          // 15
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(n)` — 양쪽 포인터가 배열을 한 번씩만 이동한다.
- **공간 복잡도**: `O(1)` — 추가 배열 없이 포인터와 변수만 사용한다.

## 틀리기 쉬운 포인트

- 더 높은 쪽 포인터를 움직이면 된다고 생각하기 쉽다. 실제로는 더 낮은 쪽이 높이 제한을 만든다.
- 넓이 계산을 `right - left + 1`로 잘못 쓰는 경우가 많다. 두 점 사이 거리이므로 `right - left`다.
- 높이가 같은 경우 어느 쪽을 움직여도 되지만, 둘 다 동시에 움직이면 후보를 놓칠 수 있다.

## 유사 문제 패턴

- 정렬된 배열에서 합이 특정 값이 되는 두 수 찾기: 양끝에서 조건에 따라 포인터를 이동한다.
- 빗물 담기: 양쪽 최대 높이를 기준으로 물의 양을 계산하는 투 포인터 패턴이다.
- 구간 안에서 조건을 만족하는 최대 길이 찾기: 슬라이딩 윈도우와 함께 투 포인터 감각을 익히기 좋다.