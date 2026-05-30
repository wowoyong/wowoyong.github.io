---
title: "[코딩 테스트] 2026-05-30 — 최장 증가 부분 수열 (LIS)"
date: 2026-05-30 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, dp]
---
## 오늘의 문제 선정 이유
> 개발자 성장 로드맵, 학습 커리큘럼, 인터뷰 준비처럼 순서를 유지하며 점진적으로 난도를 올리는 상황에 잘 맞는 유형입니다.

## 문제 설명

한 개발자가 온라인 코딩 인터뷰 튜터 서비스를 만들고 있습니다.

서비스에는 여러 개의 학습 문제가 순서대로 등록되어 있습니다.  
각 문제에는 난이도 점수가 있습니다.

개발자는 학습자가 문제 목록의 순서를 유지하면서, 난이도가 계속 증가하는 문제들만 골라 풀도록 추천하려고 합니다.

문제는 건너뛸 수 있습니다.  
하지만 선택한 문제들의 순서는 원래 목록에서의 순서와 같아야 합니다.  
또한 뒤에 선택한 문제의 난이도는 앞에 선택한 문제보다 반드시 커야 합니다.

주어진 난이도 배열에서 만들 수 있는 가장 긴 추천 문제 목록의 길이를 구하세요.

## 입출력 예시

```
입력: [3, 1, 2, 5, 4, 7]
출력: 4
설명: [1, 2, 4, 7] 또는 [1, 2, 5, 7]을 선택할 수 있습니다.
```

```
입력: [5, 5, 5, 5]
출력: 1
설명: 난이도가 반드시 증가해야 하므로 같은 값은 연속으로 선택할 수 없습니다.
```

```
입력: [10, 20, 10, 30, 25, 50]
출력: 4
설명: [10, 20, 30, 50]을 선택할 수 있습니다.
```

## 제약 조건

- 1 <= difficulties.length <= 100,000
- 1 <= difficulties[i] <= 1,000,000
- 시간 제한을 고려하면 O(n²) 풀이는 큰 입력에서 통과하기 어렵습니다.
- 정답은 최장 증가 부분 수열의 길이입니다.

## 풀이 접근법

### 핵심 아이디어

이 문제는 전형적인 LIS 문제입니다.  
가장 직관적인 방법은 각 위치를 마지막 원소로 하는 LIS 길이를 DP로 구하는 O(n²) 방식입니다.  
하지만 입력이 100,000까지 가능하므로, 실제 코딩 테스트에서는 O(n log n) 이진 탐색 풀이가 필요합니다.

### 단계별 풀이 과정

1. `tails` 배열을 준비합니다.
2. `tails[i]`는 길이가 `i + 1`인 증가 부분 수열을 만들 때 가능한 가장 작은 마지막 값을 의미합니다.
3. 난이도를 하나씩 확인합니다.
4. 현재 값이 `tails`의 마지막 값보다 크면 뒤에 추가합니다.
5. 그렇지 않으면 `tails`에서 현재 값 이상이 처음 나오는 위치를 이진 탐색으로 찾습니다.
6. 그 위치의 값을 현재 값으로 교체합니다.
7. 모든 값을 처리한 뒤 `tails.length`가 LIS의 길이입니다.

## 코드 풀이

### Python
```python
def longest_increasing_recommendation(difficulties):
    tails = []

    for difficulty in difficulties:
        left = 0
        right = len(tails)

        # difficulty 이상이 처음 나오는 위치를 찾는다.
        while left < right:
            mid = (left + right) // 2

            if tails[mid] < difficulty:
                left = mid + 1
            else:
                right = mid

        # 새로 가장 긴 수열을 만들 수 있는 경우
        if left == len(tails):
            tails.append(difficulty)
        # 같은 길이의 수열이라면 마지막 값을 더 작게 유지한다.
        else:
            tails[left] = difficulty

    return len(tails)


# 예시 실행
print(longest_increasing_recommendation([3, 1, 2, 5, 4, 7]))      # 4
print(longest_increasing_recommendation([5, 5, 5, 5]))            # 1
print(longest_increasing_recommendation([10, 20, 10, 30, 25, 50])) # 4
```

### JavaScript
```javascript
function longestIncreasingRecommendation(difficulties) {
  const tails = [];

  for (const difficulty of difficulties) {
    let left = 0;
    let right = tails.length;

    // difficulty 이상이 처음 나오는 위치를 찾는다.
    while (left < right) {
      const mid = Math.floor((left + right) / 2);

      if (tails[mid] < difficulty) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // 새로 가장 긴 수열을 만들 수 있는 경우
    if (left === tails.length) {
      tails.push(difficulty);
    } else {
      // 같은 길이의 수열이라면 마지막 값을 더 작게 유지한다.
      tails[left] = difficulty;
    }
  }

  return tails.length;
}

// 예시 실행
console.log(longestIncreasingRecommendation([3, 1, 2, 5, 4, 7]));       // 4
console.log(longestIncreasingRecommendation([5, 5, 5, 5]));             // 1
console.log(longestIncreasingRecommendation([10, 20, 10, 30, 25, 50])); // 4
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n log n) — 각 원소마다 이진 탐색을 한 번 수행합니다.
- **공간 복잡도**: O(n) — 최악의 경우 `tails`에 모든 원소가 들어갑니다.

## 틀리기 쉬운 포인트

- 같은 난이도는 증가로 보지 않습니다. `tails[mid] < difficulty` 조건을 사용해야 합니다.
- `tails`는 실제 LIS 자체가 아닙니다. LIS 길이를 구하기 위한 보조 배열입니다.
- O(n²) DP는 이해하기 쉽지만, 입력 크기가 100,000이면 시간 초과가 납니다.

## 유사 문제 패턴

- 주어진 순서에서 점수가 계속 증가하는 가장 긴 기록 찾기
- 날짜순 데이터에서 매출이 계속 증가하는 가장 긴 기간 선택하기
- 여러 작업 중 난이도나 우선순위가 증가하도록 고르는 최대 개수 구하기