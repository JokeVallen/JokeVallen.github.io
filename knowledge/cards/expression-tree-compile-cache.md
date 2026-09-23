---
title: 表达式树 Compile 后接近委托
date: 2026-09-23
category: C#
tags: [表达式树, Compile, 缓存]
icon: fas fa-tachometer-alt
difficulty: 2
---

## 结论

表达式树 `Compile()` 本身较慢，但编译出的委托后续调用接近普通委托。

## 调用过程

1. 构建表达式树
2. 调用 `Compile()`
3. 生成 IL 并创建委托
4. 后续直接调用委托

## 示例

```csharp
private static Func<float, float> _abs;

public static float Abs(float x)
{
    if (_abs == null)
    {
        var p = Expression.Parameter(typeof(float), "x");
        var call = Expression.Call(typeof(Mathf), "Abs", null, p);
        _abs = Expression.Lambda<Func<float, float>>(call, p).Compile();
    }

    return _abs(x);
}
```

## 注意

- `Compile()` 必须缓存，不要每帧调用。
- 委托创建后走虚表调用，没有反射的装箱和权限检查。
- 首次编译有成本，适合初始化阶段完成。

> 记忆：**表达式树慢在 Compile，快在调用；编译一次，缓存委托。**