---
title: Unity 定时重复调用
date: 2026-09-23
category: Unity
tags: [Unity, InvokeRepeating, 定时器]
icon: fas fa-clock
difficulty: 1
---

## 定义

`InvokeRepeating` 在首次延迟后，按固定时间间隔重复调用一个无参数方法，直到对象销毁或调用 `CancelInvoke`。

## 代码示例

```csharp
void Start()
{
    InvokeRepeating(nameof(SpawnEnemy), 1f, 2f);
}

void SpawnEnemy()
{
}

void StopSpawn()
{
    CancelInvoke(nameof(SpawnEnemy));
}
```

## 参数说明

| 参数 | 含义 |
|---|---|
| 方法名 | 要调用的无参方法 |
| 首次延迟 | 多少秒后第一次调用 |
| 重复间隔 | 之后每隔多少秒调用一次 |

## 常见坑

- 间隔时间受 `Time.timeScale` 影响，暂停时不会继续。
- 多次调用 `InvokeRepeating` 同一方法不会叠加，后一次会覆盖前一次设置。
- 需要动态调整间隔或传参时，应改用协程或自定义计时器。

## 补充要点

- 首次延迟为 0 时，方法会在当前帧安排后尽快执行。
- 重复间隔小于帧间隔时，调用频率仍受帧率和调度限制。
- 协程可以更灵活地实现动态间隔、传参和停止条件。

- 对象销毁或脚本禁用后，Unity 会自动清理已安排的重复调用。

> 记忆：**首次延迟加固定间隔，重复调用无参方法；CancelInvoke 停掉。**
