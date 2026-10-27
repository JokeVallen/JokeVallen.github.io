---
title: C# abstract 关键字
date: 2026-09-23
category: C#
tags: [C#, abstract, 抽象]
icon: fas fa-code
difficulty: 2
---

## 定义

`abstract` 表示抽象成员或抽象类。抽象类不能实例化，抽象成员没有实现，必须在非抽象派生类中被重写。

## 代码示例

```csharp
public abstract class Shape
{
    public abstract double Area();
}

public class Circle : Shape
{
    public double Radius { get; set; }
    public override double Area() => Math.PI * Radius * Radius;
}
```

## 规则

- 抽象方法只能声明在抽象类中。
- 抽象类可以包含字段、构造函数和普通方法。
- 派生类必须实现所有抽象成员，除非派生类也是抽象类。
- 抽象成员隐式是虚成员，但不能用 `virtual` 同时修饰。

## 常见坑

- 抽象类不能被 `new`，但可以作为引用类型使用。
- 抽象方法不能是 `private`。
- 接口与抽象类不同：接口定义契约，抽象类可以包含共享实现。

- 抽象类可以有构造函数，供派生类通过 base 调用。

> 记忆：**abstract 只声明不实现，子类必须 override；抽象类不能 new。**
