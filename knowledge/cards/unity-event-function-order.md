---
title: Unity 事件函数执行顺序
date: 2026-09-23
category: Unity
tags: [Unity, 生命周期, 执行顺序]
icon: fas fa-clock
difficulty: 2
---

## 定义

Unity 在 GameObject 生命周期中按固定顺序调用事件函数，理解顺序有助于正确初始化、更新和销毁逻辑。

## 常见顺序

| 阶段 | 事件函数 |
|---|---|
| 初始化 | `Awake` → `OnEnable` → `Start` |
| 物理 | `FixedUpdate` → `OnTrigger/OnCollision` |
| 逻辑 | `Update` → 协程 `yield null` |
| 后更新 | `LateUpdate` |
| 渲染 | 相机渲染 |
| UI/输入 | `OnGUI` |
| 销毁 | `OnDisable` → `OnDestroy` |

## 要点

- `Awake` 在对象实例化后立即调用，`Start` 在第一次 Update 前调用。
- `FixedUpdate` 按固定时间步长执行，适合物理。
- 协程在 `Update` 之后、`LateUpdate` 之前恢复。
- `OnEnable`/`OnDisable` 可能被多次调用。

## 常见坑

- 依赖其他对象的 `Start` 初始化时，执行顺序不确定，应在 `Awake` 中获取引用。
- 暂停或场景切换会影响部分事件，需做好状态重置。
- `OnDestroy` 中不要依赖其他对象仍然存在。

## 补充要点

- `FixedUpdate` 执行次数由固定时间步长决定，与渲染帧率无关。
- `LateUpdate` 常用于相机跟随，确保在角色移动之后更新。
- `OnApplicationPause`、`OnApplicationFocus` 可用于移动端前后台切换。

> 记忆：**Awake、OnEnable、Start；FixedUpdate、Update、LateUpdate；最后 OnDisable、OnDestroy。**
