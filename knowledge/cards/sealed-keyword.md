---
title: C# sealed 关键字
date: 2026-09-23
category: C#
tags: [C#, sealed, 继承限制]
icon: fas fa-code
difficulty: 2
---

## 定义

`sealed` 用于阻止继承或重写：修饰类时该类不能被继承，修饰重写成员时该成员不能在后续派生类中继续重写。

## 代码示例

```csharp
public sealed class GameConfig
{
}

public class Base
{
    public virtual void Run() { }
}

public class Derived : Base
{
    public sealed override void Run() { }
}
```

## 使用场景

- 防止关键类型被意外继承和修改。
- 对已重写的方法封口，固定行为。
- 配合 `override` 实现 `sealed override`。

## 常见坑

- `sealed` 类不能被继承，但可以被实例化和引用。
- `sealed` 方法必须同时是 `override`。
- 不要为了性能过早密封，密封的主要收益是设计约束和少量调用优化。

## 补充要点

- 密封类可以避免第三方代码继承后产生不可控行为。
- JIT 对密封类的方法调用可能进行去虚化优化。
- 密封成员仍然可以被正常访问，只是不能继续重写。

> 记忆：**sealed 类不可继承，sealed override 不可再重写。**
