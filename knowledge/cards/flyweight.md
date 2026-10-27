---
title: 享元模式与共享对象复用
date: 2026-09-23
category: 设计模式
tags: [结构型, 享元, 对象共享]
icon: fas fa-code
difficulty: 3
---

## 定义

享元模式通过共享细粒度对象来减少内存占用，把对象状态分为可共享的内部状态和随环境变化的外部状态。

## 核心角色

| 角色 | 职责 |
|---|---|
| Flyweight | 封装内部状态 |
| ConcreteFlyweight | 具体享元实现 |
| FlyweightFactory | 缓存并复用享元对象 |
| Client | 保存或传入外部状态 |

## 代码示例

```csharp
public class TreeType
{
    public string Name { get; }
    public string Texture { get; }
    public TreeType(string name, string texture)
    {
        Name = name;
        Texture = texture;
    }
}

public class TreeFactory
{
    private readonly Dictionary<string, TreeType> cache = new();

    public TreeType GetTreeType(string name, string texture)
    {
        if (!cache.TryGetValue(name, out var type))
        {
            type = new TreeType(name, texture);
            cache[name] = type;
        }
        return type;
    }
}
```

树的位置是外部状态，树类型是内部状态，大量树共享少量 `TreeType`。

## 适用场景

- 系统中存在大量相似对象，内存占用高。
- 对象状态可以明确拆分为内部状态和外部状态。
- 需要缓存和复用细粒度对象。

## 常见坑

- 外部状态不能存入享元对象，否则共享会出错。
- 享元工厂通常需要缓存清理策略，否则可能变相内存泄漏。
- 共享对象如果可变，必须保证线程安全或不可变。

> 记忆：**内部状态共享，外部状态传入；工厂缓存，省内存。**
