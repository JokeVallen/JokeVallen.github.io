---
title: Unity 协程的执行原理
date: 2026-09-23
category: Unity
tags: [Unity, 协程, 主线程]
icon: fas fa-clock
difficulty: 2
---

## 定义

Unity 协程不是线程，而是在主线程上由 Unity 调度器分时执行的 `IEnumerator` 状态机。`yield return` 让出执行权，满足条件后再从下一句继续。

## 常见 yield 指令

| 指令 | 恢复时机 |
|---|---|
| `yield return null` | 下一帧 Update 之后 |
| `WaitForSeconds` | 缩放时间经过指定秒数后 |
| `WaitForSecondsRealtime` | 真实时间经过指定秒数后 |
| `WaitForFixedUpdate` | 下一次 FixedUpdate 之前 |
| `WaitForEndOfFrame` | 当前帧渲染结束后 |
| `AsyncOperation` | 异步操作完成后 |

## 代码示例

```csharp
private IEnumerator MoveRoutine()
{
    while (true)
    {
        transform.Translate(Vector3.right * Time.deltaTime);
        yield return null;
    }
}
```

调用 `StartCoroutine(MoveRoutine())` 后，Unity 会在主线程的协程调度阶段反复调用 `MoveNext()`。

## 与线程的区别

协程由 Unity 主线程调度，可以安全访问 `Transform`、`GameObject` 等 Unity API；线程由操作系统调度，访问 Unity API 通常需要切回主线程。协程适合分帧处理，不适合 CPU 密集型并行计算。

## 常见坑

- 协程不是多线程，内部不能执行阻塞操作，否则照样卡主线程。
- 挂载对象被禁用或销毁后，协程会停止。
- 频繁 `new WaitForSeconds` 会产生额外 GC，可缓存复用。
- 协程无法暂停 `try-catch` 中的 `yield return`，但可用于 `try-finally`。

> 记忆：**IEnumerator 状态机，主线程分时执行；yield 让出，条件满足再继续。**
