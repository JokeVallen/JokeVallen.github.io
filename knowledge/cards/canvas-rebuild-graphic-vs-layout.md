---
title: Canvas 重建分为 Graphic 与 Layout
date: 2026-09-24
category: Unity
tags: [UGUI, Canvas, 重建]
icon: fas fa-layer-group
difficulty: 3
---

## 结论

UGUI 的重建分为两类：

| 类型 | 触发 | 影响 |
|---|---|---|
| Layout Rebuild | 尺寸、锚点、布局组件变化 | 重新计算 LayoutGroup、ContentSizeFitter 等 |
| Graphic Rebuild | 顶点、材质、颜色变化 | 重建 CanvasRenderer 的网格与材质数据 |

`SetLayoutDirty` 只标记布局脏；`SetVerticesDirty` 标记图形网格脏。布局重建后通常还会连带触发 Graphic 重建。

## 常见触发

- 修改 `RectTransform` 的尺寸、锚点或 `LayoutElement`
- 修改 `Image.sprite`、`color`、`fillAmount`
- 文本内容变化
- 启用、禁用子物体导致布局变化

## 优化

- 把频繁变化的 UI 拆到独立 Canvas，缩小重建范围
- 能改颜色就不要每帧改尺寸
- 静态 UI 与动态 UI 分离
- 用 Profiler 的 `Canvas.BuildBatch`、`Canvas.SendWillRenderCanvases` 定位热点

> 记忆：**改布局会连带改图形；缩小 Canvas 范围就是缩小重建代价。**
