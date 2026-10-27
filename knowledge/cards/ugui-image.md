---
title: UGUI Image 组件
date: 2026-09-23
category: Unity
tags: [Unity, UGUI, Image]
icon: fas fa-image
difficulty: 1
---

## 定义

`Image` 是 UGUI 中用于显示 Sprite 的图形组件，支持简单、九宫格、平铺和填充等显示方式。

## 核心属性

| 属性 | 作用 |
|---|---|
| `Source Image` | 要显示的 Sprite |
| `Image Type` | Simple、Sliced、Tiled、Filled |
| `Preserve Aspect` | 是否保持原始宽高比 |
| `Fill Method` | 填充模式，用于进度条 |
| `Raycast Target` | 是否接收 UI 点击 |

## 代码示例

```csharp
using UnityEngine.UI;

var image = GetComponent<Image>();
image.sprite = Resources.Load<Sprite>("UI/Icon");
image.type = Image.Type.Sliced;
```

## 适用场景

- 按钮、图标、背景、进度条等常规 UI。
- 需要九宫格拉伸或填充动画的界面元素。

## 常见坑

- `Image` 显示的是 Sprite，不是 Texture2D；Texture 应使用 `RawImage`。
- 九宫格需要 Sprite 设置好 Border，否则 Sliced 效果不正确。
- 不需要点击的装饰图应关闭 `Raycast Target` 以降低事件检测开销。

## 补充要点

- `Image` 可以与 `Button`、`Toggle` 等 Selectable 组件配合。
- 九宫格可让圆角按钮在拉伸时保持边角不变形。
- 填充模式常用于技能冷却、血条和进度条。

- 关闭不需要的 `Raycast Target` 可以减少 UI 事件检测开销。

- 九宫格 Sprite 需要正确设置 Border，否则拉伸效果会失真。

> 记忆：**Image 显示 Sprite，支持九宫格和填充；要 Texture 用 RawImage。**
