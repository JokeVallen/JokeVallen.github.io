---
title: C# readonly 关键字
date: 2026-09-23
category: C#
tags: [C#, readonly, 不可变]
icon: fas fa-code
difficulty: 2
---

## 定义

`readonly` 修饰的字段只能在声明时或所在类的构造函数中赋值，之后不能重新指向其他对象。

## 与 const 对比

| 维度 | readonly | const |
|---|---|---|
| 赋值时机 | 声明时或构造函数 | 编译期常量 |
| 类型范围 | 任意类型 | 编译期可确定的基元类型等 |
| 静态性 | 可实例可静态 | 隐式静态 |
| 运行时变化 | 不同实例可有不同值 | 全局固定 |

## 代码示例

```csharp
public class Config
{
    public readonly List<int> Values = new();

    public Config()
    {
        Values.Add(1); // 可以修改对象内容
        // Values = new List<int>(); // 不允许重新赋值
    }
}
```

## 常见坑

- `readonly` 只保证引用不变，不保证引用对象的内容不可变。
- 需要深度不可变时应使用不可变集合或只读包装。
- `const` 的值会被编译进调用方程序集，修改后需要重新编译引用方。

## 补充要点

- 静态 readonly 字段适合表示运行时才能确定的单例配置。
- 结构体中的 readonly 字段有助于编译器进行防御性复制优化。
- `readonly struct` 表示整个结构体不可变，可减少副本。

- 只读字段可以在构造函数中根据参数赋值，因此实例之间可以不同。

> 记忆：**readonly 锁定引用，不锁内容；const 是编译期常量。**
