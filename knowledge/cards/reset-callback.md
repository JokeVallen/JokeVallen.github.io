---
title: Unity Reset 回调
date: 2026-09-23
category: Unity
tags: [Unity, Reset, 生命周期]
icon: fas fa-clock
difficulty: 1
---

## 定义

`Reset` 是 MonoBehaviour 的编辑器回调，在组件第一次添加到 GameObject 或执行 Reset 命令时调用，用于设置默认值。

## 代码示例

```csharp
public class Health : MonoBehaviour
{
    public int maxHealth = 100;

    private void Reset()
    {
        maxHealth = 100;
    }
}
```

## 特点

- 只在编辑器中调用，打包后的运行时不会执行。
- 适合给 Inspector 字段设置合理默认值。
- 添加组件、重置组件或通过脚本添加组件时可能触发。
- 不会在场景加载或对象实例化时自动调用。

## 常见坑

- 不要把运行时初始化逻辑放在 `Reset` 中，构建后不会执行。
- `Reset` 中访问其他组件可能失败，因为组件关系尚未稳定建立。
- 需要运行时初始化应使用 `Awake` 或 `Start`。

- 可在 Reset 中根据已有组件自动补全引用，提升编辑器体验。

> 记忆：**Reset 是编辑器回调，用来还原默认值；运行时初始化交给 Awake。**
