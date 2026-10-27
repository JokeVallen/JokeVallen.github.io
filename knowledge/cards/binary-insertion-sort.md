---
title: 二分插入排序的查找优化
date: 2026-09-23
category: 算法
tags: [插入排序, 二分查找, 排序]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

二分插入排序先用二分查找在已排序前缀中定位插入点，再统一右移元素，减少比较次数。

## 核心步骤

1. 取 `current = nums[i]`，在 `[0, i - 1]` 内二分查找最后一个不大于 `current` 的位置。
2. 使用 `left <= right` 循环，若 `nums[mid] > current` 则 `right = mid - 1`，否则 `left = mid + 1`。
3. 循环结束后 `left` 就是插入位置。
4. 把 `[left, i - 1]` 整体右移一位，再写入 `current`。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 比较次数 | O(n log n) |
| 移动次数 | O(n²) |
| 空间 | O(1) |
| 稳定性 | 稳定 |

## 代码示例

```csharp
int left = 0, right = i - 1;
while (left <= right)
{
    int mid = left + (right - left) / 2;
    if (comparer.Compare(nums[mid], current) > 0)
        right = mid - 1;
    else
        left = mid + 1;
}
for (int j = i - 1; j >= left; j--)
    nums[j + 1] = nums[j];
nums[left] = current;
```

## 常见坑

- 二分只降低比较次数，元素移动仍是 O(n²)，整体复杂度没有质变。
- 遇到相等元素时让 `left = mid + 1`，把新元素插到相等元素之后，保持稳定。
- 插入位置取 `left`，不能取 `right`。

## 适用场景

- 比较操作昂贵、移动操作相对廉价的数据。
- 需要减少比较次数的小规模有序插入。
- 作为教学示例，理解“查找位置”和“移动元素”可以分离。

> 记忆：**二分找位置，整体向右挪；比较变少了，移动仍照旧。**
