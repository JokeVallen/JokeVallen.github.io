---
title: 观察者模式与一对多通知
date: 2026-09-23
category: 设计模式
tags: [行为型, 观察者, 事件]
icon: fas fa-code
difficulty: 2
---

## 定义

观察者模式定义对象间的一对多依赖：当主题状态改变时，所有依赖它的观察者都会收到通知并自动更新。

## 核心角色

| 角色 | 职责 |
|---|---|
| Subject | 维护观察者列表，提供注册和通知接口 |
| Observer | 定义接收通知的更新接口 |
| ConcreteSubject | 状态变化时触发通知 |
| ConcreteObserver | 响应通知并更新自身 |

## 代码示例

```csharp
public interface IObserver { void Update(float temperature); }

public class WeatherStation
{
    private readonly List<IObserver> observers = new();
    public void Subscribe(IObserver observer) => observers.Add(observer);
    public void Unsubscribe(IObserver observer) => observers.Remove(observer);

    public void SetTemperature(float value)
    {
        foreach (var observer in observers)
            observer.Update(value);
    }
}
```

C# 中的 `event`、`Action` 和 `INotifyPropertyChanged` 都是观察者思想的应用。

## 适用场景

- 一个对象变化需要通知多个对象，且不知道具体接收者。
- 发布订阅、事件驱动、UI 数据绑定等场景。
- 需要松耦合地维护一对多依赖。

## 常见坑

- 忘记取消订阅会导致对象无法回收，形成内存泄漏。
- 通知顺序不应被观察者依赖。
- 观察者中抛异常可能中断后续通知，需要异常隔离策略。

> 记忆：**主题变，观察者全通知；注册要管，退订要记得。**
