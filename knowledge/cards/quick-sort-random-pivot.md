---
title: 快速排序的随机基准优化
date: 2026-09-23
category: 算法
tags: [快速排序, 随机基准, 排序]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

随机基准快速排序在每次划分前随机选择一个元素，与区间末尾交换，再执行 Lomuto 划分，从而避免输入顺序固定导致的极端划分。

## 核心步骤

1. 在 `[left, right]` 中随机取 `pivotIndex`。
2. 交换 `nums[pivotIndex]` 与 `nums[right]`。
3. 以 `nums[right]` 为基准执行标准划分。
4. 递归处理左右子区间。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 期望时间 | O(n log n) |
| 最坏时间 | O(n²)（概率极低） |
| 空间 | O(log n) 期望递归栈 |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
int pivotIndex = random.Next(left, right + 1);
Swap(nums, pivotIndex, right);
var pivot = nums[right];

int j = left;
for (int i = left; i < right; i++)
{
    if (comparer.Compare(nums[i], pivot) <= 0)
        Swap(nums, i, j++);
}
Swap(nums, j, right);
```

## 常见坑

- 随机化只降低坏划分的概率，不消除 O(n²) 最坏情况。
- 共享 `Random` 实例在多线程环境下不安全；多线程可改用线程本地随机数。
- 随机基准不能使快速排序稳定。

## 适用场景

- 输入顺序可能已有序或存在恶意构造。
- 希望降低最坏划分出现概率的通用排序。
- 需要原地排序且允许不稳定结果的场合。

> 记忆：**随机选基准，换到末尾再划分；坏输入被概率打散。**
