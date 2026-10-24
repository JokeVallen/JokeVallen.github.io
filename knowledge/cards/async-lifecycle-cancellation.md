---
title: 异步生命周期与取消令牌
date: 2026-09-25
category: 架构
tags: [异步, 取消, 生命周期]
icon: fas fa-stop-circle
difficulty: 3
---

## 结论

任何异步加载、网络请求、动画等待都必须绑定对象生命周期。对象销毁后回调仍在执行，是 Unity 中最常见的空引用与重复逻辑来源。

## 设计原则

- 谁创建异步，谁持有 `CancellationTokenSource`
- 对象 `OnDestroy` 时取消并释放
- 使用 `GetCancellationTokenOnDestroy()` 或显式传入 token
- 异步回调第一步检查对象是否仍有效
- 超时与取消要区分处理

## 示例

```csharp
private CancellationTokenSource _cts = new CancellationTokenSource();

private async UniTaskVoid LoadAsync()
{
    var data = await RequestAsync(_cts.Token);
    if (_cts.IsCancellationRequested) return;
    Apply(data);
}

private void OnDestroy()
{
    _cts.Cancel();
    _cts.Dispose();
}
```

## 常见坑

- `CancellationTokenSource` 未 Dispose
- 多个请求共用一个 CTS，取消一个全部取消
- 回调中直接访问已销毁的 GameObject
- 用 `async void` 导致异常丢失

> 记忆：**异步不是发出去就结束，生命周期结束时要能取消。**
