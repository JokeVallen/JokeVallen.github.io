---
title: 快速排序的三数取中基准
date: 2026-09-23
category: 算法
tags: [快速排序, 三数取中, 排序]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

三数取中快速排序取区间左端、中间、右端三个元素的中位数作为基准，避免有序或逆序数据下总选到最值。

## 核心步骤

1. 比较 `nums[left]`、`nums[mid]`、`nums[right]`，把三者调整为有序。
2. 三个元素有序后，`nums[mid]` 是中位数。
3. 把中位数交换到 `right` 作为基准。
4. 执行 Lomuto 划分，再递归左右区间。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n log n) |
| 最坏时间 | O(n²) |
| 空间 | O(log n) 递归栈 |
| 稳定性 | 不稳定 |

## 核心代码

```csharp
int mid = left + (right - left) / 2;
if (comparer.Compare(nums[left], nums[mid]) > 0) Swap(nums, left, mid);
if (comparer.Compare(nums[left], nums[right]) > 0) Swap(nums, left, right);
if (comparer.Compare(nums[mid], nums[right]) > 0) Swap(nums, mid, right);
Swap(nums, mid, right);
```

## 常见坑

- 三数取中只优化基准选择，重复元素很多时仍可能退化。
- 三个 `if` 每次都要重新比较，不能省略成两次。
- 基准交换与划分会打乱相等元素顺序，算法不稳定。

## 适用场景

- 数据可能已经部分有序或完全有序。
- 希望用很低开销改善基准选择。
- 作为工程快速排序的默认基准策略之一。

> 记忆：**左中右排好序，中位数当基准；有序数据不再怕，重复多了仍会差。**
