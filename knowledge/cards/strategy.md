---
title: 策略模式与算法动态替换
date: 2026-09-23
category: 设计模式
tags: [行为型, 策略, 算法替换]
icon: fas fa-code
difficulty: 1
---

## 定义

策略模式定义一系列算法，把它们分别封装起来，并使它们可以互相替换，让算法变化独立于客户端。

## 核心角色

| 角色 | 职责 |
|---|---|
| Strategy | 定义所有策略的公共接口 |
| ConcreteStrategy | 实现具体算法 |
| Context | 持有策略引用并调用它 |

## 代码示例

```csharp
public interface ISortStrategy
{
    void Sort(int[] data);
}

public class QuickSortStrategy : ISortStrategy
{
    public void Sort(int[] data) { /* 快速排序 */ }
}

public class Context
{
    private readonly ISortStrategy strategy;
    public Context(ISortStrategy strategy) => this.strategy = strategy;
    public void Execute(int[] data) => strategy.Sort(data);
}
```

客户端可以在运行时选择不同排序策略。

## 适用场景

- 同一问题有多种算法，需要在运行时切换。
- 希望避免大量条件分支选择算法。
- 算法需要独立演化或被单元测试替换。

## 常见坑

- 策略类数量可能增多，客户端必须了解各策略差异。
- 策略之间应保持接口一致，不能把无关参数硬塞进公共接口。
- 策略模式不改变算法内部实现，只负责选择与委托。

> 记忆：**算法封装成策略，运行时替换；客户端只依赖抽象。**
