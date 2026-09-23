---
title: Burst 的 noalias 与自动向量化
date: 2026-09-23
category: 图形性能
tags: [Burst, 向量化, 内存别名]
icon: fas fa-tachometer-alt
difficulty: 3
---

## 结论

Burst 编译器在确认两个 `NativeArray` **无内存别名（noalias）** 时，可自动向量化循环，性能提升可达 **32 倍**。

## 什么是内存别名

内存别名指两个数组的内存区域**重叠**。Burst 默认**不确定**输入输出是否重叠，因此保守地生成标量代码。

```csharp
[BurstCompile]
struct CopyJob : IJob
{
    [ReadOnly] public NativeArray<float> Input;
    [WriteOnly] public NativeArray<float> Output;

    public void Execute()
    {
        for (int i = 0; i < Input.Length; i++)
            Output[i] = Input[i];
    }
}
```

- 无别名时：Burst 生成 AVX2 向量化代码，每次迭代处理 **32 个 float**[reference:10]。
- 有别名时：Burst 只生成**标量代码**，性能约为向量化版本的 **1/32**[reference:11]。

## 关键机制

- `[NativeContainer]` 标记的 struct 在 Job 中默认**不与自身别名**。
- `[ReadOnly]` 和 `[WriteOnly]` 为 Burst 提供了额外的别名信息。

## 注意

- 别名分析是 **Burst 优化的核心前提**，写 Job 时应尽量提供明确的读写标记。
- `NativeArray` 作为 Job struct 成员时，Burst 可推断其不与其他 `NativeArray` 成员别名。

> 记忆：**noalias 让 Burst 向量化，一次算 32 个；别名则退化为标量，慢 32 倍。**