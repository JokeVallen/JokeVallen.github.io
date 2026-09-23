---
title: SetPass Call
date: 2026-09-22
category: 图形性能
tags: [渲染, DrawCall, 合批, 性能]
icon: fas fa-layer-group
difficulty: 2
---

一帧内**渲染状态（Shader Pass / 材质）切换的次数**。每次切换都要重新设置一组 GPU 状态，是 CPU 端的重要开销。

## 三个概念

| 概念 | 含义 |
|---|---|
| DrawCall | 一次绘制命令 |
| Batch | 相同状态的对象合并成一批 |
| SetPass Call | 切换 Shader Pass / 材质的次数 |

一个 SetPass 下可以有**多个 DrawCall**（共享同一材质）。

## 在哪看

Game View 的 Stats 面板、Profiler 的 Rendering、Frame Debugger。

## 优化手段

- 减少材质种类
- 图集（Sprite Atlas），让多图共享材质
- GPU Instancing 合批相同网格
- SRP Batcher（URP/HDRP）
- 静态/动态合批

> 记忆：**DrawCall 看"画多少次"，SetPass 看"换多少次状态"。**