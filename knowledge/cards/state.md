---
title: 状态模式与状态驱动行为
date: 2026-09-23
category: 设计模式
tags: [行为型, 状态, 状态机]
icon: fas fa-code
difficulty: 2
---

## 定义

状态模式允许对象在内部状态改变时改变它的行为，对象看起来像是修改了它的类。

## 核心角色

| 角色 | 职责 |
|---|---|
| Context | 持有当前状态，委托状态处理请求 |
| State | 定义状态相关行为的接口 |
| ConcreteState | 实现某一状态下的行为并触发状态转换 |

## 代码示例

```csharp
public interface ITrafficLightState
{
    void Change(TrafficLight light);
}

public class RedState : ITrafficLightState
{
    public void Change(TrafficLight light)
        => light.State = new GreenState();
}

public class TrafficLight
{
    public ITrafficLightState State { get; set; }
    public void Change() => State.Change(this);
}
```

每个状态类只关注自己状态下的行为与下一步转换。

## 适用场景

- 对象行为取决于状态，且存在大量状态分支。
- 状态转换规则复杂，需要把每个状态独立封装。
- 需要避免庞大的 `switch` 或 `if-else` 状态判断。

## 常见坑

- 状态类数量会随状态增多而增长。
- 状态转换可以放在 Context 或 State 中，需统一约定避免循环依赖。
- 与策略模式结构相似：状态模式强调状态驱动转换，策略模式强调算法替换。

> 记忆：**状态变成对象，行为随状态变；转换规则清晰隔离。**
