---
title: Profiler 排查先分 CPU GPU 内存
date: 2026-09-26
category: 性能优化
tags: [Profiler, 性能, 排查]
icon: fas fa-tachometer-alt
difficulty: 2
---

## 结论

性能问题不要靠猜。先用 Profiler 判断瓶颈在 CPU、GPU、GC 还是内存，再进入具体系统。

## CPU

- 看 `CPU Usage` 的 Timeline 与 Hierarchy
- 关注 `GC Alloc` 列，而不只是耗时
- 区分主线程、渲染线程、Job、Physics、Animation

## GPU

- 用 Frame Debugger 看 DrawCall 与批次
- 用 GPU Profiler 看渲染阶段耗时
- 关注 Overdraw、后处理、阴影、透明物体

## Memory

- 用 Memory Profiler 抓快照并对比
- 区分托管堆、Native、纹理、Mesh、Audio
- 看引用链而不是只看总量

## 建议

先录一段可复现场景，再对比优化前后同一段数据；不要只看 Editor，最终以真机为准。

> 记忆：**先定位瓶颈类型，再优化具体系统。**
