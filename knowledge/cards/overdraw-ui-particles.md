---
title: Overdraw 主要来自透明叠加
date: 2026-09-26
category: 性能优化
tags: [Overdraw, UI, 粒子]
icon: fas fa-clone
difficulty: 2
---

## 结论

Overdraw 是同一像素被多次绘制。半透明 UI、全屏背景、粒子和重叠模型都会增加 GPU 填充率压力。

## UI 常见来源

- 全屏半透明背景叠在另一个全屏背景上
- 大量重叠的装饰图片
- 未裁剪的 ScrollRect 内容
- 多层弹窗与遮罩
- 透明文字与阴影叠加

## 粒子常见来源

- 大量大面积透明粒子
- 粒子和 UI 重叠
- 未做距离剔除或 LOD

## 优化

- 关闭不必要的透明层
- 用 RectMask2D 裁剪
- 合并背景，减少全屏叠加
- 粒子使用更小面积与更少数量
- 用 Overdraw 视图或 GPU Profiler 检查

> 记忆：**Overdraw 是填充率问题，越透明越要小心重叠。**
