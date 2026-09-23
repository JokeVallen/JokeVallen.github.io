---
title: C# foreach 的工作原理
date: 2026-09-23
category: C#
tags: [C#, foreach, 迭代器]
icon: fas fa-code
difficulty: 3
---

## 定义

`foreach` 是编译器提供的语法糖。编译后，它会调用集合的 `GetEnumerator`，循环调用 `MoveNext`，通过 `Current` 取元素，并在结束时释放迭代器。

## 编译展开

```csharp
foreach (var item in collection)
{
    Console.WriteLine(item);
}
```

大致等价于：

```csharp
var enumerator = collection.GetEnumerator();
try
{
    while (enumerator.MoveNext())
    {
        var item = enumerator.Current;
        Console.WriteLine(item);
    }
}
finally
{
    enumerator.Dispose();
}
```

## 类型要求

- 集合类型需要可访问的 `GetEnumerator` 方法。
- 返回的枚举器需要 `MoveNext` 和 `Current`。
- 如果枚举器实现 `IDisposable`，`foreach` 会自动调用 `Dispose`。
- 数组会被编译器特殊处理为按索引遍历。

## 常见坑

- 遍历过程中修改集合通常会使迭代器失效。
- `foreach` 变量在旧版本 C# 中可被闭包捕获，需注意版本差异。
- 自定义集合应正确实现迭代器释放逻辑。

## 补充要点

- 数组的 `foreach` 可能被编译为索引循环，减少枚举器分配。
- `Span<T>` 和 `ReadOnlySpan<T>` 有专门的 ref struct 枚举器。
- 自定义集合可通过 `GetEnumerator` 返回结构体枚举器以减少装箱。

> 记忆：**foreach 展开为 GetEnumerator、MoveNext、Current，最后 Dispose。**
