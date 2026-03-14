---
title: "[코딩 테스트] 2026-03-14 — Three Sum"
date: 2026-03-14 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, sort]
---
## 오늘의 문제 선정 이유
> 추천 시스템, 학습 로드맵, 대규모 데이터 처리처럼 값의 조합을 빠르게 찾는 문제가 다시 주목받고 있어서 Three Sum 유형을 선택했다.

## 문제 설명

온라인 학습 플랫폼에서 수강 난이도 점수를 분석하고 있다.  
각 강의에는 음수, 0, 양수로 이루어진 정수 점수가 하나씩 붙어 있다.  
세 강의를 묶었을 때 난이도 점수의 합이 정확히 0이면, 초급-중급-고급 균형이 잘 맞는 추천 세트로 본다.

정수 배열 `nums`가 주어질 때, 합이 0이 되는 서로 다른 세 수의 조합을 모두 구하라.

조건은 다음과 같다.

- 같은 인덱스를 두 번 사용할 수 없다.
- 결과에는 중복된 조합이 없어야 한다.
- 각 조합 내부의 숫자 순서는 오름차순이어야 한다.
- 전체 결과의 순서는 자유다.

## 입출력 예시

```text
입력: nums = [-4, -1, -1, 0, 1, 2]
출력: [[-1, -1, 2], [-1, 0, 1]]
설명: 세 수의 합이 0이 되는 조합은 두 개이며, 중복 없이 반환한다.
```

```text
입력: nums = [-2, 0, 0, 2, 2]
출력: [[-2, 0, 2]]
설명: 0과 2가 여러 번 있어도 같은 값 조합은 한 번만 포함한다.
```

```text
입력: nums = [1, 2, -2, -1]
출력: []
설명: 어떤 세 수를 골라도 합이 0이 되지 않는다.
```

## 제약 조건

- `3 <= nums.length <= 3000`
- `-100000 <= nums[i] <= 100000`
- 시간 제한: 일반적인 코딩 테스트 기준 1초~2초
- 정답 조합 수는 중복 제거 후 최대 `10^4`개 이하로 가정

## 풀이 접근법

### 핵심 아이디어
이 문제는 세 수를 모두 고르면 `O(N^3)`이 되어 비효율적이다.  
배열을 정렬한 뒤, 첫 번째 수를 하나 고정하고 나머지 두 수는 `two-pointer`로 찾으면 `O(N^2)`로 줄일 수 있다.  
정렬 상태에서는 합이 작으면 왼쪽 포인터를 늘리고, 합이 크면 오른쪽 포인터를 줄이는 방식이 자연스럽게 동작한다.

### 단계별 풀이 과정
1. 배열 `nums`를 오름차순으로 정렬한다.
2. 인덱스 `i`를 첫 번째 수로 하나씩 고정한다.
3. 중복 조합을 막기 위해 `nums[i]`가 이전 값과 같으면 건너뛴다.
4. `left = i + 1`, `right = len(nums) - 1`로 두 포인터를 둔다.
5. 세 수의 합 `total = nums[i] + nums[left] + nums[right]`를 계산한다.
6. `total == 0`이면 정답에 추가하고, `left`와 `right`를 이동시키면서 같은 값은 건너뛴다.
7. `total < 0`이면 합을 키워야 하므로 `left += 1` 한다.
8. `total > 0`이면 합을 줄여야 하므로 `right -= 1` 한다.
9. 모든 `i`에 대해 반복한 뒤 결과를 반환한다.

## 코드 풀이

### Python
```python
def three_sum(nums):
    nums.sort()
    result = []
    n = len(nums)

    for i in range(n - 2):
        # 첫 번째 수의 중복 제거
        if i > 0 and nums[i] == nums[i - 1]:
            continue

        left = i + 1
        right = n - 1

        while left < right:
            total = nums[i] + nums[left] + nums[right]

            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1

                # 두 번째 수의 중복 제거
                while left < right and nums[left] == nums[left - 1]:
                    left += 1

                # 세 번째 수의 중복 제거
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1

            elif total < 0:
                left += 1
            else:
                right -= 1

    return result


# 예시 실행
nums = [-4, -1, -1, 0, 1, 2]
print(three_sum(nums))  # [[-1, -1, 2], [-1, 0, 1]]
```

### JavaScript
```javascript
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const n = nums.length;

  for (let i = 0; i < n - 2; i++) {
    // 첫 번째 수의 중복 제거
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    while (left < right) {
      const total = nums[i] + nums[left] + nums[right];

      if (total === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        left++;
        right--;

        // 두 번째 수의 중복 제거
        while (left < right && nums[left] === nums[left - 1]) {
          left++;
        }

        // 세 번째 수의 중복 제거
        while (left < right && nums[right] === nums[right + 1]) {
          right--;
        }
      } else if (total < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// 예시 실행
const nums = [-4, -1, -1, 0, 1, 2];
console.log(threeSum(nums)); // [ [ -1, -1, 2 ], [ -1, 0, 1 ] ]
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(N^2)` — 정렬 후 각 원소마다 two-pointer로 한 번씩 훑는다.
- **공간 복잡도**: `O(1)` 또는 `O(log N)` — 정렬 방식에 따른 보조 공간을 제외하면 추가 자료구조를 거의 쓰지 않는다.

## 틀리기 쉬운 포인트

- 정답을 찾은 뒤 `left`, `right`를 한 칸만 움직이고 끝내면 중복 조합이 그대로 들어간다.
- `nums[i]`의 중복 제거를 하지 않으면 같은 시작값으로 같은 조합을 여러 번 만든다.
- 정렬하지 않고 two-pointer를 쓰면 합이 커질지 작아질지 판단할 수 없다.

## 유사 문제 패턴

- `Two Sum in Sorted Array`: 정렬된 배열에서 두 수의 합을 찾는 기본 two-pointer 문제다.
- `3Sum Closest`: 합이 0이 아니라 목표값에 가장 가까운 세 수를 찾는 변형이다.
- `4Sum`: 하나를 더 고정한 뒤 나머지를 줄여 가는 방식으로 확장할 수 있다.