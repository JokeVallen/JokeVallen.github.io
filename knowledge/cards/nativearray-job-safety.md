---
title: NativeArray 的 Job 安全系统与依赖
date: 2026-09-23
category: Unity
tags: [安全系统, Job依赖, ReadOnly]
icon: fas fa-shield-alt
difficulty: 3
---

## 结论

安全系统内置于所有 `NativeContainer` 中，**调度期**检测读写冲突，而非运行期。

## 核心机制

- `AtomicSafetyHandle` 跟踪每个 `NativeContainer` 的读写状态。
- 两个 Job 同时写入同一个 `NativeArray`，**调度时**即抛出异常，并说明原因和解决方法[reference:8]。
- 多个 Job 可**并行只读**同一数据。

## 默认读写权限与优化

默认情况下，Job 对 `NativeContainer` 拥有**读写权限**。这会降低并行度[reference:9]。

```csharp
// 不需要写入时，标记 [ReadOnly] 以提升并行度
[ReadOnly] public NativeArray<int> input;
[WriteOnly] public NativeArray<int> output;
```

## 依赖关系

写冲突可通过 **Job 依赖**解决：

```csharp
JobHandle jobA = new WriteJob { data = array }.Schedule();
JobHandle jobB = new ReadJob { data = array }.Schedule(jobA); // B 依赖 A
jobB.Complete(); // 等待链完成
```

## 注意

- 安全系统只在**编辑器**和 **Play Mode** 生效，发布版本无检查。
- `[NativeDisableParallelForRestriction]` 可**完全关闭**安全检查，需自行保证安全。

> 记忆：**默认读写，只读加 [ReadOnly]；写冲突用依赖，安全系统调度时报错。**