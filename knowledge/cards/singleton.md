---
title: 单例模式与唯一实例控制
date: 2026-09-23
category: 设计模式
tags: [创建型, 单例, 线程安全]
icon: fas fa-code
difficulty: 2
---

## 定义

单例模式保证一个类只有一个实例，并提供一个全局访问点。

## 实现要点

- 构造函数私有化，阻止外部直接创建。
- 提供静态属性或方法返回唯一实例。
- 多线程环境下必须保证延迟初始化的线程安全。

## 代码示例

```csharp
public sealed class GameConfig
{
    private static readonly Lazy<GameConfig> instance =
        new Lazy<GameConfig>(() => new GameConfig());

    public static GameConfig Instance => instance.Value;

    private GameConfig() { }
}
```

`Lazy<T>` 默认使用线程安全模式，实现简单且延迟创建。

## 适用场景

- 全局配置、资源管理器、对象池等确实只需要一个实例的组件。
- 需要严格控制全局访问点，避免重复初始化昂贵资源。

## 常见坑

- 单例会引入全局状态，导致测试困难、依赖关系隐藏。
- 不要把所有工具类都做成单例，优先考虑依赖注入。
- 反射、序列化和多进程环境可能破坏单例唯一性。

> 记忆：**私有构造，全局入口；一个类，一个实例。**
