---
title: Addressables 句柄与引用计数
date: 2026-09-24
category: 资源管理
tags: [Addressables, 引用计数, 释放]
icon: fas fa-hand-holding
difficulty: 3
---

## 结论

Addressables 通过 `AsyncOperationHandle` 管理资源生命周期。每次加载会增加引用计数，释放时减少；计数归零后才可能真正卸载。

## 基本用法

```csharp
var handle = Addressables.LoadAssetAsync<GameObject>("ui/panel");
await handle.Task;
var prefab = handle.Result;
Addressables.Release(handle);
```

## 实例化

```csharp
var handle = Addressables.InstantiateAsync("ui/panel");
var go = handle.Result;
Addressables.ReleaseInstance(go);
```

## 注意

- 不要释放后继续使用 `handle.Result`
- 共享资源不要修改其原始数据，实例化副本再改
- `WaitForCompletion` 会阻塞主线程，只适合测试或极少数启动场景
- 释放实例和释放句柄是两套语义，不能混用
- 异步回调里要检查对象和场景是否仍然有效

> 记忆：**加载加计数，释放减计数；实例化用 ReleaseInstance。**
