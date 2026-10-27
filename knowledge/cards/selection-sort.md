---
title: 简单选择排序的最小值交换
date: 2026-09-23
category: 算法
tags: [选择排序, 排序, 原地排序]
icon: fas fa-project-diagram
difficulty: 1
---

## 定义

简单选择排序每一轮从未排序区选出最小值，与未排序区首位交换，逐步扩大已排序前缀。

## 核心步骤

1. 令 `minIndex = i`。
2. 从 `i + 1` 到 `n - 1` 扫描，记录更小元素的下标。
3. 若 `minIndex != i`，交换 `nums[i]` 与 `nums[minIndex]`。
4. 重复直到整个数组有序。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 比较次数 | 始终 O(n²) |
| 交换次数 | O(n) |
| 空间 | O(1) |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
for (int i = 0; i < nums.Length; i++)
{
    int minIndex = i;
    for (int j = i + 1; j < nums.Length; j++)
        if (comparer.Compare(nums[j], nums[minIndex]) < 0)
            minIndex = j;

    if (minIndex != i)
        Swap(nums, minIndex, i);
}
```

## 常见坑

- 选择排序的比较次数与初始顺序无关，最好和最坏都是 O(n²)。
- 交换可能把前面的相等元素甩到后面，因此不稳定。
- 若要求稳定性，可改用“移位插入”版本，而不是直接交换。

## 适用场景

- 交换成本高、比较成本低的场景。
- 数据量很小且不要求稳定性的场合。
- 需要固定比较次数、行为可预测的排序任务。

> 记忆：**每轮找最小，与首位交换；比较固定，交换很少。**
