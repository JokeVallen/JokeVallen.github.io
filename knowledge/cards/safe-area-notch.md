---
title: SafeArea 处理刘海屏与异形屏
date: 2026-09-24
category: Unity
tags: [移动端, 刘海屏, 适配]
icon: fas fa-mobile-alt
difficulty: 2
---

## 结论

`Screen.safeArea` 返回当前屏幕可安全显示内容的矩形区域，单位是像素。把 UI 根节点的锚点映射到这个矩形，就能避开刘海、挖孔和圆角。

## 做法

- 让背景层铺满全屏
- 让内容根节点根据 `Screen.safeArea` 设置 `anchorMin` 和 `anchorMax`
- 分辨率、方向变化时重新计算
- 上下左右留白分别处理，不要只做顶部

## 常见坑

- 只处理 iPhone，不处理 Android 挖孔屏
- 用硬编码固定偏移，换机型就失效
- 安全区节点和 CanvasScaler 同时缩放导致偏移翻倍
- 横竖屏切换后没有刷新

## 验证

在 Editor 中模拟不同 Game 视图分辨率，并在真机检查刘海、圆角和手势条区域。

> 记忆：**背景铺满屏，内容放进 SafeArea。**
