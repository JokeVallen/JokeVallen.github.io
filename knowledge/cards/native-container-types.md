---
title: NativeContainer 的主要容器类型
date: 2026-09-23
category: Unity
tags: [NativeList, NativeHashMap, NativeQueue]
icon: fas fa-sitemap
difficulty: 2
---

## 结论

`NativeArray` 只是起点。`Unity.Collections` 包提供多种 `NativeContainer`，覆盖不同数据结构需求。

## 类型对比

| 类型 | 等价托管类型 | 特点 |
|---|---|---|
| `NativeArray<T>` | `T[]` | 固定大小，连续内存 |
| `NativeList<T>` | `List<T>` | 可动态扩容 |
| `NativeHashMap<K,V>` | `Dictionary<K,V>` | 键值对，快速查找 |
| `NativeQueue<T>` | `Queue<T>` | 先进先出 |
| `NativeSlice<T>` | 无 | NativeArray 的视图，不拥有内存 |

## Native- 与 Unsafe- 的关系

`NativeList` 本质上是 `UnsafeList` 加上安全检查的封装[reference:6]。

- **关闭安全检查后**，两者性能**无显著差异**。
- `Native-` 类型不能嵌套 `Native-` 类型（如 `NativeList<NativeList<T>>` 不允许），需要嵌套时用 `Unsafe-` 版本[reference:7]。

## 注意

- `NativeSlice` 不拥有内存，原 `NativeArray` 释放后即失效。
- 安全检查只在编辑器和 Play Mode 生效，发布版本无越界检查。

> 记忆：**NativeArray 固定，NativeList 可扩容，NativeHashMap 查键值；Native- 带安全检查，Unsafe- 不带。**