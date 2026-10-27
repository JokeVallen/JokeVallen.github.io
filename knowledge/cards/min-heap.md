---
title: 小顶堆的堆序维护方法
date: 2026-09-23
category: 算法
tags: [小顶堆, 优先队列, 数据结构]
icon: fas fa-sitemap
difficulty: 2
---

## 定义

小顶堆是满足“父节点不大于子节点”的完全二叉树，数组根节点就是当前最小值，适合实现最小优先队列。

## 下标关系与操作

| 关系/操作 | 公式或结果 |
|---|---|
| 父节点 | `(i - 1) / 2` |
| 左子节点 | `2 * i + 1` |
| 右子节点 | `2 * i + 2` |
| `Push` | 插入末尾后上浮，O(log n) |
| `Pop` | 根与末尾交换，删除末尾后下沉，O(log n) |
| `Peek` | 返回根，O(1) |

## 核心代码

```csharp
private void Swim(int index)
{
    while (index > 0)
    {
        int parent = (index - 1) / 2;
        if (comparer.Compare(heap[index], heap[parent]) >= 0)
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
        int smallest = index;

        if (left < heapSize && comparer.Compare(heap[left], heap[smallest]) < 0)
            smallest = left;
        if (right < heapSize && comparer.Compare(heap[right], heap[smallest]) < 0)
            smallest = right;
        if (smallest == index) break;
        Swap(index, smallest);
        index = smallest;
    }
}
```

## 常见坑

- 小顶堆与大顶堆只差比较方向，代码结构完全对称，不要混用 `>` 和 `<`。
- `Pop` 后堆大小为 `Count - 1`，下沉的边界必须传当前实际大小。
- 清空堆只需清空底层列表，`Count` 会随之归零。

## 适用场景

- 实现最小优先队列、Dijkstra 等图算法。
- 按优先级从低到高处理任务。
- 需要实时取最小值并支持动态插入的场景。

- 堆只保证父子偏序，顺序遍历数组不会得到有序序列。

> 记忆：**小顶堆：上浮到比父小为止，下沉到比子小为止，根永远是最小值。**
