---
title: 抽象工厂模式与产品族创建
date: 2026-09-23
category: 设计模式
tags: [创建型, 抽象工厂, 产品族]
icon: fas fa-code
difficulty: 3
---

## 定义

抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们的具体类。

## 核心角色

| 角色 | 职责 |
|---|---|
| AbstractFactory | 声明创建多个产品的接口 |
| ConcreteFactory | 实现某一产品族 |
| AbstractProduct | 产品接口 |
| ConcreteProduct | 具体产品 |
| Client | 只使用抽象工厂和抽象产品 |

## 代码示例

```csharp
public interface IButton { void Render(); }
public interface ICheckbox { void Render(); }

public interface IUIFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

public class DarkUIFactory : IUIFactory
{
    public IButton CreateButton() => new DarkButton();
    public ICheckbox CreateCheckbox() => new DarkCheckbox();
}
```

切换主题时只需替换 `IUIFactory` 实现，客户端代码不变。

## 适用场景

- 系统需要独立于产品的创建、组合和表示。
- 需要确保同一产品族中的对象一起使用。
- 需要提供多个可切换的产品系列。

## 常见坑

- 增加新的产品种类需要修改所有工厂接口，违反开闭原则。
- 抽象工厂适合“产品族稳定、产品种类少”的场景。
- 不要把抽象工厂和工厂方法混为一谈：前者创建一族产品，后者创建一个产品。

> 记忆：**一个工厂造一族产品，切换工厂就切换整套风格。**
