---
title: "[코딩 테스트] 2026-03-21 — 슬라이딩 윈도우"
date: 2026-03-21 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 문자열 처리와 사용자 행동 로그 분석이 다시 주목받는 흐름이라, 실무와 코딩 테스트에 모두 자주 나오는 슬라이딩 윈도우 유형을 선택했습니다.

## 문제 설명

영상 추천 서비스를 운영하는 회사에서, 한 사용자의 연속 시청 기록을 분석하려고 합니다.

사용자의 시청 기록이 문자열 `s`로 주어집니다.  
문자열의 각 문자는 시청한 영상 카테고리를 뜻합니다.

- 같은 문자가 여러 번 나오면 같은 카테고리를 다시 본 것입니다.
- 연속한 구간 중에서, 같은 카테고리가 한 번도 중복되지 않는 구간만 유효하다고 봅니다.

이때, 중복 문자가 없는 연속 부분 문자열의 최대 길이를 구하세요.

예를 들어 `s = "abcaefg"`라면,  
`"bcaefg"`는 모든 문자가 서로 다르므로 길이는 6입니다.  
이보다 더 긴 유효 구간은 없으므로 정답은 6입니다.

## 입출력 예시

```text
입력: "abcaefg"
출력: 6
설명: 가장 긴 구간은 "bcaefg"이며 길이는 6이다.
```

```text
입력: "aaaaa"
출력: 1
설명: 어떤 구간이든 같은 문자가 반복되므로, 한 글자만 선택할 수 있다.
```

```text
입력: "pwwkervw"
출력: 5
설명: 가장 긴 구간은 "wkerv"이며 길이는 5이다.
```

## 제약 조건

- `1 <= len(s) <= 100000`
- `s`는 영문 대소문자, 숫자, 특수문자를 포함할 수 있음
- 시간 제한: 1초 내외
- 가능한 한 `O(n)`에 해결해야 함

## 풀이 접근법

### 핵심 아이디어
이 문제는 모든 부분 문자열을 다 확인하면 `O(n^2)` 이상이 되어 비효율적입니다.  
중복이 생기면 왼쪽 경계를 바로 이동시키는 슬라이딩 윈도우를 쓰면, 각 문자를 거의 한 번씩만 처리해서 `O(n)`에 해결할 수 있습니다.

중요한 점은, 같은 문자를 다시 만났을 때 무조건 왼쪽을 1칸씩 줄일 필요가 없다는 것입니다.  
각 문자의 마지막 위치를 기록해두면, 왼쪽 포인터를 한 번에 점프시킬 수 있습니다.

### 단계별 풀이 과정
1. `left`를 현재 윈도우의 시작 위치로 둡니다.
2. `right`를 왼쪽에서 오른쪽으로 이동시키며 문자를 하나씩 확인합니다.
3. 현재 문자 `ch`를 이미 본 적 있고, 그 위치가 현재 윈도우 안이라면 `left`를 그 다음 위치로 이동합니다.
4. `ch`의 마지막 등장 위치를 갱신합니다.
5. 현재 윈도우 길이 `right - left + 1`로 최대 길이를 갱신합니다.
6. 끝까지 반복한 뒤 최대 길이를 반환합니다.

## 코드 풀이

### Python
```python
def longest_unique_segment(s: str) -> int:
    last_index = {}
    left = 0
    max_len = 0

    for right, ch in enumerate(s):
        # 현재 문자가 윈도우 안에서 이미 등장했다면 left를 이동
        if ch in last_index and last_index[ch] >= left:
            left = last_index[ch] + 1

        # 현재 문자의 마지막 위치 갱신
        last_index[ch] = right

        # 현재 윈도우 길이로 최대값 갱신
        max_len = max(max_len, right - left + 1)

    return max_len


# 실행 예시
if __name__ == "__main__":
    print(longest_unique_segment("abcaefg"))   # 6
    print(longest_unique_segment("aaaaa"))     # 1
    print(longest_unique_segment("pwwkervw"))  # 5
```

### JavaScript
```javascript
function longestUniqueSegment(s) {
  const lastIndex = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];

    // 현재 문자가 윈도우 안에서 이미 등장했다면 left를 이동
    if (lastIndex.has(ch) && lastIndex.get(ch) >= left) {
      left = lastIndex.get(ch) + 1;
    }

    // 현재 문자의 마지막 위치 갱신
    lastIndex.set(ch, right);

    // 현재 윈도우 길이로 최대값 갱신
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 실행 예시
console.log(longestUniqueSegment("abcaefg"));   // 6
console.log(longestUniqueSegment("aaaaa"));     // 1
console.log(longestUniqueSegment("pwwkervw"));  // 5
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 각 문자를 오른쪽 포인터가 한 번씩만 확인하고, 왼쪽 포인터도 뒤로 가지 않음
- **공간 복잡도**: O(k) — 문자별 마지막 위치를 저장하며, `k`는 서로 다른 문자 개수

## 틀리기 쉬운 포인트

- 같은 문자를 만났다고 해서 `left = last_index[ch] + 1`을 무조건 하면 안 됩니다. 이미 윈도우 밖에 있는 문자일 수도 있어서 `last_index[ch] >= left` 조건이 필요합니다.
- 부분 문자열은 연속 구간입니다. 중복 없는 부분 수열과 혼동하면 안 됩니다.
- 문자열 길이가 1인 경우도 바로 처리할 수 있어야 합니다.

## 유사 문제 패턴

- 최대 `K`개 문자만 포함하는 최장 부분 문자열: 슬라이딩 윈도우로 조건을 유지하며 길이를 구합니다.
- 같은 원소를 포함하지 않는 최장 연속 구간: 문자열 대신 배열로 바뀐 형태입니다.
- 최소 길이 조건을 만족하는 연속 부분 배열: 윈도우를 늘리고 줄이며 범위를 관리하는 점이 같습니다.