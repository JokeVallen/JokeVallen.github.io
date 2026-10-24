---
title: TMP SDF 图集与动态字体
date: 2026-09-24
category: Unity
tags: [TextMeshPro, SDF, 字体图集]
icon: fas fa-font
difficulty: 3
---

## 结论

TextMeshPro 使用 SDF 字体资产渲染文字。字体图集保存的是字形距离场，不是普通位图；图集尺寸和字符集决定了运行时是否还需要动态扩图。

## 关键点

- 静态图集只包含预先生成的字符，缺字会触发动态图集
- 动态图集会增长，扩容时可能产生 CPU 峰值与图集重建
- 多语言项目应预生成常用字符集，并配置 Fallback
- 不同字重、斜体通常对应不同字体资产
- 频繁改文本会触发 `Canvas.SendWillRenderCanvases`

## 减少开销

- 中文 UI 用固定字符集预生成，避免运行时随机缺字
- 对频繁更新的数字文本使用 `SetText` 等低分配接口
- 不要在 `Update` 中每帧给文本赋新字符串
- 用 TMP 的 Atlas Population 和 Frame Debugger 检查图集切换

> 记忆：**TMP 的性能核心是字形图集，不是文字长度。**
