---
title: 二叉搜索树的删除操作
date: 2026-09-23
category: 算法
tags: [二叉搜索树, 删除, 数据结构]
icon: fas fa-sitemap
difficulty: 3
---

## 定义

BST 删除先定位目标节点，再按子节点数量分三种情况处理；若左右子树都存在，用右子树最小节点（中序后继）替换目标值。

## 核心步骤

1. 按 BST 性质递归查找目标值。
2. 目标没有左子节点，返回右子节点。
3. 目标没有右子节点，返回左子节点。
4. 左右子节点都存在时，找到右子树最左节点 `min`。
5. 把 `min.value` 覆盖到当前节点，再递归删除右子树中的 `min.value`。

## 复杂度

| 指标 | 结果 |
|---|---|
| 时间复杂度 | O(h) |
| 平衡树高 | O(log n) |
| 最坏树高 | O(n) |
| 空间复杂度 | O(h) 递归栈 |

## 代码示例

```csharp
private Node DeleteRecursivelyInternal(Node node, T value)
{
    if (node == null) return null;

    int res = comparer.Compare(value, node.value);
    if (res < 0)
        node.left = DeleteRecursivelyInternal(node.left, value);
    else if (res > 0)
        node.right = DeleteRecursivelyInternal(node.right, value);
    else
    {
        if (node.left == null) return node.right;
        if (node.right == null) return node.left;

        var min = node.right;
        while (min.left != null) min = min.left;
        node.value = min.value;
        node.right = DeleteRecursivelyInternal(node.right, min.value);
    }
    return node;
}
```

## 常见坑

- 删除有两个子节点的节点时，不能直接删除，要用中序后继或前驱替换。
- 替换后必须继续删除后继节点，否则会出现重复键。
- 递归返回的新子树要重新赋值给父节点的 `left` 或 `right`。

> 记忆：**无子直接删，单子接上来，双子找后继；复制值后再删后继。**
