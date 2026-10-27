---
title: SpriteAtlas 图集策略与变体
date: 2026-09-24
category: 资源管理
tags: [图集, SpriteAtlas, 合批]
icon: fas fa-th
difficulty: 2
---

## 结论

SpriteAtlas 把多张小图打包成一张大图，减少纹理切换和 DrawCall。图集不是越大越好，需要按使用场景和分辨率划分。

## 策略

- 按 UI 模块或生命周期划分图集，避免整包一张巨图
- 常驻 UI 与低频弹窗分开
- 使用 Atlas Variant 适配不同分辨率设备
- 注意 `Include in Build`、Late Binding 和资源引用关系
- 图集尺寸受平台最大纹理尺寸限制

## 常见坑

- 图片既单独引用又被图集包含，导致重复打包
- 图集频繁切换，合批反而被打断
- 图集过大导致加载和内存峰值
- 透明边缘没有留 Padding，出现接缝

## 验证

用 Frame Debugger 看纹理切换，用构建报告看图集是否重复，用 Memory Profiler 看图集常驻内存。

> 记忆：**图集按使用场景拆，不为合批而无限合并。**
