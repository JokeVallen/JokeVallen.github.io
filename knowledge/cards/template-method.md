---
title: 模板方法模式与算法骨架
date: 2026-09-23
category: 设计模式
tags: [行为型, 模板方法, 复用]
icon: fas fa-code
difficulty: 2
---

## 定义

模板方法模式在父类中定义算法的骨架，把某些步骤延迟到子类实现，子类可以在不改变算法结构的情况下重定义某些步骤。

## 核心角色

| 角色 | 职责 |
|---|---|
| AbstractClass | 定义模板方法和抽象步骤 |
| ConcreteClass | 实现具体步骤 |
| Template Method | 固定算法骨架，调用各步骤 |

## 代码示例

```csharp
public abstract class Drink
{
    public void Prepare()
    {
        BoilWater();
        Brew();
        Pour();
        AddCondiments();
    }

    protected void BoilWater() { }
    protected void Pour() { }
    protected abstract void Brew();
    protected abstract void AddCondiments();
}

public class Tea : Drink
{
    protected override void Brew() { }
    protected override void AddCondiments() { }
}
```

## 适用场景

- 多个子类有公共算法骨架，只有部分步骤不同。
- 需要控制扩展点，防止子类修改整体流程。
- 框架和生命周期回调中常用。

## 常见坑

- 模板方法通常声明为 `sealed` 或非虚，防止子类改写骨架。
- 抽象步骤不宜过多，否则子类实现负担过重。
- 与策略模式不同：模板方法用继承固定骨架，策略用组合替换整体算法。

> 记忆：**父类定骨架，子类填步骤；流程不变，细节可变。**
