---
title: "[코딩 테스트] 2026-04-29 — 팰린드롬 판별"
date: 2026-04-29 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 문자열 정제와 양끝 비교는 웹 입력 검증, 로그 정리, 검색 전처리처럼 실무와 코딩 테스트에 모두 자주 나온다.

## 문제 설명

문자열 `s`가 주어집니다.  
이 문자열에서 알파벳과 숫자만 남기고, 대소문자를 구분하지 않았을 때 앞에서 읽은 결과와 뒤에서 읽은 결과가 같으면 팰린드롬입니다.

문자열 `s`가 팰린드롬이면 `true`, 아니면 `false`를 반환하세요.

예를 들어 공백, 쉼표, 콜론 같은 문자는 무시합니다.  
알파벳은 대문자와 소문자를 같은 문자로 봅니다.

## 입출력 예시

```text
입력: "A man, a plan, a canal: Panama"
출력: true
설명: 알파벳과 숫자만 남기고 소문자로 바꾸면 "amanaplanacanalpanama"가 된다. 앞뒤가 같다.
```

```text
입력: "race a car"
출력: false
설명: 정제 후 문자열은 "raceacar"이고, 앞뒤가 다르다.
```

```text
입력: "No 'x' in Nixon"
출력: true
설명: 정제 후 문자열은 "noxinnixon"이다. 앞뒤가 같다.
```

## 제약 조건

- `1 <= s.length <= 200000`
- `s`는 영문 대소문자, 숫자, 공백, 특수문자를 포함할 수 있음
- 시간 제한은 문자열을 한 번 훑는 수준으로 통과 가능해야 함
- 추가 문자열을 크게 만들지 않는 풀이도 가능함

## 풀이 접근법

### 핵심 아이디어
이 문제는 문자열을 전부 새로 만들지 않아도 풀 수 있습니다.  
왜 이 방법인가 하면, 팰린드롬은 결국 양끝 문자가 같은지만 확인하면 되기 때문입니다. 무시할 문자는 건너뛰고, 비교할 문자만 양쪽에서 좁혀 오면 가장 효율적입니다.

### 단계별 풀이 과정
1. `left`는 문자열의 시작, `right`는 문자열의 끝에서 출발시킵니다.
2. `left`가 가리키는 문자가 알파벳이나 숫자가 아니면 오른쪽으로 한 칸 이동합니다.
3. `right`가 가리키는 문자가 알파벳이나 숫자가 아니면 왼쪽으로 한 칸 이동합니다.
4. 두 문자가 모두 비교 대상이면 소문자로 맞춘 뒤 비교합니다.
5. 다르면 바로 `false`를 반환합니다.
6. 같으면 `left += 1`, `right -= 1`로 다음 구간을 확인합니다.
7. 끝까지 문제 없으면 `true`를 반환합니다.

## 코드 풀이

### Python
```python
def is_palindrome(s: str) -> bool:
    left = 0
    right = len(s) - 1

    while left < right:
        # 왼쪽에서 비교할 문자를 찾는다.
        while left < right and not s[left].isalnum():
            left += 1

        # 오른쪽에서 비교할 문자를 찾는다.
        while left < right and not s[right].isalnum():
            right -= 1

        # 대소문자를 무시하고 비교한다.
        if s[left].lower() != s[right].lower():
            return False

        left += 1
        right -= 1

    return True


# 테스트
print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))  # False
print(is_palindrome("No 'x' in Nixon"))  # True
```

### JavaScript
```javascript
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;

  const isAlphaNum = (ch) => {
    const code = ch.charCodeAt(0);
    const isNumber = code >= 48 && code <= 57;
    const isUpper = code >= 65 && code <= 90;
    const isLower = code >= 97 && code <= 122;
    return isNumber || isUpper || isLower;
  };

  while (left < right) {
    // 왼쪽에서 비교할 문자를 찾는다.
    while (left < right && !isAlphaNum(s[left])) {
      left += 1;
    }

    // 오른쪽에서 비교할 문자를 찾는다.
    while (left < right && !isAlphaNum(s[right])) {
      right -= 1;
    }

    // 대소문자를 무시하고 비교한다.
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left += 1;
    right -= 1;
  }

  return true;
}

// 테스트
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false
console.log(isPalindrome("No 'x' in Nixon")); // true
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 양쪽 포인터가 문자열을 최대 한 번씩만 훑는다.
- **공간 복잡도**: O(1) — 별도 문자열을 만들지 않고 포인터만 사용한다.

## 틀리기 쉬운 포인트

- 특수문자를 제거한 새 문자열을 만들면 풀 수는 있지만, 불필요한 메모리를 더 쓸 수 있습니다.
- 대소문자를 무시해야 하므로 비교 전에 `lower()` 또는 `toLowerCase()` 처리가 필요합니다.
- `"!!!"`처럼 알파벳과 숫자가 하나도 없는 경우도 팰린드롬으로 처리할 수 있습니다. 비교할 문자가 없으니 대칭이 깨지지 않았다고 보는 것입니다.

## 유사 문제 패턴

- 회문 문장 판별: 공백, 특수문자, 대소문자 무시 후 회문 여부를 확인하는 문제입니다.
- 거의 팰린드롬 판별: 문자 하나를 삭제하면 팰린드롬이 되는지 확인합니다.
- 문자열 양끝 축소 문제: 양끝 조건을 만족하는 동안 포인터를 좁혀 가는 two-pointer 유형입니다.