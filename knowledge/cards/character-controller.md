---
title: 角色控制器组件与移动
date: 2026-09-23
category: Unity
tags: [Unity, CharacterController, 角色移动]
icon: fas fa-code
difficulty: 2
---

## 定义

`CharacterController` 是 Unity 提供的角色移动组件，内置胶囊碰撞体、坡度限制和台阶检测，适合不需要完整物理模拟的角色。

## 核心方法

| 方法 | 作用 |
|---|---|
| `Move` | 按位移移动，可处理碰撞 |
| `SimpleMove` | 简化移动，自动应用重力 |
| `isGrounded` | 是否接触地面 |
| `slopeLimit` | 可攀爬的最大坡度 |
| `stepOffset` | 可跨越的台阶高度 |

## 代码示例

```csharp
public class PlayerMove : MonoBehaviour
{
    public float speed = 5f;
    private CharacterController controller;

    private void Awake() => controller = GetComponent<CharacterController>();

    private void Update()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        Vector3 move = transform.right * h + transform.forward * v;
        controller.Move(move * speed * Time.deltaTime);
    }
}
```

## 常见坑

- `CharacterController` 不是 Rigidbody，不会被 `AddForce` 推动。
- `Move` 传入的是本帧位移，不是速度，要乘 `Time.deltaTime`。
- 复杂物理交互场景更适合 Rigidbody 方案。

## 补充要点

- 它内部维护胶囊碰撞体，但不能像 Rigidbody 那样被其他刚体自然推动。
- `Move` 返回碰撞标志，可用于判断是否撞墙或接地。
- 与 NavMeshAgent 结合时，可把路径点转换为每帧移动方向。
- 需要重力时可在 Y 方向手动累加速度。

- `CharacterController` 不参与物理引擎的力计算，运动完全由脚本控制。

> 记忆：**角色移动用 Move，自带碰撞和台阶；不参与刚体力学。**
