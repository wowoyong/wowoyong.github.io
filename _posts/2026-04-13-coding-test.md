---
title: "[코딩 테스트] 2026-04-13 — 이진 탐색 기본"
date: 2026-04-13 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 대용량 데이터에서 빠르게 위치를 찾는 문제는 검색, 추천, 물류 시스템처럼 오늘 많이 다뤄지는 서비스에서도 자주 나옵니다.

## 문제 설명

정렬된 정수 배열 `versions`가 주어집니다. 각 값은 배포된 API 버전 번호입니다.  
운영팀은 특정 기준 버전 `target` 이상이 처음 배포된 위치를 빠르게 찾고 싶습니다.

배열에서 `target` 이상인 값이 처음 등장하는 인덱스를 구하세요.  
만약 그런 값이 없다면 `-1`을 반환하세요.

반드시 `O(log N)` 시간 복잡도로 해결해야 합니다.

## 입출력 예시

```text
입력: versions = [1, 3, 3, 5, 8, 10], target = 4
출력: 3
설명: 4 이상인 값은 5, 8, 10이고, 처음 등장하는 인덱스는 3입니다.
```

```text
입력: versions = [2, 4, 4, 4, 9], target = 4
출력: 1
설명: 4 이상인 값이 처음 나오는 위치는 인덱스 1입니다.
```

```text
입력: versions = [1, 2, 3], target = 7
출력: -1
설명: 7 이상인 값이 없으므로 -1을 반환합니다.
```

## 제약 조건

- `1 <= versions.length <= 100000`
- `-10^9 <= versions[i] <= 10^9`
- `versions`는 오름차순으로 정렬되어 있음
- `-10^9 <= target <= 10^9`
- 시간 제한: `1초`
- 추가 공간은 최소화할 것

## 풀이 접근법

### 핵심 아이디어
이 문제는 정렬된 배열에서 조건을 만족하는 첫 위치를 찾는 문제입니다.  
선형 탐색으로도 풀 수 있지만 `O(N)`이므로 비효율적입니다. 이진 탐색을 쓰면 `target` 이상이 처음 나오는 경계를 `O(log N)`에 찾을 수 있습니다.

### 단계별 풀이 과정
1. `left = 0`, `right = len(versions) - 1`로 시작합니다.
2. 중간값 `mid`를 구한 뒤, `versions[mid]`가 `target` 이상이면 정답 후보로 보고 더 왼쪽에 같은 조건이 있는지 확인합니다.
3. `versions[mid]`가 `target`보다 작으면 정답은 오른쪽에만 있으므로 `left = mid + 1`로 이동합니다.
4. 탐색이 끝난 뒤 저장한 후보 인덱스가 있으면 반환하고, 없으면 `-1`을 반환합니다.

## 코드 풀이

### Python
```python
def find_first_ge(versions, target):
    left = 0
    right = len(versions) - 1
    answer = -1

    while left <= right:
        mid = (left + right) // 2

        # target 이상을 찾았으면 일단 후보로 저장하고
        # 더 왼쪽에도 있는지 계속 탐색한다.
        if versions[mid] >= target:
            answer = mid
            right = mid - 1
        else:
            # 현재 값이 target보다 작으면 오른쪽만 보면 된다.
            left = mid + 1

    return answer


# 예시 실행
print(find_first_ge([1, 3, 3, 5, 8, 10], 4))  # 3
print(find_first_ge([2, 4, 4, 4, 9], 4))      # 1
print(find_first_ge([1, 2, 3], 7))            # -1
```

### JavaScript
```javascript
function findFirstGe(versions, target) {
  let left = 0;
  let right = versions.length - 1;
  let answer = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // target 이상이면 정답 후보로 저장하고
    // 더 왼쪽 구간을 계속 확인한다.
    if (versions[mid] >= target) {
      answer = mid;
      right = mid - 1;
    } else {
      // target보다 작으면 오른쪽 구간만 탐색한다.
      left = mid + 1;
    }
  }

  return answer;
}

// 예시 실행
console.log(findFirstGe([1, 3, 3, 5, 8, 10], 4)); // 3
console.log(findFirstGe([2, 4, 4, 4, 9], 4));     // 1
console.log(findFirstGe([1, 2, 3], 7));           // -1
```

## 시간·공간 복잡도

- **시간 복잡도**: `O(log N)` — 탐색 범위를 매번 절반으로 줄입니다.
- **공간 복잡도**: `O(1)` — 추가 배열 없이 변수만 사용합니다.

## 틀리기 쉬운 포인트

- 값을 찾자마자 바로 반환하면 안 됩니다. 이 문제는 `처음 등장하는 위치`를 구해야 합니다.
- `while left <= right`와 `right = mid - 1`, `left = mid + 1`의 조합을 정확히 맞춰야 무한 루프를 피할 수 있습니다.
- 조건을 만족하는 값이 아예 없는 경우를 위해 `answer = -1` 초기값 처리가 필요합니다.

## 유사 문제 패턴

- 정렬 배열에서 `target`이 처음 등장하는 위치 찾기
- 정렬 배열에서 `target`보다 큰 값이 처음 나오는 위치 찾기
- 조건을 만족하는 최소값이나 최대값을 찾는 파라메트릭 서치 문제