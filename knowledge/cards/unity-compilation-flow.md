---
title: Unity 代码的编译流程
date: 2026-09-23
category: Unity
tags: [Unity, 编译, 程序集]
icon: fas fa-code
difficulty: 3
---

## 定义

Unity 使用 Roslyn 将 C# 脚本编译成托管程序集。编辑器下通常先编译成 DLL，再由 Mono 运行时加载；构建播放器时则根据脚本后端选择 Mono 或 IL2CPP。

## 主要阶段

1. 导入并分析脚本，确定程序集归属。
2. Roslyn 编译 C# 源码为 IL 和元数据。
3. 生成 `Assembly-CSharp.dll`、`Assembly-CSharp-Editor.dll` 等程序集。
4. 编辑器触发域重载，重新加载程序集和场景状态。
5. 构建播放器时，根据 Scripting Backend 走 Mono 或 IL2CPP。

## 程序集划分

| 程序集 | 内容 |
|---|---|
| `Assembly-CSharp` | 普通运行时脚本 |
| `Assembly-CSharp-Editor` | `Assets/Editor` 下的编辑器脚本 |
| `.asmdef` 程序集 | 自定义程序集，减少编译和依赖 |

## 常见坑

- 编辑器脚本不能打进播放器程序集，需放在 `Editor` 文件夹或 asmdef 中。
- 脚本编译失败时，Unity 会保留上一次成功编译的程序集。
- 修改脚本触发域重载，可能造成运行时状态丢失。

> 记忆：**Roslyn 编 IL，程序集分运行时与编辑器；构建再选 Mono 或 IL2CPP。**
