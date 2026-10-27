---
title: 双路插入排序的环形数组
date: 2026-09-23
category: 算法
tags: [插入排序, 双路插入, 排序]
icon: fas fa-project-diagram
difficulty: 3
---

## 定义

双路插入排序把已排序区维护成环形数组，并记录当前最小值和最大值位置；新元素比最小值小就前插，比最大值大就后插，否则在中间移位插入。

## 核心步骤

1. 用 `temp` 数组和 `first`、`final` 两个指针表示排序区间的首尾。
2. 首个元素放在 `temp[0]`。
3. 新元素若小于 `temp[first]`，`first` 前移，放在头部。
4. 新元素若大于 `temp[final]`，`final` 后移，放在尾部。
5. 否则在 `first` 到 `final` 之间找到位置，元素右移后插入。
6. 最后按 `first` 起始顺序复制回原数组。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 平均时间 | O(n²) |
| 空间 | O(n) |
| 稳定性 | 稳定 |

## 代码要点

```csharp
if (comparer.Compare(nums[i], temp[first]) < 0)
{
    first = (first - 1 + nums.Length) % nums.Length;
    temp[first] = nums[i];
}
else if (comparer.Compare(nums[i], temp[final]) > 0)
{
    final = (final + 1) % nums.Length;
    temp[final] = nums[i];
}
else
{
    int j = final;
    while (comparer.Compare(nums[i], temp[j]) < 0)
    {
        temp[(j + 1) % nums.Length] = temp[j];
        j = (j - 1 + nums.Length) % nums.Length;
    }
    temp[(j + 1) % nums.Length] = nums[i];
    final = (final + 1) % nums.Length;
}
```

## 常见坑

- 环形下标必须做取模回绕，否则会越界。
- 中间插入时从 `final` 向前搬移，再写入空位。
- 相等元素停在已排序元素之后，因此算法稳定。
- 需要额外 O(n) 空间，数据量大时不一定优于普通插入排序。

> 记忆：**小者前插，大者后接；中间元素环形搬移，最后按序展开。**
