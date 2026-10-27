---
title: GetAxisRaw 原始输入
date: 2026-09-23
category: Unity
tags: [Unity, Input, GetAxisRaw]
icon: fas fa-code
difficulty: 1
---

## 定义

`Input.GetAxisRaw` 返回未经平滑的轴输入值，键盘通常直接得到 `-1`、`0` 或 `1`，适合需要瞬时响应的操作。

## 与 GetAxis 对比

| 维度 | GetAxis | GetAxisRaw |
|---|---|---|
| 平滑处理 | 有 | 无 |
| 键盘输出 | 渐变到 ±1 | 立即 ±1 或 0 |
| 适合场景 | 角色移动、转向 | 菜单切换、像素级操作 |
| 响应速度 | 较慢但平滑 | 立即响应 |

```csharp
void Update()
{
    float h = Input.GetAxisRaw("Horizontal");
    if (Mathf.Abs(h) > 0.01f)
        transform.Translate(Vector3.right * h * speed * Time.deltaTime);
}
```

## 常见坑

- 原始输入可能因手柄死区产生漂移，需要自行处理死区。
- 菜单导航如果直接使用原始输入，可能一次输入触发多次选择。
- 需要平滑过渡时仍应选择 `GetAxis`。

## 补充要点

- 键盘输入没有过渡动画，适合需要立即判断的移动或菜单。
- 手柄摇杆仍可能返回连续小数，死区处理不可省略。
- 若需要同时支持键盘和摇杆，可在代码中统一归一化输入向量。

- 对摇杆来说，原始值仍需结合死区和灵敏度曲线调整。

> 记忆：**GetAxisRaw 不平滑，键盘只出 -1、0、1；要快速响应用它。**
