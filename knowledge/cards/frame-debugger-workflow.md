---
title: Frame Debugger 定位渲染批次
date: 2026-09-26
category: 性能优化
tags: [Frame Debugger, DrawCall, 渲染]
icon: fas fa-bug
difficulty: 2
---

## 结论

Frame Debugger 可以逐 DrawCall 查看当前帧的渲染过程，是定位合批打断、状态切换和多余渲染的首选工具。

## 使用步骤

1. 在目标场景点击 `Capture` 抓取一帧
2. 按渲染顺序查看每个 DrawCall
3. 观察 `SetPass Calls`、Shader、材质、纹理
4. 找到批次被打断或重复绘制的位置
5. 回到场景调整层级、图集或材质

## 常见发现

- 同一个 UI 图集被其他材质穿插
- Mask 或后处理导致额外 Pass
- 透明物体排序错误
- 阴影、深度、法线 Pass 过多
- 粒子与 UI 交替渲染

## 注意

Frame Debugger 看的是渲染提交，不能替代 CPU Profiler；两者要结合使用。

> 记忆：**Frame Debugger 看“画了什么”，Profiler 看“谁在耗时”。**
