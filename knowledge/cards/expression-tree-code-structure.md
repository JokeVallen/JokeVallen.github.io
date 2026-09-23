---
title: 表达式树表示代码结构
date: 2026-09-23
category: C#
tags: [表达式树, 语法树, Lambda]
icon: fas fa-sitemap
difficulty: 2
---

## 结论

表达式树把 Lambda 表达式表示为**树形对象**，每个节点代表一段代码结构。

## 常见节点

| 节点类型 | 代表含义 |
|---|---|
| `ParameterExpression` | 参数 |
| `BinaryExpression` | 二元运算，如 `+`、`*` |
| `MethodCallExpression` | 方法调用 |
| `ConstantExpression` | 常量 |
| `LambdaExpression` | 整体 Lambda |

## 示例

```csharp
Expression<Func<int, int, int>> expr = (a, b) => a + b * 3;
```

这棵树的结构是：

1. 参数 `a`
2. 参数 `b`
3. 常量 `3`
4. `b * 3` 乘法节点
5. `a + (b * 3)` 加法节点

## 能做什么

- 分析代码结构
- 修改节点，重新组合表达式
- 调用 `Compile()` 生成可执行委托

## 注意

表达式树操作的是**逻辑结构**，不是元数据。它不关心 `Mathf.Abs` 存在哪个内存地址，只关心“这里发生了一次方法调用”。

> 记忆：**表达式树 = 把代码拆成节点树，参数、运算、调用都是节点。**