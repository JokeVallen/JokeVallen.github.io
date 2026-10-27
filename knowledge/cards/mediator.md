---
title: 中介者模式与星形解耦
date: 2026-09-23
category: 设计模式
tags: [行为型, 中介者, 解耦]
icon: fas fa-code
difficulty: 2
---

## 定义

中介者模式用一个中介对象封装一系列对象之间的交互，使对象之间不再显式相互引用，从而降低耦合。

## 核心角色

| 角色 | 职责 |
|---|---|
| Mediator | 定义同事对象通信的接口 |
| ConcreteMediator | 协调多个同事对象 |
| Colleague | 持有中介者引用并与其通信 |

## 代码示例

```csharp
public class ChatRoom
{
    public void Send(string from, string message)
    {
        Console.WriteLine($"{from}: {message}");
    }
}

public class User
{
    private readonly ChatRoom room;
    private readonly string name;
    public User(ChatRoom room, string name) => (this.room, this.name) = (room, name);
    public void Send(string message) => room.Send(name, message);
}
```

用户之间不直接引用，所有消息通过聊天室转发。

## 适用场景

- 多个对象之间存在复杂的多对多依赖。
- 对象之间的通信逻辑需要集中控制和复用。
- 需要把网状依赖重构为星形结构。

## 常见坑

- 中介者容易演变成上帝对象，承担过多逻辑。
- 集中通信可能成为性能瓶颈或单点故障。
- 只有确实存在多对多关系时才使用，简单交互不必引入。

> 记忆：**多对多变星形，同事只找中介者，不直接找彼此。**
