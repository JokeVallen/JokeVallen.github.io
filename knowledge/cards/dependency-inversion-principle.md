---
title: 依赖倒置原则 DIP
date: 2026-09-23
category: 设计原则
tags: [SOLID, DIP, 依赖注入]
icon: fas fa-code
difficulty: 2
---

## 定义

依赖倒置原则要求高层模块不依赖低层模块，二者都依赖抽象；抽象不依赖细节，细节依赖抽象。

## 实现方式

- 高层策略定义接口，底层实现该接口。
- 通过构造函数、属性或方法注入依赖，而不是在类内部直接 new。
- 依赖注入容器只是装配工具，不是 DIP 本身。

## 反例

```csharp
public class OrderService
{
    private readonly SqlOrderRepository repo = new SqlOrderRepository();
}
```

高层业务直接依赖具体数据库实现，替换存储方式必须修改业务类。

## 正例

```csharp
public interface IOrderRepository
{
    void Save(Order order);
}

public class OrderService
{
    private readonly IOrderRepository repo;
    public OrderService(IOrderRepository repo) => this.repo = repo;
}
```

业务类只依赖 `IOrderRepository` 抽象，具体实现可在组合根注入。

## 常见坑

- 仅仅把 `new` 挪到工厂里，不一定满足 DIP；关键看依赖方向是否指向抽象。
- 抽象应属于高层模块，不能反过来依赖底层细节。
- 测试时可注入 Fake 或 Mock，这正是 DIP 带来的收益。

> 记忆：**高层低层都靠抽象，细节实现去依赖抽象。**
