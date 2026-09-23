---
title: C# 静态构造函数原理
date: 2026-09-23
category: C#
tags: [C#, 静态构造函数, 类型初始化]
icon: fas fa-code
difficulty: 2
---

## 定义

静态构造函数在类型第一次被使用前由 CLR 自动调用一次，用于初始化静态字段或执行一次性类型级逻辑。

## 代码示例

```csharp
public class Config
{
    public static readonly Dictionary<string, string> Values;

    static Config()
    {
        Values = new Dictionary<string, string>();
        Values["version"] = "1.0";
    }
}
```

## 规则

- 不能有访问修饰符和参数。
- 不能直接调用，由运行时自动触发。
- 一个类只能有一个静态构造函数。
- CLR 保证多个线程同时首次访问时只执行一次。

## 常见坑

- 静态构造函数中抛异常会导致类型不可用，后续访问继续抛出 `TypeInitializationException`。
- 不要在里面执行耗时或依赖外部状态的操作。
- 静态字段初始化顺序按文本顺序执行，职责应保持简单。

> 记忆：**类型首次使用前执行一次，无参无修饰符，CLR 保证线程安全。**
