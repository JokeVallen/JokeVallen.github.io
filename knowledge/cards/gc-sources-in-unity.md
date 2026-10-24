---
title: Unity 常见 GC 分配来源
date: 2026-09-26
category: 性能优化
tags: [GC, 托管堆, 优化]
icon: fas fa-trash-alt
difficulty: 2
---

## 结论

Unity 的 GC 卡顿通常来自热点路径上的托管堆分配，而不是偶尔一次 `new`。

## 常见来源

- 字符串拼接、`ToString`、`string.Format`
- LINQ、Lambda 闭包捕获
- 装箱，例如把 struct 赋给 object 或接口
- `params` 数组、每次返回新数组的 API
- 协程迭代器、`yield return new WaitForSeconds`
- `GetComponents`、`Camera.main` 等重复查找
- TMP 每帧赋新字符串
- 事件订阅时创建委托

## 优化

- 缓存组件与字符串
- 用 `NonAlloc` API
- 用对象池与 `StringBuilder`
- 热点路径避免 LINQ 和闭包
- 用 Profiler 的 `GC Alloc` 定位具体行

> 记忆：**GC 优化不是少 new，而是热点路径零分配。**
