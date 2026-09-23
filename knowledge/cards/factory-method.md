---
title: 工厂方法模式与创建延迟
date: 2026-09-23
category: 设计模式
tags: [创建型, 工厂方法, 多态]
icon: fas fa-code
difficulty: 2
---

## 定义

工厂方法模式定义创建对象的接口，让子类决定实例化哪一个类，使类的实例化延迟到子类。

## 核心角色

| 角色 | 职责 |
|---|---|
| Product | 定义产品接口 |
| ConcreteProduct | 具体产品实现 |
| Creator | 声明工厂方法，返回 Product |
| ConcreteCreator | 重写工厂方法，返回具体产品 |

## 代码示例

```csharp
public interface IEnemy { void Attack(); }
public class Goblin : IEnemy { public void Attack() { } }
public class Dragon : IEnemy { public void Attack() { } }

public abstract class EnemyFactory
{
    public abstract IEnemy Create();
}

public class GoblinFactory : EnemyFactory
{
    public override IEnemy Create() => new Goblin();
}
```

调用方只依赖 `EnemyFactory` 和 `IEnemy`，新增敌人时增加工厂子类即可。

## 适用场景

- 一个类不知道它需要创建哪个具体产品。
- 希望把产品创建逻辑交给子类扩展。
- 需要隔离产品创建与使用，降低耦合。

## 常见坑

- 每新增一种产品通常要新增一个工厂类，类数量会增长。
- 简单工厂只是把创建逻辑集中到静态方法，不属于严格意义上的工厂方法模式。
- 工厂方法解决“创建哪一种产品”，抽象工厂解决“创建哪一族产品”。

> 记忆：**父类定创建接口，子类决定 new 哪个产品。**
