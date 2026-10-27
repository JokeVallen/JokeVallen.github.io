---
title: 鸡尾酒排序的双向扫描
date: 2026-09-23
category: 算法
tags: [鸡尾酒排序, 排序, 交换排序]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

鸡尾酒排序是双向冒泡排序：先从左到右把大值送到右端，再从右到左把小值送回左端，交替收缩未排序区间。

## 核心步骤

1. 用 `left`、`right` 标记未排序区边界。
2. 从左向右扫描，比较相邻元素并把较大者右移，然后 `right--`。
3. 从右向左扫描，比较相邻元素并把较小者左移，然后 `left++`。
4. 重复直到 `left >= right`。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n²) |
| 最好时间 | O(n)（增加交换标志后） |
| 空间 | O(1) |
| 稳定性 | 稳定 |

## 代码示例

```csharp
while (left < right)
{
    for (int i = left; i < right; i++)
        if (comparer.Compare(nums[i], nums[i + 1]) > 0)
            Swap(nums, i, i + 1);
    right--;

    for (int i = right; i > left; i--)
        if (comparer.Compare(nums[i - 1], nums[i]) > 0)
            Swap(nums, i - 1, i);
    left++;
}
```

## 常见坑

- 鸡尾酒排序主要优化“小元素在尾部”的乌龟问题，不改变最坏复杂度。
- 每轮必须正确收缩边界，否则会重复扫描已有序区。
- 交换只发生在相邻元素之间，算法保持稳定。

> 记忆：**左扫大值到右，右扫小值到左；两头收缩，双向冒泡。**
