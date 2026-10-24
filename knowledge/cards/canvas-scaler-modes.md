---
title: Canvas Scaler 三种缩放模式
date: 2026-09-24
category: Unity
tags: [UGUI, 适配, CanvasScaler]
icon: fas fa-expand-arrows-alt
difficulty: 2
---

## 结论

| 模式 | 行为 | 适用 |
|---|---|---|
| Constant Pixel Size | UI 尺寸不随分辨率变化 | 工具、调试界面 |
| Scale With Screen Size | 按参考分辨率等比缩放 | 移动端、多数游戏 UI |
| Constant Physical Size | 按物理尺寸缩放 | 需要固定物理大小的界面 |

## Scale With Screen Size

- 设置 `Reference Resolution`，例如 1920×1080
- `Match Width Or Height` 决定宽高哪个优先
- `Match = 0` 偏重宽度，`1` 偏重高度，`0.5` 折中
- 横屏游戏常用宽度优先或 0.5，竖屏常用高度优先

## 注意

- Canvas Scaler 解决的是缩放，不解决刘海屏和异形屏
- 安全区仍需用 `Screen.safeArea` 单独处理
- 不要运行时频繁修改参考分辨率

> 记忆：**CanvasScaler 管缩放，SafeArea 管可用区域。**
