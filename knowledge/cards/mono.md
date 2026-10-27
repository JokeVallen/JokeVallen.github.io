---
title: Mono 脚本运行时原理
date: 2026-09-23
category: Unity
tags: [Unity, Mono, 运行时]
icon: fas fa-code
difficulty: 3
---

## 定义

Mono 是 Unity 传统的脚本运行时，负责加载 C# 编译出的 IL 程序集，并通过 JIT 或 AOT 将其转换为机器码执行。

## 主要组成

| 组件 | 作用 |
|---|---|
| C# 编译器 | 把源码编译为 IL |
| Mono 运行时 | 加载程序集、执行 IL |
| JIT | 运行时按需编译热点代码 |
| AOT | 构建时提前编译，用于不支持 JIT 的平台 |
| GC | 自动回收托管对象 |

## 特点

- 编辑器下默认使用 Mono JIT，迭代速度快。
- 支持反射和动态加载能力较强。
- iOS 等平台只能使用 Mono AOT 或 IL2CPP。
- 性能通常低于 IL2CPP，但构建更快。

## 常见坑

- Mono JIT 在部分主机平台和平台限制下不可用。
- AOT 下动态泛型和反射可能受限。
- Mono 的 GC 会产生停顿，实时性要求高时需优化分配。

## 补充要点

- Mono 程序集使用 CIL 指令和元数据描述类型与成员。
- JIT 会把方法编译为平台机器码并缓存，后续调用直接执行。
- AOT 平台需要在构建期生成代码，动态代码能力会受限。

> 记忆：**Mono 加载 IL，JIT 或 AOT 执行；编辑器快，移动端常让位 IL2CPP。**
