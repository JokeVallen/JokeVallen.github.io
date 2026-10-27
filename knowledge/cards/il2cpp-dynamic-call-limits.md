---
title: IL2CPP 下动态调用的限制
date: 2026-09-23
category: Unity
tags: [IL2CPP, 反射, AOT]
icon: fas fa-shield-alt
difficulty: 3
---

## 结论

IL2CPP 是 AOT 编译，反射和表达式树 `Compile()` 都可能受限，iOS 平台尤其明显。

## 主要限制

| 技术 | IL2CPP 下的问题 |
|---|---|
| 反射 | 部分 API 被裁剪，泛型方法可能找不到 |
| `Reflection.Emit` | 运行时 IL 生成受限 |
| 表达式树 `Compile()` | 可能依赖运行时 IL 生成，存在失败风险 |
| 动态泛型 | AOT 无法为未预编译的泛型实例生成代码 |

## 常见现象

- `ExecutionEngineException`
- `NotSupportedException`
- 方法被代码裁剪（Code Stripping）移除
- iOS 上 `Compile()` 行为与编辑器不一致

## 应对方式

- 优先使用**源生成器**，在编译期生成代码。
- 保留 `link.xml`，防止反射用到的类型被裁剪。
- 避免运行时动态构造未预编译的泛型类型。
- 在目标平台真机测试，不要只看编辑器。

> 记忆：**IL2CPP 是 AOT，反射会裁剪，Compile 可能失败；源生成器最稳。**