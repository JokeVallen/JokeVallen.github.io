---
title: Vector3.Lerp 线性插值
date: 2026-09-22
category: Unity
tags: [Lerp, 插值, 向量]
icon: fas fa-arrows-alt-h
difficulty: 2
---

## 定义

```
Vector3.Lerp(a, b, t) = a + (b - a) * t
```

- `t = 0` → 返回 a
- `t = 1` → 返回 b
- `t = 0.5` → 中点
- t 超出 [0,1] 会被 **Clamp**（`LerpUnclamped` 不截断）

## 用途

位置 / 颜色 / 数值的平滑过渡、进度插值、渐变动画。

## 配套方法

| 方法 | 用途 |
|---|---|
| `Mathf.Lerp`、`Color.Lerp` | 数值 / 颜色 |
| `Vector3.Slerp` | 球面插值，方向 / 旋转 |
| `Vector3.MoveTowards` | 匀速靠近目标 |
| `Vector3.SmoothDamp` | 带阻尼的平滑跟随，相机常用 |

## 常见坑

```csharp
// 每帧向目标插值 —— 永远到不了目标
transform.position = Vector3.Lerp(transform.position, target, Time.deltaTime * speed);
```

- "追逐式 Lerp"只会无限接近，且严格来说与帧率有关
- 帧率无关的平滑推荐 `SmoothDamp` 或指数平滑 `1 - Mathf.Exp(-k * Time.deltaTime)`
- Lerp 是**线性**的，不是缓动曲线

> 记忆：**Lerp(a,b,t)：t=0 取 a，t=1 取 b，中间线性插值，t 被截断在 [0,1]。**