---
title: 面向对象三大特性详解
date: 2026-09-23
category: C#
tags: [面向对象, 封装, 继承, 多态]
icon: fas fa-code
difficulty: 1
---

## 定义

面向对象编程的三大特性是封装、继承和多态，它们共同解决代码复用、边界控制和运行时扩展问题。

## 三大特性

| 特性 | 核心含义 | 常用手段 |
|---|---|---|
| 封装 | 隐藏内部实现，只暴露必要接口 | 访问修饰符、属性 |
| 继承 | 子类复用父类的成员并扩展 | `:`、`base` |
| 多态 | 同一接口在不同类型上有不同表现 | `virtual`/`override`、接口 |

## 代码示例

```csharp
public abstract class Animal
{
    public abstract void Speak();
}

public class Dog : Animal
{
    public override void Speak() => Console.WriteLine("Woof");
}

Animal animal = new Dog();
animal.Speak(); // 运行时调用 Dog.Speak
```

父类引用指向子类对象时，调用虚方法会执行子类的实现，这就是运行时多态。

## 常见坑

- 继承表达的是 is-a 关系，不能为了复用代码而滥用。
- 多态依赖虚方法或接口，普通方法隐藏不会产生运行时多态。
- 封装不是把所有字段都写成 `private`，而是控制变化边界。

## 补充要点

- 封装通过属性、方法或访问修饰符控制外部可见性。
- 继承会形成强耦合，优先使用组合替代继承。
- 多态可分为编译期多态和运行时多态。

> 记忆：**封装管边界，继承管复用，多态管扩展。**
