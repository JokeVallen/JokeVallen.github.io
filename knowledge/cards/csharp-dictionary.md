---
title: C# Dictionary 的哈希表实现
date: 2026-09-23
category: C#
tags: [Dictionary, 哈希表, 数据结构]
icon: fas fa-code
difficulty: 3
---

## 定义

`Dictionary<TKey, TValue>` 是 C# 基于哈希表实现的键值集合，平均情况下插入、查找和删除的复杂度都是 O(1)，最坏情况退化为 O(n)。

## 内部结构

| 结构 | 作用 |
|---|---|
| `buckets` | 整数数组，保存每个哈希桶对应的 entry 下标 |
| `entries` | 结构体数组，保存 hashCode、next、key、value |
| `freeList` | 被删除 entry 组成的空闲链表头 |
| `count` | 当前键值对数量 |
| `version` | 修改版本号，用于迭代器失效检测 |

查找时先通过 `GetHashCode()` 计算哈希，再对桶数组长度取模得到 bucket 下标；如果发生哈希冲突，就通过 `entries[].next` 形成链表继续查找。

## 关键操作

- 插入：计算哈希，找空位；若 key 已存在则更新或抛异常。
- 查找：定位 bucket，沿冲突链比较 hash 和 key。
- 删除：标记 entry 为已删除，并挂入空闲链表，供后续插入复用。
- 扩容：负载因子过高时扩容并重新分配所有元素到新桶中。

## 代码示例

```csharp
var map = new Dictionary<string, int>();
map["apple"] = 3;
if (map.TryGetValue("apple", out int count))
    Console.WriteLine(count);
```

## 常见坑

- 自定义键必须正确重写 `Equals` 和 `GetHashCode`，否则查找会失败或性能退化。
- 键的哈希值在存入后不能改变，可变对象不适合作为键。
- 字典的枚举顺序不保证稳定，不能依赖它。
- `Dictionary` 不是线程安全的，多线程读写需要加锁或使用并发集合。

> 记忆：**bucket 找桶，entry 存链；哈希定位，链地址法解决冲突。**
