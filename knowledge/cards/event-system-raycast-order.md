---
title: EventSystem 射线检测与事件顺序
date: 2026-09-24
category: Unity
tags: [UGUI, EventSystem, 输入]
icon: fas fa-mouse-pointer
difficulty: 2
---

## 结论

UI 点击由 `EventSystem` 驱动：输入模块产生指针事件，`BaseRaycaster` 收集命中结果，再按深度排序后派发给最上层对象。

## 决定命中顺序的因素

- Canvas 的 `Sorting Order` 和层级
- `GraphicRaycaster` 的 `Blocking Objects`
- Graphic 的 `raycastTarget`
- `CanvasGroup.blocksRaycasts`
- 元素的渲染深度与层级顺序

## 常见问题

- 装饰图片忘记关闭 `raycastTarget`，挡住按钮
- 两层全屏遮罩同时存在，点击被错误拦截
- 自定义 `ICanvasRaycastFilter` 返回错误结果
- 输入模块与新版 Input System 不匹配
- 事件被上层透明面板吃掉，却以为是业务逻辑问题

## 排查

用 EventSystem 调试、Frame Debugger 和层级检查定位；必要时重写 `GraphicRaycaster` 或自定义射线过滤。

> 记忆：**UI 点击先看谁最上层、谁能被射线命中。**
