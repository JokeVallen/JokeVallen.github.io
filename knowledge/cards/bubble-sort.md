---
title: 冒泡排序与提前退出优化
date: 2026-09-23
category: 算法
tags: [冒泡排序, 排序, 交换排序]
icon: fas fa-project-diagram
difficulty: 1
---

## 定义

冒泡排序重复比较相邻元素，把较大者向后交换；每轮结束，未排序区的最大值固定到末尾。

## 核心步骤

1. 从 `0` 遍历到 `n - i - 2`，比较 `nums[j]` 与 `nums[j + 1]`。
2. 若前者更大则交换两者。
3. 若某一轮没有发生任何交换，说明数组已经有序，可提前退出。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n²) |
| 最好时间 | O(n)（带提前退出） |
| 空间 | O(1) |
| 稳定性 | 稳定 |

## 代码示例

```csharp
for (int i = 0; i < nums.Length; i++)
{
    bool swapped = false;
    for (int j = 0; j < nums.Length - i - 1; j++)
    {
        if (comparer.Compare(nums[j], nums[j + 1]) > 0)
        {
            (nums[j], nums[j + 1]) = (nums[j + 1], nums[j]);
            swapped = true;
        }
    }
    if (!swapped) break;
}
```

## 常见坑

- 内层边界写成 `nums.Length - i` 会越界；写错成 `nums.Length - 1` 则丢失提前收敛。
- 没有提前退出时，最好情况仍要进行 O(n²) 次比较。
- 相邻交换不会让相等元素跨过彼此，因此冒泡排序是稳定的。

## 适用场景

- 教学、面试和极少量数据的排序。
- 数据接近有序时，带交换标志的版本非常快。
- 对稳定性有要求、又不便使用归并排序的小数组。

> 记忆：**相邻比较，大者后移；一轮无交换，立即收工。**
