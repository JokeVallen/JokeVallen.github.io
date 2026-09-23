---
title: 访问者模式与稳定结构扩展
date: 2026-09-23
category: 设计模式
tags: [行为型, 访问者, 双分派]
icon: fas fa-code
difficulty: 3
---

## 定义

访问者模式表示一个作用于某对象结构中各元素的操作，使你不必改变各元素的类就能定义新操作。

## 核心角色

| 角色 | 职责 |
|---|---|
| Visitor | 为每种具体元素声明访问方法 |
| ConcreteVisitor | 实现具体操作 |
| Element | 声明接受访问者的方法 |
| ConcreteElement | 调用访问者的对应方法 |
| ObjectStructure | 维护元素集合并允许访问者遍历 |

## 代码示例

```csharp
public interface IVisitor
{
    void Visit(FileElement file);
    void Visit(FolderElement folder);
}

public interface IElement
{
    void Accept(IVisitor visitor);
}

public class FileElement : IElement
{
    public string Name { get; set; }
    public void Accept(IVisitor visitor) => visitor.Visit(this);
}

public class SizeVisitor : IVisitor
{
    public void Visit(FileElement file) { }
    public void Visit(FolderElement folder) { }
}
```

`Accept` 调用 `visitor.Visit(this)` 形成双分派：元素类型和访问者类型共同决定执行哪个方法。

## 适用场景

- 对象结构稳定，但需要频繁增加新操作。
- 需要对不同类型的元素执行不同逻辑，例如导出、统计、代码生成。
- 不希望把大量无关操作塞进元素类中。

## 常见坑

- 增加新的元素类型时，所有访问者接口和实现都要修改，所以元素类型应相对稳定。
- 访问者容易积累过多状态，复杂逻辑应拆分。
- 与迭代器不同：迭代器关注遍历，访问者关注对元素执行操作。

> 记忆：**元素 accept，访问者 visit；结构不变，操作常新。**
