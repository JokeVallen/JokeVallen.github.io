---
title: C# 析构函数与资源释放
date: 2026-09-23
category: C#
tags: [析构函数, GC, 资源释放]
icon: fas fa-code
difficulty: 2
---

## 定义

C# 析构函数写成 `~类名()`，由垃圾回收器在对象被回收前调用，用于释放非托管资源，但调用时机不确定。

## 代码示例

```csharp
public class FileHandle
{
    private IntPtr handle;

    ~FileHandle()
    {
        // 释放非托管句柄
    }
}
```

## 关键规则

- 析构函数不能有访问修饰符、参数，也不能被重载。
- 调用时机由 GC 决定，程序退出时不一定执行。
- 有析构函数的对象会经历更长的回收流程，可能影响性能。
- 推荐实现 `IDisposable`，由调用方显式释放。
- 标准模式是 `Dispose` 中调用 `GC.SuppressFinalize(this)`。

## 常见坑

- 不要依赖析构函数及时释放文件、网络连接等稀缺资源。
- 析构函数中不要访问其他托管对象，因为它们的回收顺序不确定。
- 仅用于封装非托管资源的兜底释放。

> 记忆：**析构靠 GC，时机不确定；确定性释放用 Dispose。**
