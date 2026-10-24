---
title: AssetBundle 依赖、冗余与卸载
date: 2026-09-24
category: 资源管理
tags: [AssetBundle, 依赖, 冗余]
icon: fas fa-project-diagram
difficulty: 3
---

## 结论

AssetBundle 之间会共享资源。如果共享资源没有被提取到公共依赖包，就会被重复打进多个包，造成包体冗余和内存重复加载。

## 关键点

- 使用 `AssetBundleManifest` 查询依赖
- 加载资源前先加载其所有依赖包
- 公共资源单独打包，避免重复
- 通过构建报告分析包体与依赖关系

## 卸载

```csharp
bundle.Unload(false); // 卸载 bundle 自身，已加载的 Assets 保留
bundle.Unload(true);  // 连同已加载 Assets 一起卸载，风险高
```

- `Unload(true)` 可能让正在使用的资源变成 Missing
- 推荐引用计数归零后再卸载
- 切换场景后配合 `Resources.UnloadUnusedAssets`

## 常见错误

- 只加载主包，不加载依赖
- 多个包重复包含同一图集
- 资源还在使用就强制卸载
- 循环依赖导致加载顺序异常

> 记忆：**先查依赖再加载，先减计数再卸载。**
