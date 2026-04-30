---
title: "[기술 면접] 2026-04-30 — 이벤트 루프"
date: 2026-04-30 09:00:00 +0900
categories: [기술 면접]
tags: [interview, react, java, javascript, node]
---
## 오늘의 면접 주제
> React와 browser 기반 앱, 그리고 Node.js 비동기 처리에 대한 관심이 커질수록 이벤트 루프는 더 자주 묻는 기본기가 되기 때문입니다.

## 핵심 한 줄 요약
이벤트 루프는 Call Stack이 비었을 때 Queue에 쌓인 작업을 우선순위에 따라 실행해 JavaScript의 비동기 처리를 가능하게 하는 구조입니다.

## 면접 질문 & 모범 답변

### Q1. 이벤트 루프란 무엇인가요?
**기본 답변**: JavaScript는 기본적으로 한 번에 한 작업만 처리하는 single thread입니다. 이벤트 루프는 이 한 줄짜리 실행 흐름 안에서 비동기 작업을 순서 있게 처리하도록 돕는 메커니즘입니다.  
**심화 포인트**: 많은 지원자가 "비동기를 처리하는 기능" 정도로만 답합니다. 실제로는 Call Stack, Web APIs 또는 Node.js 런타임, Queue, 그리고 이벤트 루프가 함께 동작합니다.

### Q2. Call Stack, Callback Queue, Microtask Queue는 각각 무엇인가요?
**기본 답변**: Call Stack은 지금 실행 중인 함수가 쌓이는 공간입니다. Callback Queue는 `setTimeout`, 이벤트 핸들러 같은 일반 비동기 콜백이 대기하는 곳입니다. Microtask Queue는 `Promise.then`, `catch`, `finally` 같은 더 높은 우선순위 작업이 들어가는 곳입니다.  
**심화 포인트**: 면접에서는 "Queue에 들어간다고 바로 실행되지 않는다"는 점이 중요합니다. Stack이 먼저 비어야 하고, 그다음 Microtask가 Callback Queue보다 먼저 처리됩니다.

### Q3. 왜 Microtask Queue가 Callback Queue보다 먼저 실행되나요?
**기본 답변**: Promise 후속 처리는 가능한 한 빠르게 이어서 실행되어야 상태가 예측 가능해집니다. 그래서 이벤트 루프는 현재 작업이 끝나면 먼저 Microtask Queue를 모두 비웁니다. 그다음에 Callback Queue 작업을 가져옵니다.  
**심화 포인트**: 이 우선순위 때문에 `setTimeout(..., 0)`보다 `Promise.then(...)`이 먼저 실행됩니다. 시간 0은 즉시 실행이 아니라 "최소 대기 후 Queue에 들어갈 수 있음"을 뜻합니다.

### Q4. 실행 순서를 설명해보세요.
**기본 답변**: 아래 코드는 `script start`, `script end`, `promise`, `timeout` 순서로 실행됩니다.

```js
console.log('script start');
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
console.log('script end');
```

현재 Stack의 동기 코드가 먼저 끝납니다. 그다음 Microtask인 `promise`가 실행되고, 마지막에 Callback Queue의 `timeout`이 실행됩니다.  
**심화 포인트**: 순서를 외우는 것보다 "왜 그런가"를 설명해야 합니다. 기준은 항상 Stack 비움 후 Microtask 우선 처리입니다.

### Q5. 실무에서 이벤트 루프를 모르면 어떤 문제가 생기나요?
**기본 답변**: 비동기 코드의 실행 순서를 잘못 예상해 버그가 생깁니다. 예를 들어 상태 업데이트가 끝났다고 생각했는데 실제로는 아직 Microtask가 남아 있을 수 있습니다.  
**심화 포인트**: 브라우저에서는 렌더링 타이밍을 놓칠 수 있고, Node.js에서는 긴 동기 작업이 이벤트 루프를 막아 요청 처리가 느려질 수 있습니다. 즉, 성능 문제와 디버깅 난이도가 같이 커집니다.

### Q6. `setTimeout(..., 0)`은 바로 실행되나요?
**기본 답변**: 바로 실행되지 않습니다. 최소 지연 시간이 지난 뒤 Callback Queue에 들어갈 준비를 할 뿐입니다. 실제 실행은 Call Stack이 비고, 앞선 Microtask가 모두 끝난 뒤입니다.  
**심화 포인트**: 그래서 무거운 동기 코드가 길게 돌면 `setTimeout`은 0ms여도 한참 뒤에 실행됩니다. 타이머는 알람이지, 즉시 실행 버튼이 아닙니다.

### Q7. Node.js에서도 이벤트 루프 개념이 같은가요?
**기본 답변**: 큰 원리는 같습니다. JavaScript 코드를 한 번에 하나씩 처리하고, 비동기 작업 완료 후 콜백을 적절한 시점에 실행합니다.  
**심화 포인트**: 다만 Node.js는 libuv 기반으로 동작하고 phase 개념이 있습니다. junior 면접에서는 browser와 Node.js 모두 "Stack이 비어야 다음 비동기 작업이 실행된다" 정도를 명확히 말하면 충분합니다.

## 꼬리 질문 대비
`async/await`는 결국 내부적으로 Promise와 어떤 관계인가요?  
`queueMicrotask`와 `setTimeout`의 차이는 무엇인가요?  
렌더링은 Microtask와 어떤 타이밍 관계를 가지나요?  
긴 동기 함수가 이벤트 루프에 주는 영향은 무엇인가요?  
Node.js의 `process.nextTick`은 왜 주의해서 써야 하나요?

## 헷갈리기 쉬운 포인트
비동기 함수가 동시에 실행된다고 생각하면 틀립니다. 실행 시작 시점은 겹칠 수 있어도 JavaScript 코드 실행 자체는 한 번에 하나입니다.  
`setTimeout`은 지정한 시간에 정확히 실행되는 것이 아닙니다. 지정한 시간 이후 실행 가능 상태가 되는 것입니다.  
Promise는 별도 thread에서 실행되는 것이 아닙니다. 결과를 이어받는 콜백이 Microtask Queue로 관리됩니다.

## 면접관 시각
이 주제에서는 용어를 외웠는지보다 실행 순서를 논리적으로 설명하는지를 봅니다. 특히 `Promise`와 `setTimeout`의 우선순위를 이유까지 말하면 기본기가 있다고 판단합니다. 반대로 Queue 이름만 나열하고 "비동기라서 나중에 실행된다" 수준에 머무르면 실제 디버깅 경험이 부족하다고 봅니다.