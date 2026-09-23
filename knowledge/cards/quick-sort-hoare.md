---
title: 快速排序的 Hoare 划分
date: 2026-09-23
category: 算法
tags: [快速排序, Hoare, 排序]
icon: fas fa-project-diagram
difficulty: 3
---

## 定义

Hoare 划分选择中间元素为基准，左右指针相向扫描，遇到左侧大于基准、右侧小于基准就交换，直到指针交错。

## 核心步骤

1. 取 `pivot = nums[left + (right - left) / 2]`。
2. `i` 从左向右找不小于基准的元素，`j` 从右向左找不大于基准的元素。
3. 若 `i <= j`，交换 `nums[i]` 与 `nums[j]`，并同时向内收缩。
4. 循环结束后，递归处理 `[left, j]` 与 `[i, right]`。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n log n) |
| 最坏时间 | O(n²) |
| 空间 | O(log n) 递归栈 |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
var pivot = nums[left + (right - left) / 2];
int i = left, j = right;
while (i <= j)
{
    while (comparer.Compare(nums[i], pivot) < 0) i++;
    while (comparer.Compare(nums[j], pivot) > 0) j--;
    if (i <= j)
    {
        Swap(nums, i, j);
        i++;
        j--;
    }
}
Hoare(nums, left, j, comparer);
Hoare(nums, i, right, comparer);
```

## 常见坑

- Hoare 的返回边界不是基准最终下标，不能按 Lomuto 的方式使用。
- 递归区间是 `[left, j]` 和 `[i, right]`，写错容易死循环或漏排。
- 相等元素会被交换，算法不稳定。

## 适用场景

- 希望减少元素交换次数的原地排序。
- 数据随机分布、重复键不多的场合。
- 理解双向扫描划分与 Lomuto 划分的差异。

> 记忆：**中间基准，两端夹逼；左大右小就交换，交错后分两段。**
