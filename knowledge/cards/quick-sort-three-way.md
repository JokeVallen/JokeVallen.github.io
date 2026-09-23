---
title: 三路划分快速排序处理重复键
date: 2026-09-23
category: 算法
tags: [快速排序, 三路划分, 重复键, 排序]
icon: fas fa-project-diagram
difficulty: 3
---

## 定义

三路划分把数组分成“小于基准”“等于基准”“大于基准”三段，等于基准的元素一次划分就全部归位。

## 核心步骤

1. 随机选基准并交换到 `left`。
2. 维护 `lt = left`、`i = left + 1`、`gt = right`。
3. `nums[i] < pivot` 时与 `lt` 交换，`lt++`、`i++`。
4. `nums[i] > pivot` 时与 `gt` 交换，`gt--`。
5. `nums[i] == pivot` 时只 `i++`。
6. 递归处理 `[left, lt - 1]` 与 `[gt + 1, right]`。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n log n) |
| 全相等时间 | O(n) |
| 空间 | O(log n) 递归栈 |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
int lt = left, i = left + 1, gt = right;
while (i <= gt)
{
    if (comparer.Compare(nums[i], pivot) < 0)
        Swap(nums, lt++, i++);
    else if (comparer.Compare(nums[i], pivot) > 0)
        Swap(nums, gt--, i);
    else
        i++;
}
ThreeWay(nums, left, lt - 1, comparer);
ThreeWay(nums, gt + 1, right, comparer);
```

## 常见坑

- 与 `gt` 交换后，换来的元素尚未检查，`i` 不能自增。
- 划分后等于基准的区间 `[lt, gt]` 已有序，不需要再递归。
- 交换会打乱相等键的顺序，算法不稳定。

## 适用场景

- 数组中重复键很多，甚至大量元素相同。
- 需要避免重复键导致划分极度不平衡。
- 允许不稳定排序且希望原地完成的场合。

> 记忆：**小于左拨，大于右甩，等于不动；重复键一次归位。**
