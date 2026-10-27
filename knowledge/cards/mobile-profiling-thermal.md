---
title: 真机性能要关注发热与降频
date: 2026-09-26
category: 性能优化
tags: [真机, 发热, Profiling]
icon: fas fa-mobile-alt
difficulty: 2
---

## 结论

Editor 跑得顺不代表真机没问题。移动端还要考虑 CPU/GPU 差异、内存带宽、发热降频和电池策略。

## 测试方法

- 用 Development Build + Autoconnect Profiler
- 覆盖低端、中端、高端机型
- 做 15~30 分钟持续运行测试
- 记录帧时间、GC、内存、温度、电量
- 对比冷启动、战斗、UI 密集场景

## 常见现象

- 前几分钟流畅，之后因发热降频掉帧
- 内存缓慢上涨，最终被系统杀进程
- GPU 填充率瓶颈在 Editor 看不出来
- 真机分辨率与 UI 适配问题

## 建议

使用帧时间百分位（如 95/99 分位）而不是只看平均 FPS。

> 记忆：**真机性能看持续表现，不看 Editor 瞬时帧率。**
