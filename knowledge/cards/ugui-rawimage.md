---
title: UGUI RawImage 组件
date: 2026-09-23
category: Unity
tags: [Unity, UGUI, RawImage]
icon: fas fa-image
difficulty: 1
---

## 定义

`RawImage` 是 UGUI 中直接显示 `Texture` 的组件，不依赖 Sprite，支持 UV Rect，适合显示 RenderTexture 或网络图片。

## 与 Image 对比

| 维度 | Image | RawImage |
|---|---|---|
| 显示源 | Sprite | Texture |
| 九宫格 | 支持 | 不支持 |
| 填充 | 支持 | 不支持 |
| UV 控制 | 无 | 支持 UV Rect |
| 典型用途 | 常规 UI、图标 | RenderTexture、视频、动态贴图 |

## 代码示例

```csharp
using UnityEngine.UI;

var raw = GetComponent<RawImage>();
raw.texture = renderTexture;
raw.uvRect = new Rect(0, 0, 1, 1);
```

## 常见坑

- `RawImage` 不做图集优化，大量使用时要注意 Draw Call 和内存。
- 修改 `uvRect` 可用于滚动或帧动画，但需要手动控制。
- 需要九宫格、填充或 Sprite 图集时应优先使用 `Image`。

## 补充要点

- RenderTexture 可把相机画面渲染到 RawImage，用于小地图或监控画面。
- 网络图片下载后可创建 Texture2D 并赋给 RawImage。
- UV Rect 可用于滚动背景、序列帧和裁剪显示区域。
- RawImage 不参与 Image 的图集和九宫格机制。

- 在 UGUI 中显示视频或相机画面时，RawImage 往往比 Image 更直接。
- 修改 UV 时要注意坐标原点和纹理翻转设置。

> 记忆：**RawImage 直接显示 Texture，可调 UV；Image 显示 Sprite，功能更 UI 化。**
