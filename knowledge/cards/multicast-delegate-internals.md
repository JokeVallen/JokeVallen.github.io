---
title: C# 多播委托底层实现
date: 2026-09-23
category: C#
tags: [委托, 多播, 底层原理]
icon: fas fa-code
difficulty: 3
---

## 定义

多播委托是包含多个目标方法的委托对象，底层 `MulticastDelegate` 维护一个调用列表，执行时按列表顺序依次调用。

## 内部结构

| 成员 | 作用 |
|---|---|
| `_target` | 目标对象实例，静态方法为 null |
| `_methodPtr` | 方法入口指针 |
| `_invocationList` | 多播委托的方法列表 |
| `Invoke` | 依次调用列表中的每个委托 |

使用 `+` 或 `+=` 合并委托时，会创建一个新的委托对象，而不是修改原对象。`-` 或 `-=` 会从调用列表中移除最后一个匹配项。

## 代码示例

```csharp
Action action = () => Console.WriteLine("A");
action += () => Console.WriteLine("B");
action(); // 依次输出 A、B
```

## 常见坑

- 某个委托抛出异常会中断后续委托的执行。
- 多线程修改委托变量需要加锁或使用 `Interlocked`。
- 遍历 `GetInvocationList()` 可手动控制异常处理和返回值收集。

## 补充要点

- 单播委托的 `_invocationList` 为 null，多播时才创建数组。
- `Delegate.Combine` 和 `Delegate.Remove` 是编译器生成调用背后的 API。
- 委托是不可变对象，组合操作始终返回新实例。

> 记忆：**多播委托存调用列表，顺序执行；组合生成新对象，异常会中断。**
