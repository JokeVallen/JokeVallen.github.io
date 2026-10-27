---
title: 接口隔离原则 ISP
date: 2026-09-23
category: 设计原则
tags: [SOLID, ISP, 接口]
icon: fas fa-code
difficulty: 2
---

## 定义

接口隔离原则要求客户端不应被强迫依赖它不使用的方法。接口应拆分成多个专门的小接口，而不是一个臃肿的大接口。

## 实现方式

- 按客户端角色拆分接口，而不是按实现类的全部能力拆分。
- 每个接口只服务一组内聚的方法。
- 实现类可以同时实现多个小接口。

## 反例

```csharp
public interface IMultiFunctionDevice
{
    void Print();
    void Scan();
    void Fax();
}
```

简单打印机也必须实现用不到的 `Scan` 和 `Fax`。

## 正例

```csharp
public interface IPrinter { void Print(); }
public interface IScanner { void Scan(); }
public interface IFax { void Fax(); }

public class SimplePrinter : IPrinter
{
    public void Print() { }
}
```

客户端只依赖自己需要的接口。

## 常见坑

- 接口不是越小越好，拆得过细会制造大量接口和组合负担。
- 拆分维度应是“客户端如何使用”，不是按方法逐条拆。
- 与单一职责原则关注点不同：SRP 关注变化原因，ISP 关注客户端依赖。

> 记忆：**接口按客户角色拆，不塞用不到的方法。**
