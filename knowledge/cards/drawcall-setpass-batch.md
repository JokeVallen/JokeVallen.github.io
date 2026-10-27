---
title: DrawCall、SetPass 与 Batch 的关系
date: 2026-09-26
category: 性能优化
tags: [DrawCall, SetPass, 合批]
icon: fas fa-layer-group
difficulty: 3
---

## 结论

| 概念 | 含义 |
|---|---|
| DrawCall | CPU 向 GPU 提交一次绘制 |
| SetPass | 切换一次渲染状态/Pass |
| Batch | 合批后的绘制批次 |

一个 SetPass 可能对应多个 DrawCall，因为多个对象可以共用同一套渲染状态。

## 优化方向

- 静态合批：静态物体合并成大网格
- 动态合批：小网格自动合并，限制较多
- GPU Instancing：相同 Mesh/Material 批量绘制
- SRP Batcher：减少材质属性设置开销
- 图集：减少纹理切换

## 注意

- DrawCall 低不一定快，SetPass 和状态切换同样重要
- 半透明排序、Mask、后处理都会影响批次
- 用 Frame Debugger 看批次为什么被打断

> 记忆：**DrawCall 看提交次数，SetPass 看状态切换，Batch 看合批结果。**
