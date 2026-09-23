---
title: 桥接模式与多维抽象分离
date: 2026-09-23
category: 设计模式
tags: [结构型, 桥接, 抽象分离]
icon: fas fa-code
difficulty: 3
---

## 定义

桥接模式把抽象部分与实现部分分离，使它们可以独立变化。它用组合关系代替继承关系，避免多维度扩展导致的类爆炸。

## 核心角色

| 角色 | 职责 |
|---|---|
| Abstraction | 抽象角色，持有 Implementor 引用 |
| RefinedAbstraction | 扩展抽象角色 |
| Implementor | 实现类接口 |
| ConcreteImplementor | 具体实现 |

## 代码示例

```csharp
public interface IRenderer
{
    void Render(string shape);
}

public class VectorRenderer : IRenderer
{
    public void Render(string shape) { }
}

public abstract class Shape
{
    protected readonly IRenderer renderer;
    protected Shape(IRenderer renderer) => this.renderer = renderer;
    public abstract void Draw();
}

public class Circle : Shape
{
    public Circle(IRenderer renderer) : base(renderer) { }
    public override void Draw() => renderer.Render("Circle");
}
```

图形类型和渲染方式可以各自扩展，互不干扰。

## 适用场景

- 一个类存在两个或多个独立变化的维度。
- 不希望使用多层继承导致子类数量爆炸。
- 需要在运行时切换实现部分。

## 常见坑

- 桥接与策略结构相似，但桥接强调分离抽象层次，策略强调替换算法。
- 识别变化维度是关键，维度找错会导致抽象不稳定。
- 增加维度会增加组合复杂度，简单场景不必强行使用。

> 记忆：**抽象与实现各成体系，用组合桥接，别让继承爆炸。**
