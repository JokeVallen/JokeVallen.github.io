---
title: C# 方法重载与解析
date: 2026-09-23
category: C#
tags: [C#, 重载, 编译期]
icon: fas fa-code
difficulty: 1
---

## 定义

方法重载是在同一个类中定义多个同名方法，但参数列表不同。编译器在编译期根据参数类型和个数选择具体方法。

## 代码示例

```csharp
public class Printer
{
    public void Print(int value) { }
    public void Print(string value) { }
    public void Print(int a, int b) { }
}
```

## 重载判断依据

- 方法名相同。
- 参数个数、类型或顺序不同。
- 返回类型不同不构成重载。
- 仅访问修饰符不同也不构成重载。

## 适用场景

- 为同一操作提供不同的参数形式。
- 提供默认值或便捷重载。
- 避免调用方进行重复类型转换。

## 常见坑

- 重载在编译期解析，不产生运行时多态。
- 可空类型、`null` 和隐式转换可能造成重载解析歧义。
- 参数过多时应考虑命名参数、可选参数或建造者模式。

> 记忆：**重载看参数列表，编译期决定；返回类型不算差异。**
