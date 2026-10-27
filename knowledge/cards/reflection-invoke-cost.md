---
title: 反射 Invoke 的性能开销来源
date: 2026-09-23
category: C#
tags: [反射, 性能, Invoke]
icon: fas fa-tachometer-alt
difficulty: 3
---

## 结论

`MethodInfo.Invoke` 每次调用都要做一系列运行时检查，开销远高于普通方法调用。

## 主要开销

- **参数类型检查**：核对传入参数与签名是否匹配
- **装箱拆箱**：值类型参数被包装成 `object[]`
- **安全权限验证**：检查调用者是否有权限
- **栈帧与异常包装**：反射调用会包一层调用栈
- **目标方法查找**：部分场景需要重新解析虚方法或接口方法

## 示例

```csharp
MethodInfo method = typeof(Mathf).GetMethod("Abs", new[] { typeof(float) });

for (int i = 0; i < 100000; i++)
{
    float result = (float)method.Invoke(null, new object[] { -1f });
}
```

这段代码每帧执行会持续产生 GC 和检查开销。

## 注意

- 反射适合一次性初始化、编辑器工具。
- 高频路径不要用 `Invoke`。
- 可以用表达式树或源生成器替代。

> 记忆：**反射 Invoke 每次都查类型、装箱、验权限，循环里用会卡。**