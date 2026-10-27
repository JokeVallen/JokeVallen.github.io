---
title: 表达式树不是反射但可互操作
date: 2026-09-23
category: C#
tags: [表达式树, 反射, 对比]
icon: fas fa-code
difficulty: 3
---

## 结论

表达式树**不是反射**。两者都能动态调用代码，但操作对象不同。

## 本质对比

| 维度 | 反射 | 表达式树 |
|---|---|---|
| 操作对象 | 程序元数据 | 抽象语法树 |
| 典型入口 | `Type.GetMethod` | `Expression<T>` |
| 调用方式 | `MethodInfo.Invoke` | `Compile()` 后调用委托 |
| 每次调用开销 | 较高 | 接近普通委托 |
| 主要场景 | 编辑器工具、一次性初始化 | 高频调用、热更新绑定 |

## 联系

`Expression<T>.Compile()` 底层可能借助 `Reflection.Emit` 生成 IL，再创建委托。因此表达式树在**编译阶段**用到了反射发射技术，但表达式树本身不是反射。

## 代码对比

```csharp
// 反射调用
var method = typeof(Mathf).GetMethod("Abs", new[] { typeof(float) });
float a = (float)method.Invoke(null, new object[] { -1f });

// 表达式树调用
var p = Expression.Parameter(typeof(float), "x");
var call = Expression.Call(typeof(Mathf), "Abs", null, p);
var abs = Expression.Lambda<Func<float, float>>(call, p).Compile();
float b = abs(-1f);
```

> 记忆：**反射查元数据，表达式树拆代码结构；Compile 底层可能用反射发射，但两者不是一回事。**