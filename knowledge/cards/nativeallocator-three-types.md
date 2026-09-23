---
title: NativeArray 三种分配器的生命周期
date: 2026-09-23
category: Unity
tags: [Allocator, 内存分配, 生命周期]
icon: fas fa-clock
difficulty: 2
---

## 结论

`Allocator` 决定 `NativeArray` 的内存**存活时长**和**能否传给 Job**。三种类型各有严格限制。

## 对比

| Allocator | 生命周期 | 速度 | 能否传入 Job |
|---|---|---|---|
| `Temp` | 当前帧结束 | 最快 | **不能** |
| `TempJob` | 4 帧内（需手动 Dispose） | 中等 | 能 |
| `Persistent` | 直到手动 Dispose | 最慢 | 能 |

## 关键规则

- `Allocator.Temp`：**不能**存储在 Job 的成员字段中，只能在主线程使用[reference:0]。
- `Allocator.TempJob`：超过 **4 帧**未 Dispose，控制台会打印原生代码生成的警告[reference:1]。
- `Allocator.Persistent`：直接封装 `malloc`，性能敏感场景**不要**使用[reference:2]。

## 代码示例

```csharp
// 主线程一帧内用完
var temp = new NativeArray<float>(100, Allocator.Temp);

// 传给 Job，4 帧内必须 Dispose
var tempJob = new NativeArray<float>(100, Allocator.TempJob);

// 长期存在，手动管理
var persistent = new NativeArray<float>(100, Allocator.Persistent);
```

## 注意

- `Temp` 分配过量时，Unity 会回退到更慢的分配方式。
- 内存池大小：`Temp` 主线程约 4–16 MB，工作线程约 256 KB；`TempJob` 约 16–64 MB[reference:3]。

> 记忆：**Temp 一帧，TempJob 四帧，Persistent 管到底；Temp 不能进 Job。**