---
title: Input.GetAxis 平滑输入
date: 2026-09-23
category: Unity
tags: [Unity, Input, GetAxis]
icon: fas fa-code
difficulty: 1
---

## 定义

`Input.GetAxis` 返回经过平滑处理的轴输入值，范围通常是 `-1` 到 `1`，适合角色移动、转向等需要渐变的场景。

## 特点

- 键盘输入会按 Input Manager 中的 `Gravity` 和 `Sensitivity` 渐变。
- 游戏手柄摇杆会直接反映模拟量。
- 常用于 `Horizontal`、`Vertical` 等默认轴。
- 应在 `Update` 中读取。

```csharp
void Update()
{
    float h = Input.GetAxis("Horizontal");
    float v = Input.GetAxis("Vertical");
    Vector3 move = new Vector3(h, 0, v);
    transform.Translate(move * speed * Time.deltaTime);
}
```

## 常见坑

- 轴名称写错会抛出异常，使用前应确认 Input Manager 配置。
- 平滑会带来轻微延迟，不适合要求瞬时响应的操作。
- `GetAxis` 与帧率相关，移动时应乘 `Time.deltaTime`。

## 补充要点

- Input Manager 中可配置轴名称、正负按键和灵敏度。
- 摇杆死区可在 Project Settings 中设置，避免微小漂移。
- 若项目使用新输入系统 Input System，应改用 `InputAction` 读取输入。

- 轴输入的平滑速度和回零速度由 Gravity 与 Sensitivity 共同控制。

> 记忆：**GetAxis 带平滑，范围 -1 到 1；移动转向更顺滑。**
