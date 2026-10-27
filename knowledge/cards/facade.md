---
title: 外观模式与子系统简化接口
date: 2026-09-23
category: 设计模式
tags: [结构型, 外观, 简化接口]
icon: fas fa-code
difficulty: 1
---

## 定义

外观模式为子系统中的一组接口提供一个统一的高层接口，使子系统更容易使用。

## 核心角色

| 角色 | 职责 |
|---|---|
| Facade | 对外提供简化的统一接口 |
| SubsystemA/B/C | 完成具体功能的子系统类 |
| Client | 通过 Facade 调用子系统 |

## 代码示例

```csharp
public class HomeTheaterFacade
{
    private readonly Amplifier amp = new();
    private readonly Projector projector = new();
    private readonly Lights lights = new();

    public void WatchMovie()
    {
        lights.Dim();
        amp.On();
        projector.On();
    }
}
```

客户端只需要调用 `WatchMovie()`，不必了解子系统启动顺序。

## 适用场景

- 为一组复杂子系统提供简单入口。
- 需要分层，降低客户端与子系统的耦合。
- 旧系统重构时，用外观包装遗留逻辑。

## 常见坑

- 外观不是禁止直接访问子系统，只是提供一条更简单的路径。
- 不要在 Facade 中堆积业务逻辑，它主要负责协调和委托。
- 子系统变化时 Facade 可能需要同步调整，但仍比每个客户端各自适配好。

> 记忆：**复杂子系统前加统一门面，客户端只调一个入口。**
