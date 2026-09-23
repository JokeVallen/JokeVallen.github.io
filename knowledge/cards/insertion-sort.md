---
title: 直接插入排序的局部有序扩展
date: 2026-09-23
category: 算法
tags: [插入排序, 排序, 原地排序]
icon: fas fa-project-diagram
difficulty: 1
---

## 定义

直接插入排序把数组分成“已排序前缀”和“未排序后缀”，每次取后缀首元素，在前缀中找到位置并插入。

## 核心步骤

1. 从 `i = 1` 开始，把 `nums[i]` 保存为 `current`。
2. 从 `j = i - 1` 向前扫描，若 `nums[j] > current` 则把 `nums[j]` 右移一位。
3. 当 `j < 0` 或 `nums[j] <= current` 时停止。
4. 把 `current` 写入 `nums[j + 1]`。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n²) |
| 最好时间 | O(n)（已经有序） |
| 空间 | O(1) |
| 稳定性 | 稳定 |

## 代码示例

```csharp
for (int i = 1; i < nums.Length; i++)
{
    var current = nums[i];
    int j = i - 1;
    while (j >= 0 && comparer.Compare(nums[j], current) > 0)
    {
        nums[j + 1] = nums[j];
        j--;
    }
    nums[j + 1] = current;
}
```

## 常见坑

- 比较条件必须用 `>`，遇到相等元素立即停止，才能保持稳定。
- 先保存 `current`，否则右移会覆盖待插入值。
- 数据量小或基本有序时，插入排序通常比复杂排序更快。

## 适用场景

- 数据量小，通常 n < 32 时优先使用。
- 数据基本有序，或每次只插入少量新元素。
- 作为快速排序、归并排序的小区间收尾算法。

> 记忆：**取当前值，大者后移；找到空位，插回当前值。**
