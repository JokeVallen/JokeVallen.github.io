---
title: 备忘录模式与状态恢复
date: 2026-09-23
category: 设计模式
tags: [行为型, 备忘录, 撤销]
icon: fas fa-code
difficulty: 3
---

## 定义

备忘录模式在不破坏封装的前提下，捕获对象的内部状态，并在需要时恢复到该状态。

## 核心角色

| 角色 | 职责 |
|---|---|
| Originator | 创建备忘录并可用其恢复自身状态 |
| Memento | 保存 Originator 的内部状态 |
| Caretaker | 保管备忘录，但不修改其内容 |

## 代码示例

```csharp
public class Editor
{
    public string Text { get; set; }

    public EditorMemento Save() => new EditorMemento(Text);

    public void Restore(EditorMemento memento)
    {
        Text = memento.Text;
    }
}

public class EditorMemento
{
    public string Text { get; }
    public EditorMemento(string text) => Text = text;
}

public class History
{
    private readonly Stack<EditorMemento> stack = new();
    public void Push(EditorMemento memento) => stack.Push(memento);
    public EditorMemento Pop() => stack.Pop();
}
```

## 适用场景

- 需要撤销、回滚或恢复对象到历史状态。
- 直接暴露对象内部状态会破坏封装时。
- 需要保存检查点，例如编辑器、游戏存档。

## 常见坑

- 备忘录数量过多会占用大量内存，可结合限制历史长度或快照压缩。
- Caretaker 不应修改备忘录内容，否则恢复语义会被破坏。
- 深拷贝与浅拷贝的选择取决于状态中是否包含引用对象。

- 如果状态很大，可以用增量快照或序列化方案降低内存占用。

> 记忆：**原发器造快照，管理者管快照；恢复状态不破坏封装。**
