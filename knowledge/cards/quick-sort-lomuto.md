---
title: 快速排序的 Lomuto 划分
date: 2026-09-23
category: 算法
tags: [快速排序, Lomuto, 排序, 分治]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

Lomuto 划分以区间最后一个元素为基准，用 `j` 指向“小于等于基准区”的下一个位置，扫描结束后把基准换到 `j`。

## 核心步骤

1. 取 `pivot = nums[right]`，令 `j = left`。
2. 遍历 `i` 从 `left` 到 `right - 1`。
3. 若 `nums[i] <= pivot`，交换 `nums[i]` 与 `nums[j]`，然后 `j++`。
4. 最后交换 `nums[j]` 与 `nums[right]`，返回 `j`。
5. 对左右子区间递归。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n log n) |
| 最坏时间 | O(n²)（已有序且取端点为基准） |
| 空间 | O(log n) 递归栈 |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
var pivot = nums[right];
int j = left;
for (int i = left; i < right; i++)
{
    if (comparer.Compare(nums[i], pivot) <= 0)
    {
        Swap(nums, i, j);
        j++;
    }
}
Swap(nums, j, right);
return j;
```

## 常见坑

- 已排序或逆序数据会退化为每次只划分出一个元素。
- 大量重复元素时 Lomuto 可能把相等元素分到一侧，导致不平衡。
- 划分过程会交换相等元素，快速排序不稳定。

## 适用场景

- 数据随机分布，且允许不稳定排序。
- 内存受限、需要原地划分的场合。
- 作为理解快速排序划分逻辑的基础版本。

> 记忆：**尾元素作基准，小于等于往左丢；扫描完后基准归位。**
