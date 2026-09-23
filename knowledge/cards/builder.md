---
title: 建造者模式与分步构建
date: 2026-09-23
category: 设计模式
tags: [创建型, 建造者, 分步构建]
icon: fas fa-code
difficulty: 2
---

## 定义

建造者模式把复杂对象的构建过程与表示分离，使同样的构建过程可以创建不同的表示。

## 核心角色

| 角色 | 职责 |
|---|---|
| Builder | 定义构建步骤的接口 |
| ConcreteBuilder | 实现步骤并保存结果 |
| Director | 按固定顺序调用构建步骤 |
| Product | 被构建的复杂对象 |

## 代码示例

```csharp
public class Pizza
{
    public string Size { get; set; }
    public bool Cheese { get; set; }
}

public class PizzaBuilder
{
    private readonly Pizza pizza = new Pizza();
    public PizzaBuilder Size(string size) { pizza.Size = size; return this; }
    public PizzaBuilder WithCheese() { pizza.Cheese = true; return this; }
    public Pizza Build() => pizza;
}
```

链式调用让可选参数的组合更清晰。

## 适用场景

- 对象构造参数多，且存在大量可选参数。
- 构造过程需要按固定步骤执行。
- 同一构建过程需要生成不同表示。

## 常见坑

- 建造者对象通常不是线程安全的，不要在多个线程共享同一个实例。
- Product 不应在构建完成前被外部修改。
- 如果对象很简单，直接构造函数或对象初始化器即可，不必上建造者。

> 记忆：**分步构建复杂对象，构建过程与表示分离。**
