---
title: Unity Sprite 精灵
date: 2026-09-23
category: Unity
tags: [Unity, Sprite, 2D]
icon: fas fa-image
difficulty: 1
---

## 定义

`Sprite` 是 Unity 中用于 2D 渲染的图像资源，包含 Texture 引用、矩形区域、Pivot、Pixels Per Unit 和边框等信息。

## 核心组成

| 属性 | 作用 |
|---|---|
| Texture | 底层纹理 |
| Rect | 在纹理中的矩形区域 |
| Pivot | 旋转和缩放中心 |
| Pixels Per Unit | 像素与世界单位的换算比例 |
| Border | 九宫格边框 |
| Warp / Tiling | 平铺和拉伸模式 |

## 使用方式

```csharp
var sprite = Sprite.Create(texture, new Rect(0, 0, 64, 64), new Vector2(0.5f, 0.5f), 100f);
GetComponent<SpriteRenderer>().sprite = sprite;
```

## 常见坑

- 修改 Texture 不会自动更新 Sprite 的 Rect 和 Pivot。
- 图集打包后 Sprite 的 Texture 可能变化，不要硬编码纹理坐标。
- `Pixels Per Unit` 会影响世界空间中的显示大小。

## 补充要点

- `SpriteRenderer` 负责在 2D 场景中显示 Sprite。
- 图集把多个 Sprite 合并到同一纹理，可减少 Draw Call。
- Sprite Atlas 可在不同分辨率下按质量选择图集。
- 九宫格 Sprite 的 Border 必须小于纹理尺寸。
- Pivot 会影响旋转和缩放中心，设置错误会看起来偏移。
- 动态生成 Sprite 时要注意纹理是否可读写。

- Sprite 可以设置 Mesh Type 为 Full Rect 或 Tight，以权衡顶点数和透明度裁剪。

> 记忆：**Sprite 等于 Texture 加区域、Pivot 和 PPU，是 2D 显示的基本单位。**
