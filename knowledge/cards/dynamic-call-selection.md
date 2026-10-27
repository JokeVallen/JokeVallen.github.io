---
title: 动态调用选型反射还是表达式树
date: 2026-09-23
category: C#
tags: [动态调用, 选型, 性能]
icon: fas fa-project-diagram
difficulty: 2
---

## 结论

低频、一次性、工具类场景用反射；高频、运行时、热更新场景用表达式树或源生成器。

## 选型表

| 场景 | 推荐方案 | 原因 |
|---|---|---|
| 编辑器工具 | 反射 | 代码简单，调用次数少 |
| 依赖注入初始化 | 反射 | 启动时执行一次 |
| UI 事件绑定 | 表达式树 | 运行时频繁触发 |
| 热更新属性访问 | 表达式树 | 避免反射 Invoke 开销 |
| AOT 平台 | 源生成器 | 避免运行时 IL 生成 |
| 序列化 | 表达式树 + 缓存 | 高频读写字段 |

## 混合用法

可以先用反射获取 `MethodInfo`，再用表达式树绑定调用：

```csharp
MethodInfo method = typeof(Mathf).GetMethod("Abs", new[] { typeof(float) });
var p = Expression.Parameter(typeof(float), "x");
var call = Expression.Call(Expression.Constant(null), method, p);
var func = Expression.Lambda<Func<float, float>>(call, p).Compile();
```

## 注意

- 表达式树仍需缓存 `Compile()` 结果。
- IL2CPP 下优先考虑源生成器。
- 不要为了动态而动态，能静态绑定就静态绑定。

> 记忆：**低频反射，高频表达式树，AOT 源生成器。**