---
title: "[코딩 테스트] 2026-04-25 — 애너그램 그룹화"
date: 2026-04-25 09:30:00 +0900
categories: [코딩 테스트]
tags: [coding-test, array, hash, sort]
---
## 오늘의 문제 선정 이유
> 텍스트 분류, 검색, 추천 같은 서비스 기능에서 문자열 정규화와 그룹화는 자주 나오고, 오늘의 트렌드처럼 학습 콘텐츠와 개발 자료가 많은 환경에서도 실용적인 유형이기 때문입니다.

## 문제 설명

온라인 개발 학습 플랫폼에서 사용자가 올린 태그 목록이 주어집니다.  
운영자는 철자 순서만 다른 태그를 같은 의미의 태그 후보로 보고 묶으려 합니다.

문자열 배열 `words`가 주어질 때, 서로 애너그램 관계인 문자열끼리 그룹으로 묶어 반환하세요.

애너그램이란 문자의 개수는 같고, 순서만 다른 문자열을 말합니다.  
예를 들어 `code`, `deco`는 같은 그룹입니다.

반환할 때 그룹의 순서는 자유입니다.  
단, 각 그룹 내부의 문자열 순서는 입력에서 등장한 순서를 유지해야 합니다.

## 입출력 예시

```text
입력: ["code", "deco", "node", "done", "camp", "pcam", "java"]
출력: [["code", "deco"], ["node", "done"], ["camp", "pcam"], ["java"]]
설명: 정렬했을 때 같은 문자열이 되는 단어끼리 같은 그룹으로 묶는다.
```

```text
입력: ["listen", "silent", "enlist", "google", "gogole", "abc", "cab", "bac", "x"]
출력: [["listen", "silent", "enlist"], ["google", "gogole"], ["abc", "cab", "bac"], ["x"]]
설명: "listen", "silent", "enlist"는 모두 같은 문자 구성이므로 한 그룹이다.
```

```text
입력: ["aaab", "abaa", "baaa", "aabb", "bbaa", "abab"]
출력: [["aaab", "abaa", "baaa"], ["aabb", "bbaa", "abab"]]
설명: 문자 종류가 같아도 개수가 다르면 다른 그룹이다.
```

## 제약 조건

- `1 <= words.length <= 10^4`
- `1 <= words[i].length <= 100`
- `words[i]`는 영어 소문자만으로 이루어집니다.
- 시간 제한은 일반적인 코딩 테스트 기준 1~2초를 가정합니다.

## 풀이 접근법

### 핵심 아이디어
이 문제는 "같은 문자 구성인지"를 빠르게 판별해야 합니다.  
애너그램은 문자를 정렬했을 때 항상 같은 결과가 되므로, 정렬한 문자열을 `key`로 쓰면 같은 그룹을 쉽게 찾을 수 있습니다.

즉, `hash-map`에 `key -> 같은 그룹의 단어들` 형태로 저장하면 됩니다.  
문제의 핵심은 원본 문자열이 아니라, 그룹을 대표할 기준 문자열을 만드는 것입니다.

### 단계별 풀이 과정
1. 결과를 저장할 `hash-map`을 준비합니다.
2. 각 단어를 하나씩 보면서, 문자를 정렬한 문자열을 `key`로 만듭니다.
3. 같은 `key`가 이미 있으면 해당 그룹에 단어를 추가합니다.
4. 없으면 새 그룹을 만들어 단어를 넣습니다.
5. 모든 단어를 처리한 뒤, `hash-map`의 값들만 배열로 반환합니다.

## 코드 풀이

### Python
```python
from typing import List
from collections import defaultdict


def group_anagrams(words: List[str]) -> List[List[str]]:
    # key: 정렬한 문자열, value: 같은 애너그램 그룹
    groups = defaultdict(list)

    for word in words:
        # 애너그램이면 정렬 결과가 같다
        key = ''.join(sorted(word))
        groups[key].append(word)

    return list(groups.values())


# 예시 실행
if __name__ == "__main__":
    words = ["code", "deco", "node", "done", "camp", "pcam", "java"]
    print(group_anagrams(words))
```

### JavaScript
```javascript
function groupAnagrams(words) {
  // key: 정렬한 문자열, value: 같은 애너그램 그룹
  const groups = new Map();

  for (const word of words) {
    // 애너그램이면 정렬 결과가 같다
    const key = word.split("").sort().join("");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(word);
  }

  return Array.from(groups.values());
}

// 예시 실행
const words = ["code", "deco", "node", "done", "camp", "pcam", "java"];
console.log(groupAnagrams(words));
```

## 시간·공간 복잡도

- **시간 복잡도**: O(n * k log k) — 단어가 `n`개이고, 각 단어 길이가 최대 `k`일 때 매번 정렬이 필요합니다.
- **공간 복잡도**: O(n * k) — 그룹 저장과 정렬 key 저장에 추가 공간이 필요합니다.

## 틀리기 쉬운 포인트

- 같은 문자가 있어도 개수가 다르면 같은 그룹이 아닙니다. 예를 들어 `aab`와 `abb`는 다릅니다.
- 그룹 내부 정렬까지 요구한 것이 아닙니다. 입력 순서를 유지하라는 조건을 놓치면 불필요한 정렬을 추가할 수 있습니다.
- `hash-map`의 key를 만들 때 원본 문자열 자체를 쓰면 그룹화가 되지 않습니다. 반드시 정렬 결과 같은 공통 기준이 필요합니다.

## 유사 문제 패턴

- 문자열 빈도 기반 비교 문제: 두 문자열이 같은 문자 구성을 가지는지 판별하는 유형입니다.
- 해시맵 기반 분류 문제: 공통 key를 만들어 데이터를 묶는 로그 집계, 태그 정리, 이메일 정규화 문제에 자주 나옵니다.
- 정렬 후 패턴 비교 문제: 문자열이나 배열을 정렬해서 같은 형태인지 판단하는 문제들에 같은 접근이 통합니다.