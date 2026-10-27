---
title: Canvas 合批与常见打断原因
date: 2026-09-24
category: Unity
tags: [UGUI, 合批, DrawCall]
icon: fas fa-layer-group
difficulty: 3
---

## 结论

UGUI 合批不是「同图集就一定合」，而是相邻的 UI 元素满足以下条件才可能进入同一批：

- 使用相同材质与纹理
- 使用相同的渲染状态
- 处于同一个 Canvas 下
- 中间没有打断合批的元素

## 常见打断原因

- 更换材质或 Shader
- 更换纹理图集，例如 TMP 字体图集与 UI 图集不同
- 插入 `Mask`，Stencil 会改变渲染状态
- Canvas 的 `Sorting Order`、`Override Sorting` 不同
- 中间夹了其他 Canvas 或粒子、模型等渲染对象
- `Pixel Perfect`、自定义材质等改变渲染状态

## 优化

- 合并图集，减少纹理切换
- 同一弹窗尽量使用同一材质
- 用 Frame Debugger 查看每个 Batch 被打断的位置
- 不要把全屏背景图放在动态 UI 中间

> 记忆：**合批看的是「相邻 + 同状态 + 同纹理」，不是只看图集。**
