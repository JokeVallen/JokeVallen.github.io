---
title: 物理与动画的常见性能开关
date: 2026-09-26
category: 性能优化
tags: [物理, 动画, 性能]
icon: fas fa-running
difficulty: 2
---

## 结论

物理和动画是 Unity 中容易被忽视的 CPU 热点，尤其是在大量对象或复杂骨骼场景。

## 物理

- 减少 Rigidbody 与 Collider 数量
- 用 Layer 碰撞矩阵排除不必要碰撞
- 用 `NonAlloc` 查询接口
- 降低 FixedUpdate 频率或物理迭代次数
- 远处对象关闭物理或使用简化碰撞

## 动画

- 不可见角色使用 `Cull Completely`
- 减少同时更新的 Animator 数量
- 合并状态机、减少 Layer 与参数
- 远处使用烘焙或简化动画
- 检查 SkinnedMeshRenderer 与骨骼数量

## 粒子

- 控制粒子数量与 Overdraw
- 关闭不必要的光照与碰撞
- 远距离使用低配 Effect

> 记忆：**物理看碰撞数量与频率，动画看更新数量与复杂度。**
