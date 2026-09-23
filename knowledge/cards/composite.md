---
title: 组合模式与树形结构统一
date: 2026-09-23
category: 设计模式
tags: [结构型, 组合, 树形结构]
icon: fas fa-sitemap
difficulty: 2
---

## 定义

组合模式把对象组合成树形结构，使客户端可以统一处理单个对象和对象组合。

## 核心角色

| 角色 | 职责 |
|---|---|
| Component | 叶子和容器的共同接口 |
| Leaf | 叶子节点，无子节点 |
| Composite | 容器节点，持有子节点集合并转发请求 |
| Client | 面向 Component 编程 |

## 代码示例

```csharp
public abstract class FileSystemNode
{
    protected string Name;
    protected FileSystemNode(string name) => Name = name;
    public abstract void Print(string indent);
}

public class FileNode : FileSystemNode
{
    public FileNode(string name) : base(name) { }
    public override void Print(string indent) => Console.WriteLine(indent + Name);
}

public class FolderNode : FileSystemNode
{
    private readonly List<FileSystemNode> children = new();
    public FolderNode(string name) : base(name) { }
    public void Add(FileSystemNode node) => children.Add(node);

    public override void Print(string indent)
    {
        Console.WriteLine(indent + Name);
        foreach (var child in children) child.Print(indent + "  ");
    }
}
```

## 适用场景

- 需要表示“整体—部分”的树形层次结构。
- 希望客户端忽略单个对象与组合对象的差异。
- 目录树、UI 控件树、组织架构等场景。

## 常见坑

- 容器和叶子的接口统一后，叶子实现无意义的方法可能违反接口隔离。
- 遍历顺序、循环引用和深度过大需要额外控制。
- 组合模式关注结构统一，具体算法仍应遵循职责单一。

- 可以为组件增加父引用，方便从叶子向上遍历，但会增加内存和环风险。

> 记忆：**叶子与容器同一接口，递归遍历整棵树。**
