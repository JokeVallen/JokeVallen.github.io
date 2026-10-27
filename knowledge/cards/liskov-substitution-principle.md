---
title: 里氏替换原则 LSP
date: 2026-09-23
category: 设计原则
tags: [SOLID, LSP, 继承]
icon: fas fa-code
difficulty: 2
---

## 定义

里氏替换原则要求子类型必须能够替换父类型，且不改变程序的正确性。子类可以扩展行为，但不能违背父类契约。

## 约束规则

- 前置条件不能比父类更强：父类允许的输入，子类也必须接受。
- 后置条件不能比父类更弱：父类承诺的结果，子类必须保证。
- 不变式必须保持，历史记录规则不能被破坏。

## 经典反例

```csharp
public class Rectangle
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
}

public class Square : Rectangle
{
    public override int Width { set { base.Width = base.Height = value; } }
    public override int Height { set { base.Width = base.Height = value; } }
}
```

把 `Square` 当 `Rectangle` 使用时，分别设置宽高会得到意外结果。

## 常见坑

- 继承表达的应是“is-a”且行为契约一致，不能只看数据字段相似。
- 子类重写方法时抛出父类没有声明的异常，也会破坏 LSP。
- 优先组合而非继承，可减少违反 LSP 的风险。

> 记忆：**子类能替换父类，契约只强不弱；行为不一致，就别用继承。**
