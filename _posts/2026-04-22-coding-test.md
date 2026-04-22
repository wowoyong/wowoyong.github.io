---
title: "[코딩 테스트] 2026-04-22 — 피크 원소 찾기"
date: 2026-04-22 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, dp, binary-search]
---
## 오늘의 문제 선정 이유
> 데이터가 많아질수록 전체를 다 보지 않고 답을 찾는 O(log n) 탐색이 중요해지기 때문에, 오늘은 배열과 binary search를 함께 연습할 수 있는 피크 원소 찾기를 선택했습니다.

## 문제 설명

동영상 추천 점수, 서버 부하 지표, 사용자 반응 수치처럼 시간 순서대로 기록된 정수 배열 `scores`가 주어집니다.

배열에서 피크 원소는 다음 조건을 만족하는 인덱스 `i`입니다.

- `scores[i]`는 인접한 원소보다 크다.
- 즉,
  - `i == 0`이면 `scores[i] > scores[i + 1]`
  - `i == n - 1`이면 `scores[i] > scores[i - 1]`
  - 그 외에는 `scores[i] > scores[i - 1]` 이고 `scores[i] > scores[i + 1]`

배열의 모든 인접한 두 값은 서로 다릅니다.

피크 원소의 인덱스 하나를 반환하세요. 피크가 여러 개라면 아무 인덱스나 반환해도 됩니다.

단, 시간 복잡도는 `O(log n)`이어야 합니다.

## 입출력 예시

```text
입력: scores = [3, 5, 9, 7, 4]
출력: 2
설명: scores[2] = 9 이고, 양옆 값 5, 7보다 크므로 피크입니다.
```

```text
입력: scores = [1, 4, 6, 8, 7, 3, 2]
출력: 3
설명: scores[3] = 8 이고, 양옆 값 6, 7보다 크므로 피크입니다.
```

```text
입력: scores = [10, 7, 5, 3]
출력: 0
설명: 첫 번째 원소 10은 오른쪽 값 7보다 크므로 피크입니다.
```

```text
입력: scores = [2, 4, 6, 9]
출력: 3
설명: 마지막 원소 9는 왼쪽 값 6보다 크므로 피크입니다.
```

## 제약 조건

- `1 <= len(scores) <= 100000`
- `-10^9 <= scores[i] <= 10^9`
- `scores[i] != scores[i + 1]` for all valid `i`
- 시간 제한: `O(log n)` 풀이 통과 기준

## 풀이 접근법

### 핵심 아이디어
이 문제는 선형 탐색으로도 풀 수 있지만, 요구 조건이 `O(log n)`이므로 binary search를 써야 합니다. 핵심은 `mid`와 `mid + 1`을 비교했을 때, 오르막이면 오른쪽 구간에 반드시 피크가 있고, 내리막이면 왼쪽 구간에 반드시 피크가 있다는 점입니다.

### 단계별 풀이 과정
1. `left = 0`, `right = n - 1`로 시작합니다.
2. `mid = (left + right) // 2`를 구합니다.
3. `scores[mid] < scores[mid + 1]`이면 지금은 오르막입니다. 이 경우 피크는 오른쪽에 있으므로 `left = mid + 1`로 이동합니다.
4. 그렇지 않으면 내리막이거나 `mid` 자체가 피크 후보입니다. 이 경우 피크는 왼쪽 포함 구간에 있으므로 `right = mid`로 줄입니다.
5. `left == right`가 되면 그 위치가 피크 인덱스입니다.

## 코드 풀이

### Python
```python
def find_peak_index(scores):
    # 원소가 하나면 그 자체가 피크
    if len(scores) == 1:
        return 0

    left = 0
    right = len(scores) - 1

    # left와 right가 만날 때까지 탐색
    while left < right:
        mid = (left + right) // 2

        # mid보다 오른쪽 값이 더 크면 오르막
        # 피크는 반드시 오른쪽 구간에 존재
        if scores[mid] < scores[mid + 1]:
            left = mid + 1
        else:
            # 내리막이거나 mid가 피크 후보
            # 피크는 left ~ mid 구간 안에 존재
            right = mid

    return left


# 실행 예시
if __name__ == "__main__":
    print(find_peak_index([3, 5, 9, 7, 4]))       # 2
    print(find_peak_index([1, 4, 6, 8, 7, 3, 2])) # 3
    print(find_peak_index([10, 7, 5, 3]))         # 0
    print(find_peak_index([2, 4, 6, 9]))          # 3
```

### JavaScript
```javascript
function findPeakIndex(scores) {
  // 원소가 하나면 그 자체가 피크
  if (scores.length === 1) {
    return 0;
  }

  let left = 0;
  let right = scores.length - 1;

  // left와 right가 만날 때까지 탐색
  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    // mid보다 오른쪽 값이 더 크면 오르막
    // 피크는 반드시 오른쪽 구간에 존재
    if (scores[mid] < scores[mid + 1]) {
      left = mid + 1;
    } else {
      // 내리막이거나 mid가 피크 후보
      // 피크는 left ~ mid 구간 안에 존재
      right = mid;
    }
  }

  return left;
}

// 실행 예시
console.log(findPeakIndex([3, 5, 9, 7, 4]));       // 2
console.log(findPeakIndex([1, 4, 6, 8, 7, 3, 2])); // 3
console.log(findPeakIndex([10, 7, 5, 3]));         // 0
console.log(findPeakIndex([2, 4, 6, 9]));          // 3
```

## 시간·공간 복잡도

- **시간 복잡도**: O(log n) — 탐색 구간을 매 단계 절반으로 줄입니다.
- **공간 복잡도**: O(1) — 추가 배열이나 재귀 호출 없이 변수만 사용합니다.

## 틀리기 쉬운 포인트

`mid + 1`을 비교하므로 반복 조건은 `left < right`여야 합니다. 그래야 `mid`가 항상 `right`보다 작아서 범위를 벗어나지 않습니다.

`right = mid - 1`로 줄이면 답을 놓칠 수 있습니다. `mid` 자체가 피크일 수 있으므로 `right = mid`로 유지해야 합니다.

배열의 양 끝도 피크가 될 수 있습니다. 가운데 원소만 피크라고 생각하면 첫 번째나 마지막 원소가 답인 경우를 놓칩니다.

## 유사 문제 패턴

산 모양 배열에서 꼭대기 인덱스 찾기. 오르막과 내리막의 경계를 binary search로 찾는 방식이 같습니다.

조건을 만족하는 최소값 찾기. 예를 들어 처리 가능한 최소 시간, 최소 용량처럼 단조성이 있으면 범위를 반씩 줄일 수 있습니다.

회전 정렬 배열에서 최솟값 찾기. 구간의 특성을 보고 어느 쪽에 답이 있는지 판단하는 binary search 패턴이 그대로 이어집니다.

---