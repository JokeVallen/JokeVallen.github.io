---
title: ContentSizeFitter 循环重建的成因
date: 2026-09-24
category: Unity
tags: [UGUI, Layout, 重建]
icon: fas fa-sync-alt
difficulty: 3
---

## 结论

`ContentSizeFitter` 会根据子元素尺寸反向撑开父物体，而 `LayoutGroup` 又可能根据父物体尺寸重新排列子元素。两者互相依赖时，容易产生多轮 Layout Rebuild，甚至出现抖动或死循环。

## 常见场景

- 父物体同时挂 `VerticalLayoutGroup` 和 `ContentSizeFitter`
- 子物体挂 `LayoutElement`，又依赖父物体尺寸
- 文本内容每帧变化，触发尺寸变化
- 在 `Update` 中调用 `SetLayoutDirty` 或修改尺寸

## 处理方式

- 能用固定尺寸就不要用 `ContentSizeFitter`
- 只开启需要的方向，例如只 `verticalFit = PreferredSize`
- 避免父子布局互相依赖
- 在数据变化后统一标记重建，而不是每帧重建
- 用 Profiler 观察 `LayoutRebuild` 是否反复出现

> 记忆：**布局组件互相依赖，就会反复重建。**
