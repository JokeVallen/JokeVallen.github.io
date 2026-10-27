---
title: 大顶堆的上浮与下沉机制
date: 2026-09-23
category: 算法
tags: [大顶堆, 优先队列, 数据结构]
icon: fas fa-sitemap
difficulty: 2
---

## 定义

大顶堆是满足“父节点不小于子节点”的完全二叉树，通常用数组存储，根节点就是当前最大值。

## 下标关系与操作

| 关系/操作 | 公式或结果 |
|---|---|
| 父节点 | `(i - 1) / 2` |
| 左子节点 | `2 * i + 1` |
| 右子节点 | `2 * i + 2` |
| `Push` | 追加到末尾后上浮，O(log n) |
| `Pop` | 取出根，末尾移到根后下沉，O(log n) |
| `Peek` | 直接返回根，O(1) |

## 核心代码

```csharp
private void Swim(int index)
{
    while (index > 0)
    {
        int parent = (index - 1) / 2;
        if (comparer.Compare(heap[index], heap[parent]) <= 0)
            break;
        Swap(index, parent);
        index = parent;
    }
}

private void Sink(int index, int heapSize)
{
    while (true)
    {
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        int greatest = index;

        if (left < heapSize && comparer.Compare(heap[left], heap[greatest]) > 0)
            greatest = left;
        if (right < heapSize && comparer.Compare(heap[right], heap[greatest]) > 0)
            greatest = right;
        if (greatest == index) break;
        Swap(index, greatest);
        index = greatest;
    }
}
```

## 常见坑

- 数组下标从 0 开始时，父节点是 `(i - 1) / 2`，不是 `i / 2`。
- `Pop` 必须先把末尾元素放到根，再删除末尾，否则会破坏完全二叉树结构。
- 下沉时要同时比较左右子节点，和三者中的最大者交换。

## 适用场景

- 实现优先队列、任务调度和 Top K 问题。
- 堆排序的核心结构。
- 需要实时取最大值，同时支持动态插入的场景。

- 堆只保证父子偏序，顺序遍历数组不会得到有序序列。

> 记忆：**大顶堆：上浮到比父大为止，下沉到比子大为止，根永远是最大值。**
