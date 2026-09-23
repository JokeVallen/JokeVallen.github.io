---
title: 原型模式与对象克隆复制
date: 2026-09-23
category: 设计模式
tags: [创建型, 原型, 克隆]
icon: fas fa-code
difficulty: 2
---

## 定义

原型模式通过复制已有实例来创建新对象，而不是每次从零构造，适合创建成本较高或配置复杂的对象。

## 核心角色与分类

| 分类 | 说明 |
|---|---|
| 浅拷贝 | 复制值类型字段，引用类型字段仍指向同一对象 |
| 深拷贝 | 递归复制引用对象，副本与原对象完全独立 |
| Prototype | 声明克隆方法的接口 |
| ConcretePrototype | 实现克隆自身 |

## 代码示例

```csharp
public class Monster : ICloneable
{
    public string Name { get; set; }
    public List<string> Skills { get; set; } = new();

    public object Clone()
    {
        return new Monster
        {
            Name = Name,
            Skills = new List<string>(Skills) // 深拷贝集合
        };
    }
}
```

## 适用场景

- 对象创建过程复杂、耗时或依赖外部资源。
- 需要保留对象状态快照并批量派生相似对象。
- 需要动态加载配置后复制生成对象。

## 常见坑

- `MemberwiseClone` 是浅拷贝，含引用字段时会共享可变状态。
- 克隆方法要明确文档化浅/深语义，避免调用方误用。
- 循环引用对象做深拷贝时需要处理引用环，否则可能栈溢出。

> 记忆：**复制已有对象，不重新初始化；注意浅拷共享、深拷独立。**
