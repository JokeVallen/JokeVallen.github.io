---
title: 非托管资源与释放模式
date: 2026-09-23
category: C#
tags: [非托管资源, IDisposable, 资源释放]
icon: fas fa-code
difficulty: 3
---

## 定义

非托管资源是不由 .NET GC 管理的资源，例如文件句柄、Socket、数据库连接、GDI 对象和原生内存，必须显式释放。

## 常见类型

| 资源 | 释放方式 |
|---|---|
| 文件流 | `FileStream.Dispose()` |
| 网络连接 | `Socket.Dispose()` |
| 数据库连接 | `DbConnection.Dispose()` |
| 原生句柄 | `SafeHandle` 或 `Dispose` |

## 标准释放模式

```csharp
public class ResourceHolder : IDisposable
{
    private bool disposed;

    public void Dispose()
    {
        if (disposed) return;
        // 释放非托管资源
        disposed = true;
        GC.SuppressFinalize(this);
    }
}
```

调用方应使用 `using` 或 `using` 声明确保释放。

## 常见坑

- 只依赖析构函数会导致资源长时间不释放。
- `Dispose` 应可重复调用，重复调用不应抛异常。
- 封装原生句柄优先使用 `SafeHandle`，它本身是安全的终结器封装。

## 补充要点

- `SafeHandle` 通过引用计数和终结器保证句柄最终释放。
- `using` 声明在作用域结束时自动调用 `Dispose`。
- 释放顺序应从依赖方到被依赖方，避免句柄仍被使用。

- 终结器只能作为兜底，不能替代确定性的 `Dispose` 调用。

> 记忆：**非托管资源必须显式释放；using + Dispose，SafeHandle 兜底。**
