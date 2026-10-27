---
title: 服务定位器与依赖注入的取舍
date: 2026-09-25
category: 架构
tags: [依赖注入, 服务定位, 解耦]
icon: fas fa-plug
difficulty: 3
---

## 结论

| 方式 | 优点 | 风险 |
|---|---|---|
| Service Locator | 接入快、全局可取 | 依赖隐式、难测试、容易滥用 |
| 依赖注入 | 依赖显式、易测试 | 需要容器、接入成本更高 |

## Service Locator

适合原型、小项目或引擎入口层。业务代码里大量 `ServiceLocator.Get<T>()` 会让依赖关系不可见，也不利于单元测试。

## 依赖注入

普通 C# 类用构造函数注入；MonoBehaviour 可以用 Installer/Context 在 Awake 中注入，或通过工厂创建。

## Unity 实践

- 业务逻辑尽量放普通 C# 类，方便测试
- MonoBehaviour 只做 Unity 生命周期适配
- 不要把所有对象都塞进全局容器
- 明确服务生命周期：单例、场景级、临时

> 记忆：**服务定位器用来兜底，依赖注入用来表达依赖。**
