---
title: Lua、ILRuntime 与 HybridCLR 热更对比
date: 2026-09-24
category: 资源管理
tags: [热更新, HybridCLR, ILRuntime]
icon: fas fa-fire
difficulty: 3
---

## 结论

| 方案 | 原理 | 优点 | 代价 |
|---|---|---|---|
| Lua | 脚本解释执行 | 成熟、生态广 | 双语言、GC、互操作成本 |
| ILRuntime | 解释 IL | C# 热更、接入较快 | 性能与 AOT 限制 |
| HybridCLR | AOT + 解释器混合 | 性能好、支持泛型 | 构建链复杂、包体增加 |

## 选择思路

- 团队已有 Lua 积累：继续 Lua
- 纯 C# 团队、追求开发效率：HybridCLR
- 老项目、改造成本敏感：ILRuntime 或局部热更

## 必须处理

- 程序集拆分与版本管理
- `link.xml` 防止代码裁剪误删
- AOT 泛型与反射调用
- 下载、校验、加载失败回滚
- 热更代码与资源版本一致

> 记忆：**热更不是选脚本语言，而是选一套可回滚的版本与程序集方案。**
