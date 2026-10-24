---
title: 资源泄漏要查引用链
date: 2026-09-24
category: 资源管理
tags: [内存, 泄漏, 引用链]
icon: fas fa-search
difficulty: 3
---

## 结论

`Resources.UnloadUnusedAssets` 只能卸载没有任何引用的资源。如果资源还被静态字段、事件、协程或 Addressables 句柄引用，它就不会被释放。

## 常见引用源

- 静态事件未退订
- `DontDestroyOnLoad` 对象持有 UI 或资源
- Addressables 句柄未 Release
- AssetBundle 未卸载
- 闭包捕获了大对象
- 协程或 UniTask 在对象销毁后仍持有引用
- 对象池无上限增长

## 排查流程

1. 用 Memory Profiler 拍两张快照
2. 对比新增对象与资源
3. 查看引用链，找到持有者
4. 在 `OnDisable` / `OnDestroy` 中清理订阅与句柄
5. 重新跑长时间场景验证

> 记忆：**卸载不掉不是引擎问题，是还有引用链。**
