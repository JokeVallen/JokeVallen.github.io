---
title: 二叉搜索树的插入与查找
date: 2026-09-23
category: 算法
tags: [二叉搜索树, 查找, 插入, 数据结构]
icon: fas fa-sitemap
difficulty: 2
---

## 定义

二叉搜索树满足：左子树所有值小于根，右子树所有值大于根；查找和插入都沿着这一有序性质走一条根到叶的路径。

## 核心步骤

1. 从根开始，用比较器比较目标值与当前节点。
2. 相等则命中；目标更小走左子树，更大走右子树。
3. 插入时按同样路径找到空位，把新节点挂上去。
4. 重复值通常忽略，避免树中出现重复键。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 时间复杂度 | O(h)，h 为树高 |
| 平衡树高 | O(log n) |
| 退化成链 | O(n) |
| 额外空间 | 递归 O(h)，迭代 O(1) |

## 代码示例

```csharp
public ITreeNode<T> SearchIterative(T value)
{
    Node cur = root;
    while (cur != null)
    {
        int res = comparer.Compare(value, cur.value);
        if (res == 0) return cur;
        cur = res < 0 ? cur.left : cur.right;
    }
    return null;
}

private Node InsertRecursivelyInternal(Node node, T value)
{
    if (node == null) return new Node { value = value };
    int res = comparer.Compare(value, node.value);
    if (res < 0)
        node.left = InsertRecursivelyInternal(node.left, value);
    else if (res > 0)
        node.right = InsertRecursivelyInternal(node.right, value);
    return node;
}
```

## 常见坑

- 有序插入会让 BST 退化成链表，查找变为 O(n)。
- 递归插入必须把返回的新子树重新接回父节点。
- 查找空树或走到 `null` 时要返回未找到，不能继续解引用。

> 记忆：**小走左，大走右，相等即命中；插入就是找空位挂节点。**
