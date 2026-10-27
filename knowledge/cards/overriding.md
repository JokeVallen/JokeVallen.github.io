---
title: C# 方法重写与多态
date: 2026-09-23
category: C#
tags: [C#, 重写, 多态]
icon: fas fa-code
difficulty: 2
---

## 定义

方法重写是派生类用 `override` 重新实现基类的 `virtual`、`abstract` 或已重写方法，调用时根据对象实际类型执行。

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

## 重写规则

- 方法签名必须与基类虚方法一致。
- 基类成员必须是 `virtual`、`abstract` 或 `override`。
- 访问级别不能比基类更严格。
- 可以使用 `base.Speak()` 调用基类实现。
- 使用 `sealed override` 可以停止后续重写。

## 与隐藏对比

| 维度 | 重写 override | 隐藏 new |
|---|---|---|
| 多态 | 支持 | 不支持 |
| 决定时机 | 运行时 | 编译期 |
| 基类要求 | virtual/abstract | 无 |

## 补充要点

- 重写方法参与虚方法表，运行时根据对象实际类型查找实现。
- `base` 可在重写方法中调用基类版本。
- 构造函数、静态方法和私有方法不能重写。

- 重写方法不能使用 `new` 同时隐藏，二者语义不同。

> 记忆：**重写加 override，运行时看实际类型；签名一致，访问不能更严。**
