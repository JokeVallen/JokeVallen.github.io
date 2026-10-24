---
title: CanvasGroup 的三个核心属性
date: 2026-09-24
category: Unity
tags: [UGUI, CanvasGroup, 交互]
icon: fas fa-adjust
difficulty: 2
---

## 结论

`CanvasGroup` 用来统一控制一组 UI 的透明度与交互：

| 属性 | 作用 |
|---|---|
| `alpha` | 影响组内所有 Graphic 的最终透明度 |
| `interactable` | 控制组内 Selectable 是否可交互 |
| `blocksRaycasts` | 控制组内元素是否接收射线 |

## 用途

- 淡入淡出弹窗
- 打开面板时禁止点击下层 UI
- 加载中禁用按钮但保持显示
- 避免用 `SetActive(false)` 打断动画或状态

## 注意

- `alpha` 改变仍可能触发 Graphic 重建，不要每帧随意改
- `blocksRaycasts = false` 不等于视觉隐藏
- `interactable = false` 只影响 Selectable，不影响自定义点击逻辑
- `ignoreParentGroups` 可以跳过父级 CanvasGroup

> 记忆：**透明度看 alpha，可交互看 interactable，射线看 blocksRaycasts。**
