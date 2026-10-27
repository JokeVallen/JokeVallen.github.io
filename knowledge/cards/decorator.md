---
title: 装饰器模式与动态职责扩展
date: 2026-09-23
category: 设计模式
tags: [结构型, 装饰器, 动态扩展]
icon: fas fa-code
difficulty: 3
---

## 定义

装饰器模式在不改变原类的前提下，通过包装对象动态地给对象添加职责，比继承更灵活。

## 核心角色

| 角色 | 职责 |
|---|---|
| Component | 定义统一接口 |
| ConcreteComponent | 被装饰的原始对象 |
| Decorator | 持有 Component 引用并实现同一接口 |
| ConcreteDecorator | 在调用前后添加额外行为 |

## 代码示例

```csharp
public interface ICoffee { decimal Cost(); }
public class Espresso : ICoffee { public decimal Cost() => 20m; }

public class MilkDecorator : ICoffee
{
    private readonly ICoffee inner;
    public MilkDecorator(ICoffee inner) => this.inner = inner;
    public decimal Cost() => inner.Cost() + 5m;
}
```

调用 `new MilkDecorator(new Espresso()).Cost()` 得到 25。

## 适用场景

- 需要在不修改类的情况下动态增加或撤销功能。
- 继承会导致子类数量爆炸，例如多种配料组合。
- 需要为对象叠加多个独立职责。

## 常见坑

- 装饰器与被装饰对象必须实现同一接口，否则无法透明替换。
- 多层装饰会增加调试和调用链复杂度。
- 装饰器不改变接口，若需要改变接口应考虑适配器。

- 装饰顺序会影响最终结果，尤其是存在前后置逻辑时。

> 记忆：**同接口包一层，动态叠加职责；比继承更灵活。**
