---
title: "[코딩 테스트] 2026-03-22 — 올바른 괄호"
date: 2026-03-22 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, string, stack]
---
## 오늘의 문제 선정 이유
> 오늘 트렌드에 면접 준비와 개발 학습 자료가 많아서, 가장 기본이지만 스택 사고를 점검하기 좋은 올바른 괄호 유형을 골랐습니다.

## 문제 설명

문자열 `s`가 주어집니다.  
`s`는 소괄호 `()`, 대괄호 `[]`, 중괄호 `{}` 세 종류의 괄호와 영문 소문자로만 이루어져 있습니다.

문자열 안의 영문자는 무시하고, 괄호만 기준으로 문자열이 올바른 괄호 문자열인지 판별하세요.

올바른 괄호 문자열의 조건은 다음과 같습니다.

- 여는 괄호는 같은 종류의 닫는 괄호로 닫혀야 합니다.
- 괄호는 올바른 순서로 닫혀야 합니다.
- 닫는 괄호가 먼저 나오면 올바르지 않습니다.

올바르면 `true`, 아니면 `false`를 반환하세요.

## 입출력 예시

```text
입력: s = "a(b[c]{d})"
출력: true
설명: 영문자는 무시하면 "([{}])" 구조이며, 모든 괄호가 올바르게 닫힌다.
```

```text
입력: s = "([)]"
출력: false
설명: 소괄호와 대괄호의 닫히는 순서가 서로 꼬여 있다.
```

```text
입력: s = "x{y[z]}"
출력: true
설명: 영문자를 제외하면 "{[]}" 이고, 중첩 순서가 올바르다.
```

```text
입력: s = "abc)]"
출력: false
설명: 닫는 괄호가 먼저 등장하므로 올바르지 않다.
```

## 제약 조건

- `1 <= s.length <= 100000`
- `s`는 영문 소문자와 `()[]{}` 로만 이루어집니다.
- 시간 제한: 1초
- 문자열 전체를 한 번 순회하는 풀이를 권장합니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 가장 최근에 열린 괄호가 가장 먼저 닫혀야 합니다. 이런 구조는 LIFO 특성이므로 스택이 가장 잘 맞습니다.

즉, 여는 괄호를 스택에 쌓고 닫는 괄호를 만나면 스택의 top과 짝이 맞는지 확인하면 됩니다. 문자열을 끝까지 봤을 때 스택이 비어 있어야 완전히 올바른 괄호 문자열입니다.

### 단계별 풀이 과정
1. 여는 괄호 `(`, `[`, `{` 를 만나면 스택에 넣습니다.
2. 닫는 괄호 `)`, `]`, `}` 를 만나면 스택이 비어 있는지 먼저 확인합니다.
3. 비어 있지 않다면 스택의 top을 꺼내서 현재 닫는 괄호와 짝이 맞는지 검사합니다.
4. 짝이 맞지 않으면 바로 `false`를 반환합니다.
5. 영문자는 무시하고 계속 진행합니다.
6. 순회가 끝난 뒤 스택이 비어 있으면 `true`, 아니면 `false`를 반환합니다.

## 코드 풀이

### Python
```python
def is_valid_bracket_string(s: str) -> bool:
    stack = []
    pair = {
        ')': '(',
        ']': '[',
        '}': '{'
    }
    opening = set(['(', '[', '{'])

    for ch in s:
        if ch in opening:
            stack.append(ch)
        elif ch in pair:
            # 닫는 괄호인데 대응할 여는 괄호가 없으면 실패
            if not stack:
                return False

            top = stack.pop()

            # 가장 최근의 여는 괄호와 현재 닫는 괄호가 짝이 맞아야 한다
            if top != pair[ch]:
                return False
        # 영문자는 무시

    # 모든 괄호가 정상적으로 닫혔으면 스택이 비어 있어야 한다
    return len(stack) == 0


# 테스트
print(is_valid_bracket_string("a(b[c]{d})"))  # True
print(is_valid_bracket_string("([)]"))        # False
print(is_valid_bracket_string("x{y[z]}"))     # True
print(is_valid_bracket_string("abc)]"))       # False
```

### JavaScript
```javascript
function isValidBracketString(s) {
  const stack = [];
  const pair = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  const opening = new Set(["(", "[", "{"]);

  for (const ch of s) {
    if (opening.has(ch)) {
      stack.push(ch);
    } else if (ch in pair) {
      // 닫는 괄호인데 대응할 여는 괄호가 없으면 실패
      if (stack.length === 0) {
        return false;
      }

      const top = stack.pop();

      // 가장 최근의 여는 괄호와 현재 닫는 괄호가 짝이 맞아야 한다
      if (top !== pair[ch]) {
        return false;
      }
    }
    // 영문자는 무시
  }

  // 모든 괄호가 정상적으로 닫혔으면 스택이 비어 있어야 한다
  return stack.length === 0;
}

// 테스트
console.log(isValidBracketString("a(b[c]{d})")); // true
console.log(isValidBracketString("([)]"));       // false
console.log(isValidBracketString("x{y[z]}"));    // true
console.log(isValidBracketString("abc)]"));      // false
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n) — 문자열을 한 번만 순회합니다.
- **공간 복잡도**: O(n) — 모든 문자가 여는 괄호인 경우 스택에 최대 n개가 들어갈 수 있습니다.

## 틀리기 쉬운 포인트

- 닫는 괄호를 만났을 때 스택이 비어 있으면 바로 `false`여야 합니다.
- 문자열 순회가 끝난 뒤 스택에 값이 남아 있으면 아직 닫히지 않은 괄호가 있다는 뜻입니다.
- 괄호 개수만 맞는다고 끝이 아닙니다. `([)]` 처럼 순서가 꼬인 경우를 반드시 걸러야 합니다.

## 유사 문제 패턴

- HTML/XML 태그 짝 맞추기: 여는 태그와 닫는 태그를 스택으로 검증합니다.
- 문자열 폭발 또는 인접 패턴 제거: 최근에 들어온 문자와 비교해야 해서 스택을 자주 씁니다.
- 함수 호출 로그 검증: 시작과 종료 이벤트가 올바른 순서인지 스택으로 확인할 수 있습니다.