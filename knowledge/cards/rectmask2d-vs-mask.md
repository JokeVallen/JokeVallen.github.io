---
title: RectMask2D 与 Mask 的取舍
date: 2026-09-24
category: Unity
tags: [UGUI, Mask, 裁剪]
icon: fas fa-crop-alt
difficulty: 2
---

## 结论

| 组件 | 原理 | 适用 |
|---|---|---|
| `RectMask2D` | 矩形裁剪，不依赖 Stencil | 滚动列表、矩形区域 |
| `Mask` | Stencil 模板测试，可配合 Sprite 的 Alpha | 非矩形、异形裁剪 |

## RectMask2D

- 更轻量，通常不会额外打断合批
- 只能做轴对齐矩形裁剪
- 不能做旋转、圆形、图片 Alpha 裁剪

## Mask

- 可以使用 Sprite 的 Alpha 通道做异形遮罩
- 会使用 Stencil，增加渲染状态切换
- 子元素可能被拆成额外批次

## 实践

滚动列表、弹窗裁剪优先用 `RectMask2D`；只有真正需要异形遮罩时才用 `Mask`。

> 记忆：**矩形裁剪用 RectMask2D，异形裁剪才用 Mask。**
