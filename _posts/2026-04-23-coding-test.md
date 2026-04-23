---
title: "[코딩 테스트] 2026-04-23 — 팰린드롬 판별"
date: 2026-04-23 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test]
---
## 오늘의 문제 선정 이유
> 문자열 전처리와 two-pointer는 코딩 테스트 입문자가 가장 먼저 익혀야 하는 기본기라서 오늘 주제로 적합합니다.

## 문제 설명

문자열 `s`가 주어집니다.  
이 문자열에서 알파벳과 숫자만 남기고, 대소문자를 구분하지 않았을 때 앞에서 읽은 결과와 뒤에서 읽은 결과가 같으면 팰린드롬이라고 합니다.

문자열이 팰린드롬이면 `true`를, 아니면 `false`를 반환하세요.

예를 들어 공백, 쉼표, 콜론 같은 문자는 비교 대상에서 제외합니다.  
영문자는 모두 소문자 또는 대문자로 통일해서 비교합니다.

## 입출력 예시

```text
입력: "A man, a plan, a canal: Panama"
출력: true
설명: 알파벳과 숫자만 남기면 "amanaplanacanalpanama"가 되고, 앞뒤가 같습니다.
```

```text
입력: "race a car"
출력: false
설명: 알파벳과 숫자만 남기면 "raceacar"가 되고, 앞뒤가 다릅니다.
```

```text
입력: "No lemon, no melon"
출력: true
설명: 알파벳과 숫자만 남기고 소문자로 바꾸면 "nolemonnomelon"이 됩니다.
```

## 제약 조건

- `1 <= s.length <= 200000`
- `s`는 영문 대소문자, 숫자, 공백, 특수문자를 포함할 수 있습니다.
- 시간 제한은 문자열 전체를 한 번 또는 두 번 정도 순회하는 수준을 기대합니다.
- 추가 문자열을 크게 만들지 않고도 풀 수 있으면 더 좋습니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 양끝 문자를 동시에 확인하는 `two-pointer`가 가장 자연스럽습니다.  
왜 이 방법인가 하면, 팰린드롬은 앞과 뒤가 서로 같아야 하므로 왼쪽 포인터와 오른쪽 포인터를 움직이며 비교하면 한 번의 순회로 판별할 수 있기 때문입니다.

구현은 어렵지 않습니다.  
왼쪽과 오른쪽에서 각각 알파벳이나 숫자가 아닌 문자는 건너뛰고, 비교할 문자를 찾으면 소문자로 맞춘 뒤 같은지 확인하면 됩니다.

### 단계별 풀이 과정
1. `left`는 문자열 시작, `right`는 문자열 끝에 둡니다.
2. `left`가 가리키는 문자가 영문자나 숫자가 아니면 다음 칸으로 이동합니다.
3. `right`가 가리키는 문자가 영문자나 숫자가 아니면 이전 칸으로 이동합니다.
4. 둘 다 비교 가능한 문자라면 소문자로 변환해서 비교합니다.
5. 다르면 즉시 `false`를 반환합니다.
6. 같으면 `left += 1`, `right -= 1`로 이동합니다.
7. 포인터가 교차할 때까지 반복하고, 끝까지 문제가 없으면 `true`를 반환합니다.

## 코드 풀이

### Python
```python
def is_palindrome(s: str) -> bool:
    left = 0
    right = len(s) - 1

    while left < right:
        # 왼쪽에서 알파벳/숫자가 나올 때까지 이동
        while left < right and not s[left].isalnum():
            left += 1

        # 오른쪽에서 알파벳/숫자가 나올 때까지 이동
        while left < right and not s[right].isalnum():
            right -= 1

        # 대소문자를 무시하고 비교
        if s[left].lower() != s[right].lower():
            return False

        left += 1
        right -= 1

    return True


# 예시 실행
print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))  # False
print(is_palindrome("No lemon, no melon"))  # True
```

### JavaScript
```javascript
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    // 왼쪽에서 영문자/숫자가 나올 때까지 이동
    while (left < right && !isAlphaNumeric(s[left])) {
      left++;
    }

    // 오른쪽에서 영문자/숫자가 나올 때까지 이동
    while (left < right && !isAlphaNumeric(s[right])) {
      right--;
    }

    // 대소문자를 무시하고 비교
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }

    left++;
    right--;
  }

  return true;
}

function isAlphaNumeric(ch) {
  const code = ch.charCodeAt(0);

  const isNumber = code >= 48 && code <= 57;   // 0-9
  const isUpper = code >= 65 && code <= 90;    // A-Z
  const isLower = code >= 97 && code <= 122;   // a-z

  return isNumber || isUpper || isLower;
}

// 예시 실행
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false
console.log(isPalindrome("No lemon, no melon")); // true
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 양쪽 포인터가 문자열을 한 번씩만 지나가기 때문입니다.
- **공간 복잡도**: O(1) — 별도의 큰 문자열이나 배열을 만들지 않고 포인터만 사용하기 때문입니다.

## 틀리기 쉬운 포인트

- 특수문자를 제거한 새 문자열을 만든 뒤 풀어도 되지만, 입력 길이가 크면 불필요한 메모리를 더 씁니다.
- 대소문자를 무시해야 하므로 비교 전에 `lower()` 또는 `toLowerCase()` 처리를 빼먹으면 오답이 됩니다.
- 양쪽에서 문자를 건너뛸 때 `left < right` 조건을 함께 확인하지 않으면 인덱스 에러나 불필요한 비교가 생길 수 있습니다.

## 유사 문제 패턴

- 회문 문자열 응용: 한 글자만 삭제해서 팰린드롬이 되는지 확인하는 문제도 같은 `two-pointer` 흐름을 사용합니다.
- 문장 정규화 비교: 공백, 기호, 대소문자를 무시하고 두 문자열이 같은지 비교하는 문제에도 같은 전처리 아이디어가 쓰입니다.
- 양끝 비교 문자열 문제: 괄호쌍 단순 검증과는 다르지만, 문자열의 양끝 성질을 이용해 조건을 확인한다는 점에서 비슷한 사고가 필요합니다.