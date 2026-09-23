---
title: Unity Texture 纹理
date: 2026-09-23
category: Unity
tags: [Unity, Texture, GPU资源]
icon: fas fa-image
difficulty: 2
---

## 定义

`Texture` 是保存在 GPU 中的图像数据资源，常见的 `Texture2D`、`RenderTexture`、`Cubemap` 都属于纹理，但纹理本身不能直接作为 UI 精灵显示。

## 常见类型

| 类型 | 用途 |
|---|---|
| `Texture2D` | 普通二维贴图 |
| `RenderTexture` | 渲染目标，可被相机写入 |
| `Cubemap` | 天空盒和反射 |
| `Texture3D` | 体纹理 |

## 核心设置

- `Wrap Mode`：重复、钳制或镜像。
- `Filter Mode`：点采样、双线性或三线性。
- `Mip Maps`：多级渐远纹理，提升远处采样质量。
- `Format`：压缩格式，影响显存和精度。

## 常见坑

- CPU 侧修改 `Texture2D` 后需要 `Apply()` 才会上传 GPU。
- `RenderTexture` 使用后应释放，避免显存泄漏。
- 压缩格式选择错误会导致 UI 失真或内存浪费。

## 补充要点

- `Texture2D` 支持 `SetPixel`、`SetPixels` 和 `Apply` 批量修改。
- 纹理压缩可减少显存和带宽，但可能增加失真。
- 可读纹理会额外占用内存，运行时不需要读取时应关闭 Read/Write。

- 纹理导入设置会影响平台压缩、Mipmap 和最大尺寸。

> 记忆：**Texture 是 GPU 图像数据；Sprite 是它的 2D 使用封装。**
