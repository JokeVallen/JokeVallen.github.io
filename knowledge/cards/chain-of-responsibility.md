---
title: 责任链模式与请求传递
date: 2026-09-23
category: 设计模式
tags: [行为型, 责任链, 解耦]
icon: fas fa-code
difficulty: 2
---

## 定义

责任链模式把请求沿着处理者链传递，直到有一个处理者处理它。发送者不需要知道哪个对象会处理请求。

## 核心角色

| 角色 | 职责 |
|---|---|
| Handler | 定义处理请求的接口和下一个处理者引用 |
| ConcreteHandler | 处理自己负责的请求，否则转发 |
| Client | 组装链并发送请求 |

## 代码示例

```csharp
public abstract class Handler
{
    protected Handler next;
    public Handler SetNext(Handler next) { this.next = next; return next; }
    public abstract void Handle(int level);
}

public class InfoHandler : Handler
{
    public override void Handle(int level)
    {
        if (level <= 1) Console.WriteLine("Info");
        else next?.Handle(level);
    }
}
```

## 适用场景

- 多个对象可能处理同一请求，但具体处理者在运行时确定。
- 需要按顺序执行审批、过滤、日志或校验流程。
- 希望解耦请求发送者与接收者。

## 常见坑

- 请求可能走到链尾仍无人处理，需要明确兜底策略。
- 链过长会影响性能，并增加调试难度。
- 不要在处理器里随意修改链结构，避免出现环。

- 可以结合异步和优先级，但链的语义会变得复杂，需要谨慎设计。

> 记忆：**请求沿链传递，能处理就处理，否则交给下一环。**
