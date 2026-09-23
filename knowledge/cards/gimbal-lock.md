---
title: 万向锁的成因与规避方法
date: 2026-09-23
category: Unity
tags: [Unity, 万向锁, 四元数]
icon: fas fa-clock
difficulty: 3
---

## 定义

万向锁发生在欧拉角旋转中：当按固定顺序旋转时，中间轴达到 ±90°，第一轴和第三轴的旋转轴重合，系统失去一个旋转自由度。

## 成因

以 Unity 常用的 ZXY 旋转顺序为例，中间轴是 X 轴。当 X 接近 ±90° 时，Z 轴和 Y 轴在空间中趋于同向或反向，调整 Z 和 Y 的效果变得无法区分，欧拉角表示出现退化。

## 规避方式

- 使用四元数 `Quaternion` 表示和插值旋转。
- 避免直接对欧拉角做线性插值或累加。
- 需要朝向另一个目标时，使用 `Quaternion.LookRotation`。
- 某些相机控制可限制俯仰角，避免中间轴达到 ±90°。
- 读取 `transform.eulerAngles` 时不要假设数值唯一，它会在等价角度间跳变。

## 代码示例

```csharp
Quaternion targetRotation = Quaternion.LookRotation(target.position - transform.position);
transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * speed);
```

四元数用四个分量表示三维旋转，不会出现欧拉角的三轴耦合退化。

## 常见坑

- 万向锁是欧拉角表示的问题，不是四元数的问题。
- 对欧拉角做 `Lerp` 可能产生意外旋转路径。
- 物理刚体旋转应使用 `Rigidbody.MoveRotation` 或四元数赋值。

> 记忆：**中间轴 ±90°，首尾轴重合丢自由度；用四元数绕开欧拉角退化。**
