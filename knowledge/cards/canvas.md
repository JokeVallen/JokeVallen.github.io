---
title: UGUI Canvas 组件
date: 2026-09-23
category: Unity
tags: [Unity, UGUI, Canvas]
icon: fas fa-image
difficulty: 1
---

## 定义

`Canvas` 是 UGUI 的根组件，所有 UI 元素都必须放在 Canvas 下，它负责 UI 的布局、渲染模式和缩放策略。

## Render Mode

| 模式 | 特点 |
|---|---|
| Screen Space - Overlay | 永远覆盖在屏幕上，适合大多数 UI |
| Screen Space - Camera | 由指定相机渲染，可受相机参数影响 |
| World Space | UI 作为世界空间中的对象，可用于 3D 界面 |

## 常见子组件

- `Canvas Scaler`：控制 UI 缩放和参考分辨率。
- `Graphic Raycaster`：处理 UI 点击射线检测。
- `Layout Group`：自动排列子元素。

## 常见坑

- 频繁修改 Canvas 下的元素会触发重建，应拆分动态和静态 UI。
- `Screen Space - Overlay` 不受相机影响，不能插入 3D 物体之间。
- 多层 Canvas 可通过 `Sort Order` 控制渲染顺序。

## 补充要点

- Canvas 重建分为布局重建和图形重建，修改尺寸和修改顶点会触发不同流程。
- UI 元素应尽量放在相同 Canvas 下，减少材质和纹理切换。
- 嵌套 Canvas 可以隔离重建范围，但会增加批次管理复杂度。

> 记忆：**Canvas 是 UI 根节点；渲染模式定层级，Scaler 管缩放。**
