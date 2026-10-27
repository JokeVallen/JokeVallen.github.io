---
title: UniTask 与协程的适用场景
date: 2026-09-25
category: 架构
tags: [UniTask, 协程, 异步]
icon: fas fa-code-branch
difficulty: 3
---

## 结论

| 维度 | 协程 | UniTask |
|---|---|---|
| 返回值 | 不支持 | 支持泛型 |
| 异常 | 难统一捕获 | 可用 try/catch |
| 取消 | StopCoroutine | CancellationToken |
| 组合 | 弱 | 强，可 WhenAll/WhenAny |
| 分配 | 迭代器有分配 | 池化，分配更低 |
| 依赖 | Unity 原生 | 第三方库 |

## 建议

- 简单的逐帧等待、动画流程可以用协程
- 资源加载、网络请求、复杂异步编排优先 UniTask
- 对象销毁时取消所有异步操作
- 不要用 `async void`，用 `UniTaskVoid` 或 `Task`
- 明确异常处理与超时策略

## 常见坑

- 异步回调回来时对象已销毁
- 忘记取消导致重复请求
- 在非主线程访问 Unity API
- 协程嵌套过深，流程难以维护

> 记忆：**简单等待用协程，复杂异步与取消用 UniTask。**
