---
title: 单一职责原则 SRP
date: 2026-09-23
category: 设计原则
tags: [SOLID, SRP, 单一职责]
icon: fas fa-code
difficulty: 1
---

## 定义

单一职责原则要求一个类只有一个引起它变化的原因，即一个类只承担一个职责。

## 判断方法

- 需求变化时，这个类是否只会因为同一类原因被修改。
- 类的描述中是否频繁出现“负责……和……”。
- 不同调用方是否因为不同原因使用该类。

## 反例

```csharp
public class OrderService
{
    public void Save(Order order) { /* 数据库操作 */ }
    public void SendEmail(Order order) { /* 邮件通知 */ }
    public void PrintInvoice(Order order) { /* 打印发票 */ }
}
```

这个类同时受持久化、通知和打印三类需求影响，任何一类变化都会修改它。

## 正例

```csharp
public class OrderRepository { public void Save(Order order) { } }
public class EmailSender { public void Send(Order order) { } }
public class InvoicePrinter { public void Print(Order order) { } }
```

拆分后，每个类只围绕一个变化原因演化。

## 常见坑

- 职责不等于“方法数量少”，一个类有很多方法也可能只有一个职责。
- 不能机械地拆到每个方法一个类，否则会制造大量无意义的小对象。
- 应结合业务变化方向判断职责边界。

> 记忆：**一个类，一个变化原因；只做一件事。**
