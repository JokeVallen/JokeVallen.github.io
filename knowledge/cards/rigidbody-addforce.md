---
title: Rigidbody 施加力方法
date: 2026-09-23
category: Unity
tags: [Unity, Rigidbody, AddForce]
icon: fas fa-cube
difficulty: 2
---

## 定义

`AddForce` 给刚体施加一个力，由物理引擎按质量、阻力和时间步长计算速度变化。它应在 `FixedUpdate` 中调用。

## ForceMode 对比

| 模式 | 单位 | 是否受质量影响 |
|---|---|---|
| `Force` | 力，持续作用 | 是 |
| `Acceleration` | 加速度 | 否 |
| `Impulse` | 冲量，瞬间作用 | 是 |
| `VelocityChange` | 速度变化 | 否 |

## 代码示例

```csharp
void FixedUpdate()
{
    // 持续推力
    rb.AddForce(Vector3.forward * 10f, ForceMode.Force);

    // 跳跃瞬间冲量
    if (Input.GetKeyDown(KeyCode.Space))
        rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);
}
```

## 适用场景

- 角色跳跃、子弹发射、爆炸推力、载具驱动。
- 希望物理引擎处理碰撞和运动响应的场景。

## 常见坑

- 在 `Update` 中调用会因为帧率不同导致受力不一致。
- `Force` 是持续力，每帧调用会不断累积；`Impulse` 只适合一次性施加。
- 刚体为 `isKinematic` 时 `AddForce` 无效。

## 补充要点

- `AddForceAtPosition` 可以在指定位置施加力并产生扭矩。
- `AddTorque` 用于施加旋转力矩。
- 力模式应按物理意图选择，混用会导致速度变化难以调试。

- 质量越大，同样的 Force 产生的加速度越小，但 Impulse 也会受质量影响。

> 记忆：**持续力用 Force，瞬间冲量用 Impulse；物理调用放 FixedUpdate。**
