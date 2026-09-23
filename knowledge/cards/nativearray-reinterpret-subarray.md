---
title: Reinterpret 与 GetSubArray 的视图操作
date: 2026-09-23
category: Unity
tags: [Reinterpret, GetSubArray, 类型双关]
icon: fas fa-code
difficulty: 3
---

## 结论

`Reinterpret` 和 `GetSubArray` 都创建**视图**，不复制数据。前者改变元素类型，后者截取子区间。

## 对比

| 方法 | 作用 | 数据复制 |
|---|---|---|
| `GetSubArray(start, length)` | 返回原数组的一段视图 | 否 |
| `Reinterpret<U>()` | 将内存重新解释为类型 `U` | 否 |
| `Reinterpret<U>(expectedSize)` | 类型大小不一致时指定预期元素大小 | 否 |

## Reinterpret 的规则

- `T` 和 `U` 大小**一致**时，可直接 `Reinterpret<U>()`。
- 大小**不一致**时，必须提供 `expectedSize` 参数，否则抛异常。
- 例如：`float` 数组（4 字节）可 reinterpret 为 `int` 数组（4 字节）；`float3`（12 字节）可 reinterpret 为 `Vector3`（12 字节）。

## 代码示例

```csharp
// 从字节缓冲区中截取一段，重新解释为 Vector3
NativeArray<byte> bytes = new NativeArray<byte>(1024, Allocator.TempJob);
var verts = bytes.GetSubArray(0, 96).Reinterpret<Vector3>(1);
// verts 是 bytes 前 96 字节的 Vector3 视图
```

## 注意

- 视图**不拥有内存**，原数组 Dispose 后视图即失效。
- `Reinterpret` 不做字节序转换，仅重新解释。
- 对齐问题：`Reinterpret` 要求目标类型的内存对齐满足要求。

> 记忆：**GetSubArray 截一段，Reinterpret 换类型；都是视图不复制，原数组释放视图失效。**