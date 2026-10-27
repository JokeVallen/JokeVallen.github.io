---
title: 反射操作的是程序元数据
date: 2026-09-23
category: C#
tags: [反射, 元数据, 动态调用]
icon: fas fa-code
difficulty: 2
---

## 结论

反射在运行时读取程序集**元数据**，不分析方法体内部代码。

## 元数据对应关系

| 元数据项 | 反射类型 |
|---|---|
| 类型 | `Type` |
| 方法 | `MethodInfo` |
| 属性 | `PropertyInfo` |
| 字段 | `FieldInfo` |
| 构造函数 | `ConstructorInfo` |

## 能做什么

- 查看类型名称、命名空间、基类、接口
- 获取方法签名、参数列表、返回类型
- 创建实例、调用方法、读写字段和属性
- 读取特性（Attribute）

## 不能做什么

反射**不关心方法里写了什么**。它只知道方法存在、签名是什么、入口地址在哪。方法内部的加法、循环、分支，反射看不到。

```csharp
Type type = typeof(Mathf);
MethodInfo method = type.GetMethod("Abs", new[] { typeof(float) });
Console.WriteLine(method.ReturnType); // System.Single
```

## 注意

- 反射入口通常是字符串或 `Type` 对象。
- `Invoke` 调用的是方法，不是方法体结构。
- 编辑器工具、依赖注入、序列化常用反射。

> 记忆：**反射 = 查程序元数据，看类型、方法、字段，不拆方法体。**