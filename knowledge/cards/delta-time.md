---
title: deltaTime 与 fixedDeltaTime
date: 2026-09-22
category: Unity
tags: [deltaTime, 帧率, Update, FixedUpdate]
icon: fas fa-clock
difficulty: 2
---

题目问的是「让**移动速度**与帧率无关」，而不是「让 deltaTime 的数值与帧率无关」。

`Time.deltaTime` 的数值确实随帧率变化，但用它乘速度后，**移动速度反而与帧率无关**。

## 数值验证（速度 = 10 单位/秒）

| 帧率 | deltaTime | 每帧位移 | 1 秒总位移 |
|---|---|---|---|
| 60 FPS | ≈ 0.0167 s | 0.167 | **10** |
| 30 FPS | ≈ 0.0333 s | 0.333 | **10** |

帧率越高 → deltaTime 越小 → 每帧走得越少 → 单位时间总位移恒定。

## 反例：Update 里用 fixedDeltaTime（0.02 s）

| 帧率 | 每帧位移 | 1 秒总位移 |
|---|---|---|
| 60 FPS | 0.2 | **12** |
| 30 FPS | 0.2 | **6** |

帧率越高跑得越快，反而变成帧率相关。

## 结论

| 场景 | 使用 |
|---|---|
| Update 中每帧移动/旋转/动画 | `Time.deltaTime` |
| FixedUpdate 中物理 | `Time.fixedDeltaTime` |

> 冷知识：`FixedUpdate` 里 `Time.deltaTime` 返回的就是 `fixedDeltaTime`。