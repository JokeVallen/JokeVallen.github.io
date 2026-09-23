---
title: Rigidbody 刚体组件基础
date: 2026-09-23
category: Unity
tags: [Unity, Rigidbody, 物理系统]
icon: fas fa-cube
difficulty: 2
---

## 定义

`Rigidbody` 是 Unity 物理系统的入口组件，让 GameObject 受重力、力、扭矩和碰撞影响，由物理引擎驱动其 Transform。

## 核心属性

| 属性 | 作用 |
|---|---|
| `mass` | 质量，影响力产生的加速度 |
| `drag` | 线性阻力，减缓平移运动 |
| `angularDrag` | 角阻力，减缓旋转 |
| `useGravity` | 是否受重力 |
| `isKinematic` | 为 true 时不受物理力，需手动移动 |
| `interpolation` | 在 FixedUpdate 之间插值渲染 |
| `collisionDetectionMode` | 碰撞检测模式 |

## 使用原则

- 物理运动应放在 `FixedUpdate` 中处理。
- 非运动学刚体不要直接修改 `transform.position`，应使用 `MovePosition` 或力。
- 刚体通常与 Collider 配合，Collider 定义碰撞形状。

```csharp
void FixedUpdate()
{
    rb.AddForce(Vector3.forward * 10f, ForceMode.Force);
}
```

## 常见坑

- `isKinematic` 为 true 时，重力、力和碰撞推力都不会生效。
- 只添加 Collider 不添加 Rigidbody，无法获得物理引擎驱动的运动。
- 同时修改 Transform 和物理系统容易造成穿模或抖动。

## 补充要点

- 碰撞检测模式可从 Discrete 改为 Continuous 以减少高速穿模。
- 插值属性可让渲染更平滑，但不会改变物理位置。
- 多个 Rigidbody 的力应尽量在 FixedUpdate 统一处理。

> 记忆：**Rigidbody 交给物理引擎，运动放 FixedUpdate，别硬改 Transform。**
