---
title: StateMachineBehaviour 状态机行为脚本
date: 2026-09-24
category: Unity
tags: [Animator, 状态机, 行为]
icon: fas fa-code
difficulty: 2
---

## 定义

`StateMachineBehaviour` 是 Unity Mecanim 动画系统中用于在**状态生命周期内执行逻辑**的脚本基类，继承自 `ScriptableObject`。它可以直接挂载到 Animator 的状态、子状态机或整个层上，无需依附于 GameObject。

```csharp
public class MyBehaviour : StateMachineBehaviour
{
    override public void OnStateEnter(
        Animator animator,
        AnimatorStateInfo stateInfo,
        int layerIndex)
    {
        // 进入状态时执行
    }
}
```

## 生命周期方法

| 方法 | 触发时机 | 参数 |
|---|---|---|
| `OnStateEnter` | 进入状态时调用一次 | `Animator`, `AnimatorStateInfo`, `int layerIndex` |
| `OnStateUpdate` | 状态激活期间每帧调用 | 同上 |
| `OnStateMove` | 在 `OnStateUpdate` 之后、根运动处理后调用 | 同上 |
| `OnStateIK` | 在 IK 处理阶段调用 | 同上 |
| `OnStateExit` | 退出状态时调用一次 | 同上 |
| `OnStateMachineEnter` | 进入子状态机时调用一次 | `Animator`, `int stateMachinePathHash`, `int layerIndex` |
| `OnStateMachineExit` | 退出子状态机时调用一次 | 同上 |

`OnStateUpdate` 不包含根运动更新；`OnStateMove` 在根运动处理后调用，适合处理位移相关逻辑。

## 使用方式

1. 创建脚本继承 `StateMachineBehaviour`。
2. 重写需要的方法。
3. 在 Animator 窗口中选中状态，点击 **Add Behaviour** 添加脚本。

```csharp
using UnityEngine;

public class AttackStateBehaviour : StateMachineBehaviour
{
    public AudioClip attackSound;

    override public void OnStateEnter(
        Animator animator,
        AnimatorStateInfo stateInfo,
        int layerIndex)
    {
        AudioSource.PlayClipAtPoint(
            attackSound, animator.transform.position);
    }

    override public void OnStateUpdate(
        Animator animator,
        AnimatorStateInfo stateInfo,
        int layerIndex)
    {
        if (stateInfo.normalizedTime >= 1.0f)
        {
            // 动画播放完毕，可切换状态
        }
    }

    override public void OnStateExit(
        Animator animator,
        AnimatorStateInfo stateInfo,
        int layerIndex)
    {
        Debug.Log("退出攻击状态");
    }
}
```

## 与 MonoBehaviour 的区别

| 维度 | StateMachineBehaviour | MonoBehaviour |
|---|---|---|
| 挂载位置 | Animator 状态机上 | GameObject 上 |
| 生命周期 | 状态进入/退出/更新 | GameObject 生命周期 |
| 实例 | 每个状态独立实例 | 每个 GameObject 独立实例 |
| 用途 | 状态相关逻辑 | 通用逻辑 |

## 常见坑

- `OnStateUpdate` 每帧调用，避免昂贵操作。
- `OnStateEnter` 中 `normalizedTime` 通常为 0，不要假设动画已播放到某进度。
- 多个状态可复用同一个 `StateMachineBehaviour` 资源，但运行时每个状态拥有独立实例，可安全存储状态数据。
- 层级别逻辑使用 `OnStateMachineEnter/Exit`，而非状态级别方法。

> 记忆：**StateMachineBehaviour 是状态机的行为脚本，继承 ScriptableObject，通过 OnStateEnter/Exit/Update 在状态生命周期执行逻辑，无需挂载 GameObject。**