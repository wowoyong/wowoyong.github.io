---
title: "[코딩 테스트] 2026-03-12 — 회전 정렬 배열 탐색"
date: 2026-03-12 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array]
---
## 오늘의 문제 선정 이유
> 대용량 데이터와 빠른 조회에 대한 관심이 큰 시점이라, 실무 코딩 테스트에서도 자주 나오는 O(log n) 탐색 유형을 다루기 좋습니다.

## 문제 설명

물류 이벤트 로그 ID가 오름차순으로 정렬되어 있었는데, 시스템 배포 후 한 번 잘린 뒤 이어 붙는 형태로 저장되었습니다.  
즉, 원래는 오름차순 정렬 배열이었지만, 어떤 인덱스를 기준으로 한 번 회전된 상태입니다.

정수 배열 `nums`와 정수 `target`이 주어질 때, `target`의 인덱스를 반환하세요.  
배열에 `target`이 없으면 `-1`을 반환하세요.

단, 전체 알고리즘의 시간 복잡도는 `O(log n)`이어야 합니다.

배열의 모든 값은 서로 다릅니다.

## 입출력 예시

```text
입력: nums = [42, 57, 63, 71, 5, 9, 14, 28], target = 9
출력: 5
설명: 배열은 [5, 9, 14, 28, 42, 57, 63, 71] 이 한 번 회전된 형태이고, 9의 인덱스는 5입니다.
```

```text
입력: nums = [30, 40, 50, 5, 10, 20], target = 35
출력: -1
설명: 35는 배열에 존재하지 않습니다.
```

```text
입력: nums = [7], target = 7
출력: 0
설명: 원소가 하나뿐인 경우도 처리해야 합니다.
```

## 제약 조건

- `1 <= nums.length <= 200000`
- `-10^9 <= nums[i] <= 10^9`
- `nums`의 모든 원소는 서로 다름
- `-10^9 <= target <= 10^9`
- 시간 제한: `O(log n)` 풀이 통과 가능 수준

## 풀이 접근법

### 핵심 아이디어
이 문제는 단순 이진 탐색처럼 보이지만, 배열이 회전되어 있어서 전체가 정렬되어 있지는 않습니다.  
대신 매 단계에서 `mid`를 기준으로 보면, 왼쪽 구간 또는 오른쪽 구간 중 하나는 반드시 정렬되어 있습니다. 이 성질을 이용하면 절반씩 버리면서 `O(log n)`으로 찾을 수 있습니다.

### 단계별 풀이 과정
1. `left`, `right`를 두고 일반적인 이진 탐색처럼 시작합니다.
2. `mid`를 구한 뒤, `nums[mid] == target`이면 바로 반환합니다.
3. `nums[left] <= nums[mid]`라면 왼쪽 구간이 정렬된 상태입니다.
4. 이때 `target`이 `nums[left]` 이상 `nums[mid]` 미만이면 왼쪽으로 갑니다. 아니면 오른쪽으로 갑니다.
5. 반대로 왼쪽이 정렬되지 않았다면 오른쪽 구간이 정렬된 상태입니다.
6. 이 경우 `target`이 `nums[mid]` 초과 `nums[right]` 이하이면 오른쪽으로 갑니다. 아니면 왼쪽으로 갑니다.
7. 탐색이 끝날 때까지 반복하고, 찾지 못하면 `-1`을 반환합니다.

## 코드 풀이

### Python
```python
def search_rotated_array(nums, target):
    left = 0
    right = len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid

        # 왼쪽 구간이 정렬된 경우
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # 오른쪽 구간이 정렬된 경우
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1


# 예시 실행
print(search_rotated_array([42, 57, 63, 71, 5, 9, 14, 28], 9))   # 5
print(search_rotated_array([30, 40, 50, 5, 10, 20], 35))         # -1
print(search_rotated_array([7], 7))                               # 0
```

### JavaScript
```javascript
function searchRotatedArray(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) {
      return mid;
    }

    // 왼쪽 구간이 정렬된 경우
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } 
    // 오른쪽 구간이 정렬된 경우
    else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}

// 예시 실행
console.log(searchRotatedArray([42, 57, 63, 71, 5, 9, 14, 28], 9)); // 5
console.log(searchRotatedArray([30, 40, 50, 5, 10, 20], 35));       // -1
console.log(searchRotatedArray([7], 7));                            // 0
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(log n)` — 매 단계에서 탐색 범위를 절반으로 줄입니다.
- **공간 복잡도**: `O(1)` — 추가 배열이나 재귀 호출 없이 포인터 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `nums[left] <= nums[mid]`처럼 등호를 빼먹으면 원소가 2개 이하일 때 분기 판단이 꼬일 수 있습니다.
- 범위 비교에서 `target < nums[mid]`, `target <= nums[right]` 같은 경계를 잘못 쓰면 정답을 놓칩니다.
- 회전되지 않은 배열도 들어올 수 있습니다. 이 경우도 같은 로직으로 정상 처리되어야 합니다.

## 유사 문제 패턴

- 회전 정렬 배열에서 최솟값 찾기: 어느 구간이 정렬되어 있는지 판단하는 방식이 같습니다.
- 정렬 배열에서 조건을 만족하는 첫 위치 찾기: 이진 탐색으로 답의 범위를 줄이는 연습에 좋습니다.
- 산 모양 배열 탐색: 전체는 정렬이 아니지만, 구간의 성질을 이용해 `O(log n)`으로 줄여 나간다는 점이 비슷합니다.