---
title: 归并排序的分治与合并
date: 2026-09-23
category: 算法
tags: [归并排序, 排序, 分治]
icon: fas fa-project-diagram
difficulty: 2
---

## 定义

归并排序把数组不断二分，分别排序左右两段，再把两个有序段合并成一个有序段。

## 核心步骤

1. 递归终止条件：`left >= right`。
2. 取中点 `mid = left + (right - left) / 2`。
3. 递归排序 `[left, mid]` 和 `[mid + 1, right]`。
4. 用临时数组按序合并左右两段，再写回原数组。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 时间 | O(n log n) |
| 空间 | O(n) |
| 稳定性 | 稳定（合并时用 `<=`） |

## 合并代码

```csharp
while (m < len1 && n < len2)
{
    if (comparer.Compare(leftArray[m], rightArray[n]) <= 0)
        array[k++] = leftArray[m++];
    else
        array[k++] = rightArray[n++];
}
while (m < len1) array[k++] = leftArray[m++];
while (n < len2) array[k++] = rightArray[n++];
```

## 迭代实现

从步长 `1, 2, 4, ...` 开始，把相邻两个长度相等的有序段合并；右侧不足时截断到数组末尾。迭代版避免递归调用，但空间复杂度仍为 O(n)。

## 常见坑

- 合并条件写成 `<` 会破坏稳定性，应使用 `<=`。
- 忘记复制剩余元素会导致结果缺项。
- 频繁 `new` 临时数组会增加 GC 压力，可复用缓冲区。

> 记忆：**先分到单元素，再合并有序段；比较取等号，排序才稳定。**
