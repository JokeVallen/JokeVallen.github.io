---
title: Unity Invoke 延迟调用
date: 2026-09-23
category: Unity
tags: [Unity, Invoke, 延迟调用]
icon: fas fa-clock
difficulty: 1
---

## 定义

`Invoke` 用于在指定秒数后调用一个无参数方法，方法名以字符串传入，由 MonoBehaviour 的调度系统执行。

## 代码示例

```csharp
void Start()
{
    Invoke(nameof(SpawnEnemy), 3f);
    CancelInvoke(nameof(SpawnEnemy));
}

void SpawnEnemy()
{
}
```

## 特点

- 只能调用无参数方法。
- 计时受 `Time.timeScale` 影响。
- 方法名用字符串传递，编译期无法检查拼写。
- 对象禁用或销毁后，已安排的调用会失效。

## 适用场景

- 简单的一次性延迟逻辑。
- 原型阶段快速实现倒计时或延时生成。

## 常见坑

- 字符串方法名写错不会报编译错误，建议使用 `nameof`。
- 需要参数、复杂等待条件或取消控制时，协程更合适。
- `Invoke` 不能直接调用带参数方法，需额外封装。

> 记忆：**Invoke 延迟一次，字符串方法名，无参；复杂等待用协程。**
