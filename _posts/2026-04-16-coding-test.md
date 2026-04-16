---
title: "[코딩 테스트] 2026-04-16 — 빗물 트래핑"
date: 2026-04-16 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, dp, stack]
---
## 오늘의 문제 선정 이유
> AI, 대규모 서비스, 인프라처럼 "자원을 어디에 얼마나 담을 수 있는가"를 계산하는 사고가 중요해서 오늘은 빗물 트래핑을 골랐습니다.

## 문제 설명

한 개발팀이 서버 랙 높이를 1차원 배열로 관리하고 있습니다.  
각 칸의 값은 해당 위치의 랙 높이입니다. 비가 내린 뒤, 낮은 구간에는 양옆의 더 높은 랙 때문에 물이 고일 수 있습니다.

길이 `N`의 정수 배열 `heights`가 주어질 때, 전체 지형에 고일 수 있는 빗물의 총량을 구하세요.

단, 각 칸에 고이는 물의 양은 다음 조건을 따릅니다.

- 현재 칸의 왼쪽에서 가장 높은 높이
- 현재 칸의 오른쪽에서 가장 높은 높이

이 둘 중 더 낮은 높이까지만 물이 찰 수 있습니다.

즉, `i`번 칸에 고이는 물의 양은 아래와 같습니다.

`min(leftMax[i], rightMax[i]) - heights[i]`

음수가 되면 0으로 처리합니다.

## 입출력 예시

```text
입력: heights = [0,3,0,2,0,4]
출력: 7
설명:
각 칸에 고이는 물의 양은 [0,0,3,1,3,0] 이므로 총합은 7입니다.
```

```text
입력: heights = [4,1,2,0,3]
출력: 6
설명:
각 칸에 고이는 물의 양은 [0,2,1,3,0] 이므로 총합은 6입니다.
```

```text
입력: heights = [1,2,3,4]
출력: 0
설명:
오름차순 지형이라 물이 고일 수 없습니다.
```

## 제약 조건

- `1 <= N <= 200,000`
- `0 <= heights[i] <= 1,000,000`
- 시간 제한: 1초~2초 수준
- 정답은 32비트 정수 범위를 넘지 않는다고 가정

## 풀이 접근법

### 핵심 아이디어
이 문제는 각 칸에서 "왼쪽 최고 높이"와 "오른쪽 최고 높이"만 알면 풀 수 있습니다.  
가장 먼저 떠올리기 쉬운 방법은 `leftMax`, `rightMax` 배열을 미리 만들어 두는 DP 방식입니다. 직관적이고 구현도 쉽습니다.

하지만 실무 코딩 테스트에서는 공간까지 줄이는 풀이를 자주 묻습니다.  
투 포인터를 쓰면 양끝에서 가운데로 좁혀 가면서 O(1) 추가 공간으로 같은 답을 구할 수 있습니다. 이번 풀이 코드는 투 포인터 기준으로 작성합니다.

### 단계별 풀이 과정
1. `left`, `right` 포인터를 배열의 양끝에 둡니다.
2. `leftMax`, `rightMax`에 지금까지 본 왼쪽 최대 높이, 오른쪽 최대 높이를 저장합니다.
3. `heights[left]`와 `heights[right]`를 비교합니다.
4. 더 낮은 쪽은 반대편에 더 높은 벽이 있다고 볼 수 있으므로, 그쪽 물의 양을 바로 계산할 수 있습니다.
5. 현재 높이가 최대 높이보다 낮으면 `maxHeight - currentHeight`만큼 물을 더합니다.
6. 해당 포인터를 안쪽으로 이동합니다.
7. `left < right` 동안 반복합니다.

## 코드 풀이

### Python
```python
def trap_rain_water(heights):
    n = len(heights)
    if n < 3:
        return 0

    left = 0
    right = n - 1
    leftMax = 0
    rightMax = 0
    water = 0

    while left < right:
        # 더 낮은 쪽은 반대편에 자신보다 높은 벽이 있다고 볼 수 있다.
        if heights[left] <= heights[right]:
            if heights[left] >= leftMax:
                leftMax = heights[left]
            else:
                water += leftMax - heights[left]
            left += 1
        else:
            if heights[right] >= rightMax:
                rightMax = heights[right]
            else:
                water += rightMax - heights[right]
            right -= 1

    return water


# 실행 예시
if __name__ == "__main__":
    print(trap_rain_water([0, 3, 0, 2, 0, 4]))  # 7
    print(trap_rain_water([4, 1, 2, 0, 3]))     # 6
    print(trap_rain_water([1, 2, 3, 4]))        # 0
```

### JavaScript
```javascript
function trapRainWater(heights) {
  const n = heights.length;
  if (n < 3) return 0;

  let left = 0;
  let right = n - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    // 더 낮은 쪽은 반대편 경계가 충분하다고 판단할 수 있다.
    if (heights[left] <= heights[right]) {
      if (heights[left] >= leftMax) {
        leftMax = heights[left];
      } else {
        water += leftMax - heights[left];
      }
      left += 1;
    } else {
      if (heights[right] >= rightMax) {
        rightMax = heights[right];
      } else {
        water += rightMax - heights[right];
      }
      right -= 1;
    }
  }

  return water;
}

// 실행 예시
console.log(trapRainWater([0, 3, 0, 2, 0, 4])); // 7
console.log(trapRainWater([4, 1, 2, 0, 3]));    // 6
console.log(trapRainWater([1, 2, 3, 4]));       // 0
```

## 시간·공간 복잡도

- **시간 복잡도**: O(N) — 양쪽 포인터가 배열을 한 번씩만 훑습니다.
- **공간 복잡도**: O(1) — 추가 배열 없이 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `min(leftMax, rightMax) - heights[i]`가 음수가 될 수 있다는 점을 놓치면 안 됩니다.
- 투 포인터에서는 항상 "더 낮은 쪽"을 먼저 처리해야 합니다. 높은 쪽을 먼저 처리하면 아직 물 높이를 확정할 수 없습니다.
- 길이가 2 이하인 배열은 물이 고일 수 없습니다. 초기에 바로 0을 반환하면 안전합니다.

## 유사 문제 패턴

- 구간 최대값을 이용해 각 위치의 결과를 계산하는 문제  
예: 왼쪽 최대, 오른쪽 최대를 미리 구해 조건을 계산하는 배열 문제

- 양끝에서 좁혀 오며 조건을 만족시키는 투 포인터 문제  
예: 컨테이너 최대 넓이, 정렬 배열의 쌍 찾기

- "현재 상태를 확정할 수 있는 쪽부터 처리"하는 문제  
예: monotonic stack, two-pointer, prefix/suffix 배열을 활용하는 지형 계산 문제

---

추가로 정리하면, 이 문제는 두 방식으로 자주 출제됩니다.

- DP 방식: `leftMax[]`, `rightMax[]`를 만들어 각 칸 물 높이를 계산
- 투 포인터 방식: 공간을 줄이면서 같은 결과 계산

코딩 테스트에서는 먼저 DP 아이디어를 떠올리고, 그다음 투 포인터로 최적화까지 설명하면 좋은 평가를 받습니다.