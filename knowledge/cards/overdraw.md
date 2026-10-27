---
title: Overdraw
date: 2026-09-22
category: 图形性能
tags: [渲染, 性能, 移动端, FillRate]
icon: fas fa-fill-drip
difficulty: 2
---

同一屏幕像素在一帧中被**重复绘制多次**。比如背景 + 全屏图 + 按钮叠在一起，那个像素被画了 3 次。

## 为什么是问题

增加 **Fill Rate / 片段着色器与带宽开销**，移动端 GPU 尤其敏感，容易发热、掉帧。

## 常见来源

- UI 全屏背景图 + 多层叠加
- 半透明层（粒子、特效、玻璃）
- 大面积透明 Image
- 相互遮挡的 3D 模型

## 查看方式

Scene 视图的 **Overdraw 调试模式**、Profiler、Frame Debugger。

## 优化

**UI**：
- 减少全屏透明底图
- 隐藏不可见 UI
- `CanvasGroup.alpha = 0` 前先 `SetActive(false)`
- 图集

**3D**：
- 不透明物体**从近到远排序**（利用 Early-Z 提前剔除）
- 减少半透明重叠

**粒子**：
- 减少大面积粒子、缩小尺寸

> 记忆：**Overdraw = 一个像素被涂了几遍**，越少越省 GPU。