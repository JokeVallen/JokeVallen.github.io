---
title: 希尔排序的增量序列选择
date: 2026-09-23
category: 算法
tags: [希尔排序, 排序, 增量序列]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

希尔排序是插入排序的增量版本：先按较大间隔 `gap` 对子序列排序，再逐步缩小 `gap`，最后 `gap = 1` 完成收尾。

## 核心步骤

1. 选择一个递减到 1 的增量序列。
2. 对每个 `gap`，把相隔 `gap` 的元素看成一组，执行插入排序。
3. `gap` 最终必须为 1，保证数组完全有序。

## 常见增量序列

| 名称 | 序列规律 | 特点 |
|---|---|---|
| 原始 Shell | n/2, n/4, …, 1 | 实现最简单，最坏 O(n²) |
| Hibbard | 2^k - 1 | 最坏 O(n^{3/2}) |
| Knuth | (3^k - 1) / 2 | 工程中常用 |
| Sedgewick | 1, 5, 19, 41, 109, … | 性能较好 |

## 复杂度与稳定性

- 时间复杂度取决于增量序列，通常介于 O(n^{1.3}) 与 O(n^{3/2}) 之间。
- 空间复杂度为 O(1)。
- 分组排序会跨越相等元素，因此希尔排序不稳定。

## 代码示例

```csharp
private static void Shell<T>(T[] nums, int gap, IComparer<T> comparer)
{
    for (int i = gap; i < nums.Length; i++)
    {
        var current = nums[i];
        int j = i;
        while (j >= gap && comparer.Compare(nums[j - gap], current) > 0)
        {
            nums[j] = nums[j - gap];
            j -= gap;
        }
        nums[j] = current;
    }
}
```

## 常见坑

- 最后一个增量必须是 1，否则只能做到“局部有序”。
- 增量序列不能随意选，糟糕序列可能退化为 O(n²)。
- 希尔排序不是稳定排序，需要稳定时改用归并或插入排序。

> 记忆：**大间隔先粗排，小间隔再精修；最后 gap 等于 1，插入排序来收尾。**
