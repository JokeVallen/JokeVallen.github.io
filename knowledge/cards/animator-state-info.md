---
title: AnimatorStateInfo 动画状态信息查询
date: 2026-09-24
category: Unity
tags: [Animator, 状态机, 动画查询]
icon: fas fa-layer-group
difficulty: 2
---

## 定义

`AnimatorStateInfo` 是 Unity Mecanim 动画系统中用于**查询当前状态或下一个状态信息**的结构体，通过 `Animator.GetCurrentAnimatorStateInfo(layerIndex)` 或 `GetNextAnimatorStateInfo(layerIndex)` 获取。

```csharp
AnimatorStateInfo stateInfo =
    animator.GetCurrentAnimatorStateInfo(0);
```

## 核心属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `normalizedTime` | `float` | 归一化时间，整数部分为循环次数，小数部分为当前循环进度 |
| `length` | `float` | 当前状态的动画时长（秒） |
| `speed` | `float` | 动画播放速度，1 为正常速度 |
| `speedMultiplier` | `float` | 速度乘数，负值表示倒播 |
| `loop` | `bool` | 状态是否循环 |
| `shortNameHash` | `int` | 状态短名称哈希，不含父层名称 |
| `fullPathHash` | `int` | 状态完整路径哈希 |
| `tagHash` | `int` | 状态的 Tag 哈希 |

## 常用方法

| 方法 | 说明 |
|---|---|
| `IsName(string name)` | 判断当前激活状态是否匹配指定名称 |
| `IsTag(string tag)` | 判断当前激活状态是否匹配指定 Tag |

`IsName` 的名称采用 `Layer.Name` 形式，也可直接用状态名。当多个状态逻辑相同但名称不同时，使用 `IsTag` 更合适。

## 典型用法

### 检测动画播放完毕

```csharp
void Update()
{
    var info = animator.GetCurrentAnimatorStateInfo(0);

    if (info.IsName("Attack") && info.normalizedTime >= 1.0f)
    {
        Debug.Log("攻击动画播放完毕");
    }
}
```

`normalizedTime >= 1.0f` 表示当前循环已播放完成。对于循环动画，判断结束需对 `normalizedTime` 取小数部分再比较。

### 控制播放进度

```csharp
// 将动画定位到 50% 进度处
animator.Play("Walk", 0, 0.5f);
```

## 性能优化

- **使用哈希代替字符串**：每次 `IsName(string)` 调用都会将字符串转为哈希，高频调用应改为 `shortNameHash == Animator.StringToHash("StateName")`
- **缓存哈希值**：在 `Awake` 或 `Start` 中预先计算并缓存 `Animator.StringToHash` 的结果
- **避免每帧多次调用**：`GetCurrentAnimatorStateInfo` 返回的是结构体，一次获取后复用即可

```csharp
private static readonly int AttackHash =
    Animator.StringToHash("Attack");

void Update()
{
    var info = animator.GetCurrentAnimatorStateInfo(0);

    if (info.shortNameHash == AttackHash &&
        info.normalizedTime >= 1.0f)
    {
        // 处理逻辑
    }
}
```

## 常见坑

- `normalizedTime` 对循环动画会持续累加（如 `2.5` 表示已循环两次并处于第三次的 50%），直接判断 `>= 1.0f` 对循环动画无效，应取小数部分
- `IsName` 传入的名称必须与 Animator 面板中的状态名完全一致，含层级路径时需写全
- 过渡期间 `GetCurrentAnimatorStateInfo` 返回的是源状态，`GetNextAnimatorStateInfo` 返回目标状态

> 记忆：**AnimatorStateInfo 查询当前动画状态，normalizedTime 判进度，shortNameHash 判状态，循环动画取小数部分。**