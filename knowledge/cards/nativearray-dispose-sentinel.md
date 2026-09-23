---
title: NativeArray 必须 Dispose 否则内存泄漏
date: 2026-09-23
category: Unity
tags: [Dispose, 内存泄漏, DisposeSentinel]
icon: fas fa-shield-alt
difficulty: 2
---

## 结论

`NativeArray` 的内存不归 GC 管。**不调用 `Dispose()`，内存不会自动回收**，造成泄漏。

## DisposeSentinel 机制

Unity 内置 `DisposeSentinel` 检测内存泄漏。未正确释放时，会在**泄漏发生很久之后**才抛出错误，而非当场报错[reference:4]。

- 编辑器下才生效，发布版本无此检测。
- 错误信息会指出是哪个 `NativeArray` 未释放。

## 正确的释放方式

```csharp
// 方式一：using 块（推荐）
using (var array = new NativeArray<int>(100, Allocator.TempJob))
{
    // 使用 array
} // 自动 Dispose

// 方式二：手动 Dispose
var array = new NativeArray<int>(100, Allocator.Persistent);
try
{
    // 使用 array
}
finally
{
    array.Dispose();
}
```

## 注意

- `Allocator.Temp` 的 `Dispose()` **不做任何事**，帧结束自动回收[reference:5]。
- 多个变量指向同一个 `NativeArray` 时，**只需 Dispose 一次**。
- `IsCreated` 属性可判断是否已分配有效内存。

> 记忆：**NativeArray 不 Dispose 就泄漏；Temp 自动回收，其他必须手动；DisposeSentinel 事后报警。**