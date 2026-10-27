---
title: 解释器模式与简单文法求值
date: 2026-09-23
category: 设计模式
tags: [行为型, 解释器, 表达式求值]
icon: fas fa-code
difficulty: 3
---

## 定义

解释器模式给定一种语言，定义它的文法表示，并定义一个解释器来解释语言中的句子。它适合规则简单、扩展频繁的表达式求值场景。

## 核心角色

| 角色 | 职责 |
|---|---|
| AbstractExpression | 声明解释操作 |
| TerminalExpression | 处理文法中的终结符 |
| NonterminalExpression | 组合子表达式并递归解释 |
| Context | 保存解释器需要的全局信息 |
| Client | 构建抽象语法树并触发解释 |

## 代码示例

```csharp
public interface IExpression
{
    int Interpret();
}

public class NumberExpression : IExpression
{
    private readonly int value;
    public NumberExpression(int value) => this.value = value;
    public int Interpret() => value;
}

public class AddExpression : IExpression
{
    private readonly IExpression left;
    private readonly IExpression right;
    public AddExpression(IExpression left, IExpression right)
        => (this.left, this.right) = (left, right);

    public int Interpret() => left.Interpret() + right.Interpret();
}
```

客户端用 `new AddExpression(new NumberExpression(1), new NumberExpression(2))` 构建表达式树。

## 适用场景

- 需要解释一种简单语言或规则表达式。
- 文法规则数量少，且经常需要扩展新规则。
- 表达式可以自然表示为抽象语法树。

## 常见坑

- 每条文法规则通常对应一个类，复杂文法会导致类数量爆炸。
- 递归解释可能带来性能开销，深层表达式可能栈溢出。
- 复杂语言应使用解析器生成工具，而不是手写解释器模式。

> 记忆：**文法变对象，表达式成树；递归解释，得到最终结果。**
