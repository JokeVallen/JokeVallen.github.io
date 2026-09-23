---
title: Native- 与 Unsafe- 集合的选型
date: 2026-09-23
category: Unity
tags: [Unsafe, 安全检查, 性能]
icon: fas fa-tachometer-alt
difficulty: 3
---

## 结论

`Unsafe-` 是 `Native-` 去掉安全检查的底层版本。**关闭安全检查后，两者性能无显著差异**，但 `Unsafe-` 支持嵌套，且不检测越界和释放错误。

## 对比

| 维度 | Native- | Unsafe- |
|---|---|---|
| 越界检查 | 有 | 无 |
| 释放检测 | 有（DisposeSentinel） | 无 |
| 线程安全检查 | 有 | 无 |
| 嵌套支持 | 不支持 | 支持 |
| 性能（安全检查开启） | 较低 | 较高 |
| 性能（安全检查关闭） | 接近 Unsafe | 接近 Native |

## 嵌套场景

`Native-` 类型**不能**包含其他 `Native-` 类型，因为安全检查的实现方式限制了嵌套[reference:12]。

```csharp
// 不允许：NativeList<NativeList<T>>
// 允许：
var listOfLists = new NativeList<UnsafeList<T>>(Allocator.Persistent);
```

## 选型建议

- **优先使用 `Native-`**：开发期安全检查可提前发现越界、释放错误和竞争。
- **需要嵌套时用 `Unsafe-`**：如 `NativeList<UnsafeList<T>>`。
- **发布版本**：安全检查不生效，性能差异消失，可继续使用 `Native-`。

## 注意

- `Unsafe-` 不做任何边界检查，越界访问直接**未定义行为**。
- 必须手动保证释放和线程安全。

> 记忆：**Native- 带安全检查，Unsafe- 不带；嵌套必须用 Unsafe-，发布版性能趋同。**