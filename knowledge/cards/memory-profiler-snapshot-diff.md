---
title: Memory Profiler 快照对比找泄漏
date: 2026-09-26
category: 性能优化
tags: [Memory Profiler, 内存, 泄漏]
icon: fas fa-microchip
difficulty: 3
---

## 结论

定位内存泄漏不要只看总内存曲线，而要抓取两个时间点的快照并对比新增对象。

## 流程

1. 进入场景稳定后抓取快照 A
2. 执行可疑操作，再返回原状态
3. 触发 GC 后抓取快照 B
4. 对比新增的纹理、Mesh、GameObject、托管对象
5. 查看引用链，找到持有者

## 常见泄漏对象

- 未释放的 Addressables 句柄
- 静态事件捕获的 UI
- `DontDestroyOnLoad` 对象
- 未卸载的 AssetBundle
- 对象池无限增长
- 未退订的委托与闭包

## 注意

`Resources.UnloadUnusedAssets` 只能清理无引用资源；有引用链时不会释放。

> 记忆：**快照找增量，引用链找元凶。**
