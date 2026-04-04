---
title: "[코딩 테스트] 2026-04-04 — Three Sum"
date: 2026-04-04 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, sort]
---
## 오늘의 문제 선정 이유
> 추천 시스템, 피드 필터링, 로그 이상 탐지처럼 "여러 값의 균형 조합"을 찾는 문제가 다시 주목받고 있어서 Three Sum을 선택했습니다.

## 문제 설명

동영상 추천 시스템의 품질 점검을 위해, 각 콘텐츠에 대한 `impact score`가 정수 배열로 주어집니다.

- 양수는 사용자 몰입도를 높이는 요소입니다.
- 음수는 이탈 가능성을 높이는 요소입니다.
- 0은 중립 요소입니다.

품질 팀은 세 콘텐츠를 묶었을 때 전체 영향력이 정확히 `0`이 되는 조합을 찾고 싶습니다.  
서로 다른 세 인덱스를 사용해야 하며, 같은 값이 여러 번 있어도 실제로 배열에 존재하는 개수만큼만 사용할 수 있습니다.

배열 `scores`가 주어질 때, 합이 `0`이 되는 모든 서로 다른 세 수 조합을 반환하세요.

반환할 때는 다음 조건을 만족해야 합니다.

- 각 조합은 오름차순이어야 합니다.
- 결과 전체에는 중복 조합이 없어야 합니다.
- 결과 조합의 순서는 자유입니다.

## 입출력 예시

```text
입력: scores = [-4, -1, -1, 0, 1, 2]
출력: [[-1, -1, 2], [-1, 0, 1]]
설명: 세 수의 합이 0이 되는 서로 다른 조합은 두 개입니다.
```

```text
입력: scores = [-2, 0, 0, 2, 2]
출력: [[-2, 0, 2]]
설명: [ -2, 0, 2 ]는 여러 인덱스로 만들 수 있지만, 결과에는 한 번만 포함합니다.
```

```text
입력: scores = [1, 2, -2, -1]
출력: []
설명: 어떤 세 수를 골라도 합이 0이 되지 않습니다.
```

## 제약 조건

- `3 <= len(scores) <= 3000`
- `-100000 <= scores[i] <= 100000`
- 시간 제한: `O(n^2)` 이하 풀이 권장
- 같은 숫자가 여러 번 등장할 수 있음
- 정답 조합 수는 최대 `10^4`개 이하로 가정

## 풀이 접근법

### 핵심 아이디어
이 문제는 세 수를 전부 고르면 `O(n^3)`이라 너무 느립니다.  
정렬을 먼저 하면, 한 숫자를 고정한 뒤 나머지 두 수는 `two-pointer`로 합을 줄이거나 늘리며 `O(n)`에 찾을 수 있습니다. 그래서 전체를 `O(n^2)`로 줄일 수 있습니다.

### 단계별 풀이 과정
1. 배열을 오름차순으로 정렬합니다.
2. `i`를 왼쪽부터 순회하며 첫 번째 수를 고정합니다.
3. 같은 값이 연속으로 나오면 중복 조합이 생기므로, 이전 값과 같으면 건너뜁니다.
4. `left = i + 1`, `right = n - 1`로 두 포인터를 둡니다.
5. `scores[i] + scores[left] + scores[right]`를 계산합니다.
6. 합이 `0`이면 정답에 추가하고, `left`와 `right`를 모두 이동합니다.
7. 이때 `left`와 `right`도 같은 값이 반복되면 중복을 건너뜁니다.
8. 합이 `0`보다 작으면 더 큰 값이 필요하므로 `left += 1` 합니다.
9. 합이 `0`보다 크면 더 작은 값이 필요하므로 `right -= 1` 합니다.

## 코드 풀이

### Python
```python
from typing import List

def find_zero_triplets(scores: List[int]) -> List[List[int]]:
    scores.sort()
    n = len(scores)
    result = []

    for i in range(n - 2):
        # 첫 번째 수 중복 제거
        if i > 0 and scores[i] == scores[i - 1]:
            continue

        left = i + 1
        right = n - 1

        while left < right:
            total = scores[i] + scores[left] + scores[right]

            if total == 0:
                result.append([scores[i], scores[left], scores[right]])
                left += 1
                right -= 1

                # 두 번째 수 중복 제거
                while left < right and scores[left] == scores[left - 1]:
                    left += 1

                # 세 번째 수 중복 제거
                while left < right and scores[right] == scores[right + 1]:
                    right -= 1

            elif total < 0:
                left += 1
            else:
                right -= 1

    return result


# 예시 실행
if __name__ == "__main__":
    print(find_zero_triplets([-4, -1, -1, 0, 1, 2]))
    print(find_zero_triplets([-2, 0, 0, 2, 2]))
    print(find_zero_triplets([1, 2, -2, -1]))
```

### JavaScript
```javascript
function findZeroTriplets(scores) {
  scores.sort((a, b) => a - b);
  const result = [];
  const n = scores.length;

  for (let i = 0; i < n - 2; i++) {
    // 첫 번째 수 중복 제거
    if (i > 0 && scores[i] === scores[i - 1]) {
      continue;
    }

    let left = i + 1;
    let right = n - 1;

    while (left < right) {
      const total = scores[i] + scores[left] + scores[right];

      if (total === 0) {
        result.push([scores[i], scores[left], scores[right]]);
        left++;
        right--;

        // 두 번째 수 중복 제거
        while (left < right && scores[left] === scores[left - 1]) {
          left++;
        }

        // 세 번째 수 중복 제거
        while (left < right && scores[right] === scores[right + 1]) {
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
console.log(findZeroTriplets([-4, -1, -1, 0, 1, 2]));
console.log(findZeroTriplets([-2, 0, 0, 2, 2]));
console.log(findZeroTriplets([1, 2, -2, -1]));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n^2) — 정렬 후 각 인덱스마다 two-pointer를 한 번씩 수행하기 때문
- **공간 복잡도**: O(1) — 정답 저장 공간을 제외하면 추가 포인터 변수만 사용하기 때문

## 틀리기 쉬운 포인트

- 정답을 찾은 뒤 `left`, `right`의 중복 값을 건너뛰지 않으면 같은 조합이 여러 번 들어갑니다.
- `i` 자체의 중복도 제거해야 합니다. 이것을 빼먹으면 첫 번째 숫자가 같은 조합이 반복됩니다.
- 정렬하지 않고 two-pointer를 쓰면 합이 작을 때 `left`를 늘리고, 클 때 `right`를 줄이는 근거가 사라집니다.

## 유사 문제 패턴

- **Two Sum in sorted array**: 정렬된 배열에서 두 수의 합을 찾습니다. two-pointer의 가장 기본 형태입니다.
- **3Sum Closest**: 합이 정확히 0이 아니라, 목표값에 가장 가까운 세 수의 합을 찾습니다.
- **4Sum**: 한 수를 더 고정해서 네 수의 합을 찾는 문제입니다. 정렬과 중복 제거 패턴이 그대로 확장됩니다.