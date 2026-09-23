---
title: 代理模式与对象访问控制
date: 2026-09-23
category: 设计模式
tags: [结构型, 代理, 访问控制]
icon: fas fa-code
difficulty: 2
---

## 定义

代理模式为其他对象提供一种代理，以控制对原对象的访问。代理与被代理对象实现同一接口，客户端无感知。

## 常见类型

| 类型 | 用途 |
|---|---|
| 虚拟代理 | 延迟创建开销大的对象 |
| 保护代理 | 控制访问权限 |
| 远程代理 | 代表远程对象 |
| 智能引用 | 增加引用计数、日志等 |

## 代码示例

```csharp
public interface IImage { void Display(); }

public class RealImage : IImage
{
    public RealImage(string path) { /* 加载图片 */ }
    public void Display() { }
}

public class ImageProxy : IImage
{
    private RealImage image;
    private readonly string path;
    public ImageProxy(string path) => this.path = path;

    public void Display()
    {
        image ??= new RealImage(path);
        image.Display();
    }
}
```

首次访问时才创建真实对象，实现延迟加载。

## 适用场景

- 需要延迟加载、权限校验、访问日志或远程调用。
- 不希望修改原对象，又要控制其访问。
- 需要为对象增加引用计数或缓存。

## 常见坑

- 代理与装饰器结构相似：代理控制访问，装饰器增加职责。
- 代理不应改变原对象的语义结果，否则会破坏替换性。
- 动态代理会增加调试难度，需保留清晰日志。

> 记忆：**同接口包一层，控制访问；可延迟、可鉴权、可远程。**
