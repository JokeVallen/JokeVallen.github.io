---
title: C# 泛型协变原理详解
date: 2026-09-23
category: C#
tags: [C#, 协变, 泛型]
icon: fas fa-code
difficulty: 3
---

## 定义

协变允许把更具体类型用于更一般类型的位置，核心是“派生类可以当作基类使用”。在 C# 中，协变常用于返回值、数组和带 `out` 修饰的泛型接口或委托。

## 代码示例

```csharp
IEnumerable<string> strings = new List<string>();
IEnumerable<object> objects = strings; // 协变

Func<string> getString = () => "hello";
Func<object> getObject = getString; // 返回值协变
```

`IEnumerable<out T>` 中的 `out` 表示 T 只出现在输出位置，因此可以安全协变。

## 适用场景

- 只读集合接口向更一般类型转换。
- 委托返回值类型向基类转换。
- 避免不必要的类型转换和复制。

## 常见坑

- 协变只对引用类型和特定泛型声明有效，值类型不支持。
- `IList<T>` 是不变的，因为 T 同时出现在输入和输出位置。
- 数组协变在运行时可能抛出 `ArrayTypeMismatchException`，应谨慎使用。

> 记忆：**协变是“出的更具体”，out T 才安全。**
