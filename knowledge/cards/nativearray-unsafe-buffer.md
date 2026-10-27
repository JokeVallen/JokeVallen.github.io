---
title: NativeArray 是非托管内存的托管封装
date: 2026-09-23
category: Unity
tags: [NativeArray, 非托管内存, Job System]
icon: fas fa-sitemap
difficulty: 1
---

## 结论

`NativeArray<T>` 是 Unity 对**非托管内存**的托管 C# 封装器，用于在托管代码与原生内存之间共享数据，**无编组（Marshalling）开销**。

## 核心特性

| 特性 | 说明 |
|---|---|
| 内存位置 | 非托管堆，不受 GC 管理 |
| 线程安全 | 与 Job System 搭配时，通过安全系统检测竞争 |
| 生命周期 | 需手动 `Dispose()`，否则内存泄漏 |
| 数据共享 | Job 可直接访问主线程数据，而非副本 |

## 为什么用它

传统 C# 数组在传递给原生代码时需要**固定（Pin）** 或**复制**。`NativeArray` 暴露的是原生缓冲区指针，原生代码可直接读写，无需额外开销。

```csharp
// 托管数组 → NativeArray 需要复制
int[] managed = { 1, 2, 3 };
var native = new NativeArray<int>(managed, Allocator.Persistent);
// 原生代码可直接通过指针访问 native
```

## 注意

- `NativeArray` 是**值类型（struct）**，赋值时复制的是结构体（含指针），而非底层数据。
- 索引访问元素时，若 `T` 是结构体，返回的是**副本**，不是引用。

> 记忆：**NativeArray = 原生内存的托管封装，无编组开销，Job 可共享数据，用完必须 Dispose。**