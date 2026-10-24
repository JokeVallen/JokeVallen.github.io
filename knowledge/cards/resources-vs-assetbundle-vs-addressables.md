---
title: Resources、AssetBundle 与 Addressables 对比
date: 2026-09-24
category: 资源管理
tags: [Addressables, AssetBundle, Resources]
icon: fas fa-box-open
difficulty: 2
---

## 结论

| 方案 | 加载 | 热更 | 依赖管理 | 适用 |
|---|---|---|---|---|
| Resources | 同步为主 | 不支持 | 较弱 | 少量启动配置 |
| AssetBundle | 手动 | 支持 | 需自己维护 | 自研资源系统 |
| Addressables | 异步为主 | 支持 | 内置 Catalog | 推荐默认方案 |

## Resources 的问题

- 全部打进安装包，增大包体
- `Resources.Load` 同步加载容易卡主线程
- 无法热更新
- 资源引用关系不透明，难以分析冗余

## AssetBundle 的问题

- 依赖、冗余、引用计数、卸载都要自己管理
- 包体规划和版本管理复杂
- 加载失败与循环依赖需要额外处理

## Addressables

Addressables 在 AssetBundle 之上提供 Catalog、异步加载、引用计数、远程更新和依赖解析，适合中大型项目作为默认资源层。

> 记忆：**小启动配置用 Resources，自研底层看 AB，业务层优先 Addressables。**
