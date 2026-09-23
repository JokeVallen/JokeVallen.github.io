---
title: 开闭原则与可扩展设计
date: 2026-09-23
category: 设计原则
tags: [SOLID, OCP, 扩展]
icon: fas fa-code
difficulty: 2
---

## 定义

开闭原则要求软件实体对扩展开放、对修改关闭：新增功能时优先新增代码，而不是修改已有稳定代码。

## 实现方式

- 面向抽象编程，使用接口或抽象类定义稳定契约。
- 通过多态让新增实现类替代修改分支逻辑。
- 结合策略模式、工厂模式或依赖注入装配扩展点。

## 反例

```csharp
public double Area(object shape)
{
    if (shape is Circle c) return Math.PI * c.Radius * c.Radius;
    if (shape is Rectangle r) return r.Width * r.Height;
    throw new NotSupportedException();
}
```

每增加一种图形都要修改 `Area` 方法。

## 正例

```csharp
public interface IShape { double Area(); }
public class Circle : IShape
{
    public double Radius { get; set; }
    public double Area() => Math.PI * Radius * Radius;
}
```

新增图形只需增加 `IShape` 实现类，`Area` 调用方不需要修改。

## 常见坑

- 对修改关闭不是禁止修 Bug，而是不因新增同类功能反复改稳定抽象。
- 抽象设计过早也会增加复杂度；应先观察稳定的变化方向。
- 不能为了 OCP 而让所有类都套一层接口。

> 记忆：**新增实现，不改调用；面向抽象，隔离变化。**
