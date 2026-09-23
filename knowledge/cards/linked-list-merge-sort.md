---
title: 链表的归并排序实现方法
date: 2026-09-23
category: 算法
tags: [归并排序, 链表, 排序]
icon: fas fa-sitemap
difficulty: 3
---

## 定义

链表归并排序利用快慢指针找到中点，把链表断开后递归排序两半，再用哑节点合并两个有序链表。

## 核心步骤

1. 快指针每次走两步，慢指针每次走一步，慢指针停在中点前。
2. 断开 `slow.next`，得到左右两条链表。
3. 递归排序左右链表。
4. 用 `dummy` 头节点依次连接较小的节点，最后接上未耗尽的一侧。

## 复杂度与稳定性

| 指标 | 结果 |
|---|---|
| 时间 | O(n log n) |
| 空间 | O(log n)（递归栈） |
| 稳定性 | 稳定 |

## 关键代码

```csharp
var slow = head;
var fast = head.next;
while (fast != null && fast.next != null)
{
    slow = slow.next;
    fast = fast.next.next;
}

var mid = slow.next;
slow.next = null;

var left = StandardRecursive(head, comparer);
var right = StandardRecursive(mid, comparer);
return MergeLinkedList(left, right, comparer);
```

## 常见坑

- 快指针从 `head.next` 开始，慢指针才会停在左半段末尾。
- 合并时用 `<=` 保证稳定性。
- 链表无法随机访问，归并排序比快速排序更合适；但递归过深时可改用迭代版。

> 记忆：**快慢指针断中点，递归排好两条链；哑节点合并，稳定又省空间。**
