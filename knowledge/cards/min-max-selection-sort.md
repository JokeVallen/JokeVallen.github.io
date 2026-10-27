---
title: 双端选择排序的同步定位
date: 2026-09-23
category: 算法
tags: [选择排序, 双端选择, 排序]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

双端选择排序在同一轮同时找出未排序区的最小值和最大值，分别放到区间的左端和右端，每轮排好两个位置。

## 核心步骤

1. 用 `left`、`right` 表示未排序区。
2. 扫描 `[left, right]`，记录 `minIndex` 和 `maxIndex`。
3. 把最小值交换到 `left`。
4. 若最大值原本在 `left`，交换后其下标会变成 `minIndex`，必须修正。
5. 把最大值交换到 `right`，然后收缩两端。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 比较次数 | 约 n²/2 |
| 交换次数 | O(n) |
| 空间 | O(1) |
| 稳定性 | 不稳定 |

## 代码示例

```csharp
Swap(nums, minIndex, left);
if (maxIndex == left)
    maxIndex = minIndex;
Swap(nums, maxIndex, right);
left++;
right--;
```

## 常见坑

- 最重要的边界问题：最小值交换后，最大值如果原来在 `left`，位置已被换走，必须修正 `maxIndex`。
- 当 `minIndex == maxIndex` 或 `left == right` 时，要保证逻辑仍成立。
- 比较次数几乎减半，但量级仍是 O(n²)。
- 跨距离交换会破坏稳定性。

> 记忆：**一轮找两端，小者放左，大者放右；先换小者，再修正大者下标。**
