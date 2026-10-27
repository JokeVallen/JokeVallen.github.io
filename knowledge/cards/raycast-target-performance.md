---
title: Raycast Target 会参与 UI 射线检测
date: 2026-09-24
category: Unity
tags: [UGUI, 射线检测, 性能]
icon: fas fa-mouse-pointer
difficulty: 2
---

## 结论

`Graphic.raycastTarget = true` 的 UI 元素都会参与 `GraphicRaycaster` 的射线检测。

纯装饰性的 `Image`、`Text`、背景图通常不需要响应点击，应关闭 `Raycast Target`。

## 代价

- 每次点击、拖拽都会遍历所有可接收射线的 Graphic
- 复杂界面可能产生大量射线检测与排序
- 全屏透明阻挡层也应只保留一个，不要叠加多个

## 实践

- 交互按钮的子文本关闭 `Raycast Target`
- 用 `CanvasGroup.blocksRaycasts` 统一控制一组 UI 的射线
- 需要拦截点击时使用一个透明 `Image`
- 自定义 `ICanvasRaycastFilter` 可以精确限制点击区域

> 记忆：**只让真正需要响应的元素参与射线检测。**
