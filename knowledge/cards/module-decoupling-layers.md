---
title: 模块分层的依赖方向
date: 2026-09-25
category: 架构
tags: [分层架构, 解耦, asmdef]
icon: fas fa-layer-group
difficulty: 3
---

## 结论

稳定的依赖方向应该是：表现层 → 应用层 → 领域层，基础设施通过接口被依赖，而不是让领域层反过来依赖 UI 或资源加载。

## 推荐分层

- Presentation：UI、输入、动画
- Application：用例、流程编排
- Domain：业务规则、实体、值对象
- Infrastructure：网络、存档、资源、平台 SDK

## 实践

- 领域层尽量使用普通 C#，不依赖 UnityEngine
- 基础设施实现领域层定义的接口
- 用 asmdef 明确模块边界，防止循环引用
- 跨模块通信用事件或接口，不直接引用实现
- 每个模块暴露最小 API

## 常见坑

- 一个 Assembly 包含所有代码，编译慢且边界模糊
- UI 直接调用网络与存档
- 工具类变成什么都往里放的垃圾桶
- 循环依赖靠反射或单例绕过

> 记忆：**依赖指向稳定抽象，UI 不反向污染业务。**
