---
title: 命令模式与请求对象化
date: 2026-09-23
category: 设计模式
tags: [行为型, 命令, 撤销]
icon: fas fa-code
difficulty: 2
---

## 定义

命令模式把请求封装成对象，使调用者与接收者解耦，并支持排队、记录日志和撤销操作。

## 核心角色

| 角色 | 职责 |
|---|---|
| Command | 声明执行操作的接口 |
| ConcreteCommand | 绑定接收者并实现执行逻辑 |
| Invoker | 持有命令并触发执行 |
| Receiver | 真正执行操作的对象 |
| Client | 创建命令并绑定接收者 |

## 代码示例

```csharp
public interface ICommand { void Execute(); }

public class LightOnCommand : ICommand
{
    private readonly Light light;
    public LightOnCommand(Light light) => this.light = light;
    public void Execute() => light.On();
}

public class RemoteControl
{
    private ICommand command;
    public void SetCommand(ICommand command) => this.command = command;
    public void Press() => command.Execute();
}
```

## 适用场景

- 需要参数化对象执行的动作。
- 需要支持撤销、重做、队列或宏命令。
- 需要记录操作日志，用于回放或审计。

## 常见坑

- 每个操作都建一个命令类会增加类数量。
- 撤销需要命令保存足够的状态，否则无法恢复。
- 命令模式解耦的是调用者与接收者，不等于异步或事务。

- 命令对象可以持久化到队列，实现延迟执行和失败重试。

- 宏命令可以把多个命令组合成一个复合命令，统一执行或撤销。

> 记忆：**请求封装成对象，调用与执行解耦；可排队、可撤销。**
