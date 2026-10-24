---
title: 纹理压缩与 Mipmap 取舍
date: 2026-09-24
category: 资源管理
tags: [纹理, ASTC, Mipmap]
icon: fas fa-image
difficulty: 3
---

## 结论

纹理设置直接影响包体、内存带宽和渲染质量。移动端优先 ASTC，桌面端可用 BC；UI 与 3D 场景的取舍不同。

## 压缩格式

- Android：ASTC，低端机可回退 ETC2
- iOS：ASTC 或 PVRTC
- PC：DXT/BC 系列
- 带 Alpha 的 UI 要确认压缩后边缘是否出现色块

## Mipmap

- 3D 模型、会缩小的场景纹理建议开启
- 固定屏幕大小的 UI 通常不需要
- 开启 Mipmap 会增加约 1/3 内存
- 关闭 Read/Write 可以减少一份 CPU 内存副本

## 其他

- 非 2 的幂尺寸可能影响压缩与采样
- 合理设置 Max Size，避免 4K 图直接进手机
- 颜色空间、sRGB 与线性空间会影响最终亮度
- 用 Memory Profiler 检查纹理实际占用

> 记忆：**压缩看平台，Mipmap 看是否缩小，Read/Write 默认关闭。**
