---
title: finally + return 陷阱
date: 2026-09-22
category: C#
tags: [异常, finally, C#]
icon: fas fa-shield-alt
difficulty: 2
---

## 执行顺序

```
try 执行
  ├─ 无异常 → catch 跳过 → finally 执行
  └─ 有异常 → 匹配 catch 执行 → finally 执行
              （无匹配 catch → finally 后异常继续向上抛）
```

- `catch` 只在 try 中异常且类型匹配时才执行
- `finally` 无论是否异常都会执行（除非进程终止）

## 坑：在 finally 里写 return

```csharp
int Test()
{
    try { return 1; }
    finally { return 2; }   // 实际返回 2
}
```

两个问题：

1. **覆盖返回值**：try / catch 中的 return 被 finally 的 return 覆盖
2. **吞掉异常**：try 中抛异常时，finally 里的 return 会让异常不再向上传播

## 正确做法

- **禁止在 finally 中写 return**
- finally 只用于释放资源
- 用 `using` 或 `try/finally` 释放资源
- 返回值与异常交给 try / catch 处理

> 记忆：**finally 只清理，不决策。**