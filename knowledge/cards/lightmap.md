---
title: Unity Lightmap 光照贴图
date: 2026-09-23
category: Unity
tags: [Unity, Lightmap, 全局光照]
icon: fas fa-layer-group
difficulty: 3
---

## 定义

Lightmap 是烘焙好的光照纹理，保存静态物体的直接和间接光照信息，运行时由着色器采样，避免实时计算全局光照。

## 核心概念

| 概念 | 说明 |
|---|---|
| Baked GI | 烘焙全局光照，运行时开销低 |
| Realtime GI | 实时计算间接光，开销高 |
| Lightmap UV | 模型第二套 UV，供光照贴图使用 |
| Light Probes | 为动态物体提供间接光采样 |
| Reflection Probes | 提供反射环境信息 |

## 工作流程

1. 把静态物体标记为 `Contribute GI`。
2. 生成或导入 Lightmap UV。
3. 在 Lighting 窗口配置光照参数并烘焙。
4. 运行时着色器根据 Lightmap UV 采样光照。

## 常见坑

- 动态物体不能直接使用静态 Lightmap，需要 Light Probes。
- 修改场景或灯光后需重新烘焙，否则光照会不一致。
- Lightmap 分辨率过高会显著增加烘焙时间和显存占用。

## 补充要点

- 静态物体的 Lightmap UV 通常由 Unity 自动生成，也可手动制作。
- 混合光照模式可以把实时直接光和烘焙间接光结合。
- 移动端应控制 Lightmap 数量和分辨率，避免显存和带宽压力。

> 记忆：**静态光照烘焙成贴图，运行时采样；动态物体靠 Light Probes。**
