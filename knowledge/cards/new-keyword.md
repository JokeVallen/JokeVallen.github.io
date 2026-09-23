---
title: C# new 修饰符隐藏成员
date: 2026-09-23
category: C#
tags: [C#, new, 成员隐藏]
icon: fas fa-code
difficulty: 3
---

## 定义

`new` 修饰符用于隐藏基类中同名的成员，表示派生类成员与基类成员没有重写关系。它和 `override` 的最大区别是不产生运行时多态。

## 代码示例

```csharp
public class Base
{
    public void Print() => Console.WriteLine("Base");
}

public class Derived : Base
{
    public new void Print() => Console.WriteLine("Derived");
}

Base b = new Derived();
b.Print(); // 输出 Base
```

因为变量类型是 `Base`，调用的是基类方法；如果使用 `override`，则会输出 `Derived`。

## new 的其他用法

- 作为对象创建运算符：`new MyClass()`。
- 作为泛型约束：`where T : new()`。
- 作为成员隐藏修饰符，即本卡片重点。

## 常见坑

- 隐藏成员容易造成调用结果与预期不一致，应尽量避免。
- 需要多态时不要用 `new`，应使用 `virtual`/`override`。
- 不加 `new` 也能隐藏，但编译器会给出警告。

- `new` 隐藏成员时，基类引用仍调用基类实现。

> 记忆：**new 是隐藏，override 是重写；隐藏看变量类型，重写看实际类型。**
