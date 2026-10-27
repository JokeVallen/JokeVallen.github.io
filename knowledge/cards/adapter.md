---
title: 适配器模式与接口转换
date: 2026-09-23
category: 设计模式
tags: [结构型, 适配器, 接口转换]
icon: fas fa-code
difficulty: 2
---

## 定义

适配器模式把一个类的接口转换成客户端期望的另一个接口，使原本接口不兼容的类可以一起工作。

## 核心角色

| 角色 | 职责 |
|---|---|
| Target | 客户端期望的接口 |
| Adaptee | 已存在但接口不兼容的类 |
| Adapter | 实现 Target，内部包装 Adaptee |
| Client | 只依赖 Target |

## 代码示例

```csharp
public interface IPayment
{
    void Pay(decimal amount);
}

public class LegacyPay
{
    public void MakePayment(double money) { }
}

public class PaymentAdapter : IPayment
{
    private readonly LegacyPay legacy = new LegacyPay();

    public void Pay(decimal amount)
    {
        legacy.MakePayment((double)amount);
    }
}
```

## 适用场景

- 需要复用现有类，但其接口与目标接口不一致。
- 对接第三方库、旧系统或不同数据格式。
- 希望在不修改原类的前提下接入新系统。

## 常见坑

- 适配器只做接口转换，不应堆入大量业务逻辑。
- 类适配器依赖多重继承，C# 中通常使用对象适配器。
- 如果接口本身可以重新设计，优先统一接口，而不是增加适配层。

- 适配器通常是一次性兼容层；当接口稳定后，应评估是否直接统一接口。

> 记忆：**接口不一致，包一层转换器；客户端只认目标接口。**
