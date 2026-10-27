---
title: 图形 API 与图形后端
date: 2026-09-23
category: 图形性能
tags: [图形API, DirectX, OpenGL, Vulkan]
icon: fas fa-layer-group
difficulty: 3
---

## 定义

图形 API 是应用程序与 GPU 驱动之间的接口，负责提交绘制命令、管理资源和配置渲染状态。常见 API 包括 DirectX、OpenGL、Vulkan、Metal 和 WebGPU。

## 常见 API 对比

| API | 平台 | 特点 |
|---|---|---|
| DirectX 11/12 | Windows、Xbox | Windows 平台主流，D3D12 更底层 |
| OpenGL | 跨平台 | 兼容性好，状态机模型 |
| OpenGL ES | 移动端 | 移动设备常用 |
| Vulkan | 跨平台 | 显式控制、低开销 |
| Metal | Apple 平台 | Apple 生态专用 |
| WebGPU | 浏览器 | 现代 Web 图形接口 |

## Unity 的抽象

Unity 通过图形抽象层屏蔽平台差异，同一份 Shader 可编译到不同后端。开发者仍需关注平台纹理格式、精度和特性支持差异。

## 常见坑

- 不同 API 的坐标系、裁剪空间和纹理原点可能不同。
- 低层 API 性能更高，但资源同步和内存管理更复杂。
- 移动端应优先考虑兼容性和带宽，而不是盲目使用桌面级特性。

## 补充要点

- Shader 通常跨 API 编写，再由引擎编译到目标后端。
- 低层 API 需要手动管理命令缓冲、同步和内存。
- 兼容性测试应覆盖目标平台和图形 API。

> 记忆：**API 是应用与 GPU 的桥；平台不同，特性与坐标约定也不同。**
