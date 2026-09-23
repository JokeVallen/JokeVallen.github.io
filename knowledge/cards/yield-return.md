---
title: yield return 迭代器
date: 2026-09-22
category: C#
tags: [yield, 迭代器, 协程, C#]
icon: fas fa-sync
difficulty: 2
---

## 定义

`yield return` 用于生成迭代器（`IEnumerable` / `IEnumerator`），编译器会把它编译成一个**状态机类**。

## 核心特性

- **惰性执行**：调用时不执行方法体；每次 `MoveNext()` 才执行到下一个 `yield return` 并暂停
- **保存状态**：局部变量、执行位置都保存在状态机里
- `yield break` 表示迭代结束

## 语法限制

- ❌ 不能放在带 `catch` 的 try 块中
- ✅ 可以放在只有 `finally` 的 try 中
- ❌ 不能放在 `unsafe` 块、匿名方法、Lambda 中

## 示例

```csharp
public IEnumerable<int> Fibonacci(int n)
{
    int a = 0, b = 1;
    for (int i = 0; i < n; i++)
    {
        yield return a;
        (a, b) = (b, a + b);
    }
}
```

## 与返回数组对比

| 方式 | 执行 | 空间 |
|---|---|---|
| 返回数组 | 立即全算 | O(n) |
| yield | 惰性按需 | O(1) |

## Unity 应用

协程本质就是迭代器（`IEnumerator`），由 Unity 的 PlayerLoop 驱动 `MoveNext`。

> 高频路径注意 GC：每次枚举可能产生状态机分配。