---
title: 迭代器模式与聚合遍历
date: 2026-09-23
category: 设计模式
tags: [行为型, 迭代器, 遍历]
icon: fas fa-code
difficulty: 1
---

## 定义

迭代器模式提供一种顺序访问聚合对象元素的方法，同时不暴露聚合对象的内部表示。

## 核心角色

| 角色 | 职责 |
|---|---|
| Iterator | 定义访问和遍历元素的接口 |
| ConcreteIterator | 实现具体遍历逻辑 |
| Aggregate | 定义创建迭代器的接口 |
| ConcreteAggregate | 返回具体迭代器 |

## 代码示例

```csharp
public class NumberCollection : IEnumerable<int>
{
    private readonly int[] nums = { 1, 2, 3 };

    public IEnumerator<int> GetEnumerator()
    {
        foreach (var n in nums)
            yield return n;
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        => GetEnumerator();
}
```

`yield return` 让编译器生成状态机，简化迭代器实现。

## 适用场景

- 需要遍历集合，又不希望暴露集合内部结构。
- 希望为同一集合提供多种遍历方式。
- 需要统一不同集合的遍历接口。

## 常见坑

- 遍历过程中修改集合可能导致迭代器失效或异常。
- 迭代器通常是有状态的，不应假设可以无限次复用同一个实例。
- 在 C# 中优先使用 `IEnumerable<T>` 和 `foreach`，不必手写迭代器。

- 迭代器可分为内部迭代和外部迭代，`foreach` 属于外部迭代。

> 记忆：**遍历逻辑独立封装，客户端不碰集合内部结构。**
