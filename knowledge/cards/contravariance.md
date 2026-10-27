---
title: C# 泛型逆变原理详解
date: 2026-09-23
category: C#
tags: [C#, 逆变, 泛型]
icon: fas fa-code
difficulty: 3
---

## 定义

逆变允许把更一般类型用于更具体类型的位置，核心是“基类方法可以处理派生类参数”。在 C# 中，逆变常用于方法参数和带 `in` 修饰的泛型接口或委托。

## 代码示例

```csharp
Action<object> handleObject = obj => Console.WriteLine(obj);
Action<string> handleString = handleObject; // 逆变

IComparer<object> objectComparer = Comparer<object>.Default;
IComparer<string> stringComparer = objectComparer; // 逆变
```

`Action<in T>` 和 `IComparer<in T>` 中的 `in` 表示 T 只出现在输入位置，因此可以安全逆变。

## 适用场景

- 用基类处理器统一处理派生类参数。
- 为集合提供更通用的比较器或相等比较器。
- 设计可复用的委托和接口时减少类型转换。

## 常见坑

- 逆变只对引用类型和特定泛型声明有效。
- `Func<T>` 的 T 是返回值，只能用协变，不能用逆变。
- 同时输入输出的泛型接口通常是不变的。

> 记忆：**逆变是“入的更一般”，in T 才安全。**
