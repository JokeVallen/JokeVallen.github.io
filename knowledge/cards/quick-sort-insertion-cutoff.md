---
title: 快速排序的小数组插入优化
date: 2026-09-23
category: 算法
tags: [快速排序, 混合排序, 插入排序]
icon: fas fa-project-diagram
difficulty: 3
---

## 定义

小数组插入优化在快速排序递归到长度不超过阈值（示例为 16）时，直接改用插入排序，减少递归调用和划分开销。

## 核心步骤

1. 若 `right - left + 1 <= 16`，调用区间插入排序并返回。
2. 否则使用三数取中选出基准。
3. 执行划分，递归左右子区间。
4. 递归返回后整个区间自然有序。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n log n) |
| 最坏时间 | O(n²) |
| 空间 | O(log n) |
| 稳定性 | 不稳定（快速排序阶段） |

## 核心代码

```csharp
if (right - left + 1 <= 16)
{
    InsertionSort(nums, left, right, comparer);
    return;
}

int partition = DoPartition3(nums, left, right, comparer);
MedianofThreeWithInsertionStandard(nums, left, partition - 1, comparer);
MedianofThreeWithInsertionStandard(nums, partition + 1, right, comparer);
```

## 常见坑

- 阈值不是越大越好，需要根据数据规模和语言实测选择。
- 小数组插入排序时，比较和移动必须限制在 `[left, right]` 内。
- 快速排序阶段不稳定，因此整体仍不是稳定排序。

## 适用场景

- 通用数组排序，希望减少递归和划分开销。
- 小区间数量较多、递归调用占比高的场合。
- 作为混合排序的基础模板，可替换不同的插入阈值。

> 记忆：**大区间快排，小区间插排；减少递归，提升常数性能。**
