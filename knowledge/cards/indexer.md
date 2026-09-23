---
title: C# 索引器原理与用法
date: 2026-09-23
category: C#
tags: [C#, 索引器, 属性]
icon: fas fa-code
difficulty: 2
---

## 定义

索引器允许对象像数组一样用 `this[参数]` 访问元素，本质上是带参数的属性，常用于封装集合或映射。

## 代码示例

```csharp
public class SampleCollection<T>
{
    private T[] items = new T[10];

    public T this[int index]
    {
        get => items[index];
        set => items[index] = value;
    }
}
```

使用方式：

```csharp
var collection = new SampleCollection<int>();
collection[0] = 42;
Console.WriteLine(collection[0]);
```

## 特点

- 索引器可以重载，参数类型和个数可以不同。
- 可以只有 get 或 set，也可以同时具备。
- 接口中可以声明索引器，由实现类提供具体逻辑。

## 常见坑

- 索引器参数不一定是 `int`，也可以是字符串或其他类型。
- 索引器不是数组，越界、缺失键等行为由实现决定。
- 不要在索引器中执行过于复杂的逻辑，以免调用方误以为访问成本很低。

- 索引器可以拥有多个参数，例如矩阵的 this[int row, int col]。

> 记忆：**索引器就是带参数的属性，让对象支持 this[...] 访问。**
