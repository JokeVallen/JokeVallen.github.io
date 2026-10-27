---
title: C# virtual 关键字
date: 2026-09-23
category: C#
tags: [C#, virtual, 多态]
icon: fas fa-code
difficulty: 2
---

## 定义

`virtual` 修饰的方法、属性、索引器或事件可以在派生类中被重写，从而实现运行时多态。

## 代码示例

```csharp
public class Animal
{
    public virtual void Speak() => Console.WriteLine("...");
}

public class Dog : Animal
{
    public override void Speak() => Console.WriteLine("Woof");
}

Animal a = new Dog();
a.Speak(); // 输出 Woof
```

## 规则

- 虚方法通过对象的方法表在运行时决定调用哪个实现。
- 派生类使用 `override` 重写，不能用 `new` 隐藏来实现多态。
- 虚方法不能是 `static`、`private` 或 `sealed`。
- 重写方法可以继续被派生类重写，除非标记 `sealed override`。

## 常见坑

- 构造函数中调用虚方法会执行派生类重写版本，此时派生类字段可能尚未初始化。
- 只有可重写成员才能实现运行时多态。
- 性能通常不是问题，除非在极端热路径中。

- 虚方法表让运行时根据对象实际类型完成动态绑定。

> 记忆：**virtual 允许重写，override 实现多态；运行时按实际类型调用。**
