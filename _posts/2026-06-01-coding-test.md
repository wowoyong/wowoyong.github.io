---
title: "[코딩 테스트] 2026-06-01 — 단조 스택"
date: 2026-06-01 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, stack]
---
## 오늘의 문제 선정 이유
> 개발자 인터뷰 준비 글과 알고리즘 서비스 트렌드가 많아, 실전 코딩 테스트에서 자주 나오는 단조 스택 유형을 선택했습니다.

## 문제 설명

기상 관측 서비스에는 `n`일 동안의 최고 기온이 배열로 기록되어 있습니다.

각 날짜마다, 이후 날짜 중 현재 날짜보다 기온이 더 높은 첫 번째 날이 며칠 뒤인지 구하세요.

더 따뜻한 날이 없다면 `0`을 기록합니다.

예를 들어 기온이 `[30, 31, 29, 35]`라면,

- 1일차 `30`도는 1일 뒤 `31`도가 더 따뜻합니다.
- 2일차 `31`도는 2일 뒤 `35`도가 더 따뜻합니다.
- 3일차 `29`도는 1일 뒤 `35`도가 더 따뜻합니다.
- 4일차 `35`도는 이후 더 따뜻한 날이 없습니다.

따라서 정답은 `[1, 2, 1, 0]`입니다.

## 입출력 예시

```
입력: temperatures = [30, 31, 29, 35]
출력: [1, 2, 1, 0]
설명: 각 날짜에서 처음으로 더 따뜻해지는 날까지의 일수를 구합니다.
```

```
입력: temperatures = [33, 32, 31, 30]
출력: [0, 0, 0, 0]
설명: 시간이 지나도 더 따뜻한 날이 없으므로 모두 0입니다.
```

```
입력: temperatures = [28, 28, 29, 27, 30]
출력: [2, 1, 2, 1, 0]
설명: 같은 온도는 더 따뜻한 날이 아닙니다. 반드시 현재보다 높아야 합니다.
```

## 제약 조건

- `1 <= temperatures.length <= 100,000`
- `-50 <= temperatures[i] <= 60`
- 시간 제한을 고려해 `O(n^2)` 풀이는 통과하기 어렵습니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 각 날짜마다 오른쪽에서 처음 만나는 더 큰 값을 찾는 문제입니다.  
모든 날짜를 하나씩 뒤로 탐색하면 `O(n^2)`가 됩니다.  
대신 아직 더 따뜻한 날을 찾지 못한 날짜들을 stack에 저장하면 `O(n)`에 해결할 수 있습니다.

### 단계별 풀이 과정

1. 정답 배열 `answer`를 모두 `0`으로 초기화합니다.
2. stack에는 아직 더 따뜻한 날을 찾지 못한 날짜의 index를 저장합니다.
3. 왼쪽부터 날짜를 순회합니다.
4. 현재 기온이 stack 맨 위 날짜의 기온보다 높다면, 그 날짜의 답을 계산합니다.
5. 더 이상 해결할 수 없을 때까지 stack에서 꺼냅니다.
6. 현재 날짜 index를 stack에 넣습니다.
7. 끝까지 남은 index들은 더 따뜻한 날이 없으므로 그대로 `0`입니다.

## 코드 풀이

### Python
```python
from typing import List

def days_until_warmer(temperatures: List[int]) -> List[int]:
    n = len(temperatures)
    answer = [0] * n
    stack = []

    for today in range(n):
        current_temp = temperatures[today]

        # 현재 날짜가 stack에 쌓인 이전 날짜들의 답이 될 수 있는지 확인
        while stack and temperatures[stack[-1]] < current_temp:
            prev_day = stack.pop()
            answer[prev_day] = today - prev_day

        stack.append(today)

    return answer


# 예시 실행
print(days_until_warmer([30, 31, 29, 35]))
print(days_until_warmer([33, 32, 31, 30]))
print(days_until_warmer([28, 28, 29, 27, 30]))
```

### JavaScript
```javascript
function daysUntilWarmer(temperatures) {
  const n = temperatures.length;
  const answer = new Array(n).fill(0);
  const stack = [];

  for (let today = 0; today < n; today++) {
    const currentTemp = temperatures[today];

    // 현재 날짜가 stack에 쌓인 이전 날짜들의 답이 될 수 있는지 확인
    while (
      stack.length > 0 &&
      temperatures[stack[stack.length - 1]] < currentTemp
    ) {
      const prevDay = stack.pop();
      answer[prevDay] = today - prevDay;
    }

    stack.push(today);
  }

  return answer;
}

// 예시 실행
console.log(daysUntilWarmer([30, 31, 29, 35]));
console.log(daysUntilWarmer([33, 32, 31, 30]));
console.log(daysUntilWarmer([28, 28, 29, 27, 30]));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 각 index는 stack에 한 번 들어가고 한 번만 나옵니다.
- **공간 복잡도**: O(n) — 최악의 경우 모든 날짜 index가 stack에 저장됩니다.

## 틀리기 쉬운 포인트

- 같은 온도는 더 따뜻한 날이 아닙니다. 비교는 `<`를 써야 합니다.
- stack에는 온도가 아니라 index를 저장해야 일수 차이를 계산할 수 있습니다.
- 기온이 계속 내려가는 경우 stack에 모든 index가 남을 수 있습니다. 이때 답은 그대로 `0`입니다.

## 유사 문제 패턴

- 다음 큰 수 찾기: 배열에서 각 원소 오른쪽의 첫 번째 큰 값을 찾습니다.
- 주식 가격 하락 기간: 가격이 떨어지는 첫 시점까지의 시간을 구합니다.
- 히스토그램 최대 직사각형: 높이가 증가하거나 감소하는 구간을 stack으로 관리합니다.