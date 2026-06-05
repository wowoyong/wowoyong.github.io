---
title: "[코딩 테스트] 2026-06-05 — 피크 원소 찾기"
date: 2026-06-05 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, dp, binary-search]
---
## 오늘의 문제 선정 이유
> 빠른 탐색과 우선순위 판단은 추천 알고리즘, 로드맵, 물류 최적화 같은 오늘의 개발 트렌드와도 잘 맞는 기본기입니다.

## 문제 설명

한 서비스에는 여러 기능 모듈이 있습니다.

각 모듈은 최근 1시간 동안의 사용량 점수를 가집니다.  
사용량 점수는 정수 배열 `scores`로 주어집니다.

어떤 모듈의 점수가 양옆 인접 모듈보다 크면, 그 모듈을 `peak module`이라고 합니다.

배열의 양 끝은 한쪽 이웃만 비교합니다.

즉, 인덱스 `i`가 피크가 되려면 다음 조건을 만족해야 합니다.

- `i == 0`이면 `scores[0] > scores[1]`
- `i == n - 1`이면 `scores[n - 1] > scores[n - 2]`
- 그 외에는 `scores[i] > scores[i - 1]` 그리고 `scores[i] > scores[i + 1]`

반드시 하나 이상의 피크가 존재한다고 가정합니다.  
피크가 여러 개라면 아무 피크의 인덱스나 반환해도 됩니다.

단, 시간 복잡도는 `O(log n)`이어야 합니다.

## 입출력 예시

```
입력: scores = [1, 3, 5, 4, 2]
출력: 2
설명: scores[2] = 5는 양옆 3과 4보다 큽니다.
```

```
입력: scores = [10, 8, 6, 7, 9]
출력: 0 또는 4
설명: scores[0] = 10은 오른쪽 8보다 큽니다. scores[4] = 9도 왼쪽 7보다 큽니다.
```

```
입력: scores = [1, 2, 3, 4]
출력: 3
설명: 배열이 계속 증가하므로 마지막 원소가 피크입니다.
```

## 제약 조건

- `1 <= scores.length <= 100,000`
- `-1,000,000 <= scores[i] <= 1,000,000`
- 인접한 두 원소는 같지 않습니다.
- 피크 원소는 반드시 하나 이상 존재합니다.
- 시간 제한상 `O(n)` 풀이보다 `O(log n)` 풀이가 요구됩니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 `binary search`로 풀 수 있습니다.  
중간 원소와 오른쪽 원소를 비교하면 피크가 어느 방향에 있는지 알 수 있습니다.  
` scores[mid] < scores[mid + 1]`이면 오른쪽으로 올라가는 구간이므로 오른쪽에 피크가 반드시 있습니다.

### 단계별 풀이 과정

1. `left = 0`, `right = n - 1`로 탐색 범위를 잡습니다.
2. `mid`와 `mid + 1`의 값을 비교합니다.
3. `scores[mid] < scores[mid + 1]`이면 오른쪽 구간에 피크가 있으므로 `left = mid + 1`로 이동합니다.
4. 그렇지 않으면 `mid`가 피크일 수도 있고 왼쪽에 피크가 있을 수도 있으므로 `right = mid`로 이동합니다.
5. `left == right`가 되면 그 위치가 피크입니다.

## 코드 풀이

### Python
```python
import ast

def find_peak_module(scores):
    left = 0
    right = len(scores) - 1

    while left < right:
        mid = (left + right) // 2

        # 오른쪽으로 증가 중이면 오른쪽 구간에 피크가 반드시 있다.
        if scores[mid] < scores[mid + 1]:
            left = mid + 1
        else:
            # mid가 피크일 수 있으므로 mid를 포함한다.
            right = mid

    return left


# 입력 예시:
# [1, 3, 5, 4, 2]
if __name__ == "__main__":
    scores = ast.literal_eval(input().strip())
    print(find_peak_module(scores))
```

### JavaScript
```javascript
function findPeakModule(scores) {
  let left = 0;
  let right = scores.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    // 오른쪽으로 증가 중이면 오른쪽 구간에 피크가 반드시 있다.
    if (scores[mid] < scores[mid + 1]) {
      left = mid + 1;
    } else {
      // mid가 피크일 수 있으므로 mid를 포함한다.
      right = mid;
    }
  }

  return left;
}

// 입력 예시:
// [1, 3, 5, 4, 2]
const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();
const scores = JSON.parse(input);

console.log(findPeakModule(scores));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(log n) — 탐색 범위를 매번 절반으로 줄입니다.
- **공간 복잡도**: O(1) — 추가 배열 없이 포인터 변수만 사용합니다.

## 틀리기 쉬운 포인트

- `mid + 1`을 비교하므로 반복 조건은 `left < right`여야 합니다.
- `scores[mid] > scores[mid + 1]`일 때 `right = mid - 1`로 줄이면 `mid`가 정답인 경우를 놓칩니다.
- 길이가 1인 배열에서는 인덱스 `0`이 바로 피크입니다. 위 코드는 자연스럽게 `0`을 반환합니다.

## 유사 문제 패턴

- 산 모양 배열에서 최댓값 찾기
- 회전 정렬 배열에서 최솟값 찾기
- 조건이 바뀌는 지점을 찾는 이진 탐색 문제