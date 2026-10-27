---
title: CreateAssetMenu 特性
date: 2026-09-23
category: Unity
tags: [Unity, ScriptableObject, 编辑器]
icon: fas fa-code
difficulty: 1
---

## 定义

`CreateAssetMenuAttribute` 用在 `ScriptableObject` 子类上，让该类可以通过 Unity 的 `Assets > Create` 菜单直接创建资源文件。

## 代码示例

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "NewItem", menuName = "Game/Item")]
public class ItemData : ScriptableObject
{
    public string itemName;
    public int price;
}
```

## 参数说明

| 参数 | 含义 |
|---|---|
| `fileName` | 新建资源的默认文件名 |
| `menuName` | 出现在 Create 菜单中的路径 |
| `order` | 菜单排序值 |

## 常见坑

- 该特性只对 `ScriptableObject` 有意义，不能用于普通 MonoBehaviour。
- `menuName` 重复可能导致菜单项冲突。
- 创建出的资源应作为数据容器，不要在运行时随意修改原始资源。

## 补充要点

- 可在 `CreateAssetMenu` 中省略 `fileName`，Unity 会使用默认名称。
- 菜单路径使用 `/` 分隔，便于按模块组织资源。
- 该特性能减少手动配置资源的工作量，常用于配置表、技能和道具数据。

- 配置资源通过引用被场景对象使用，修改资源会全局生效。
- 可以通过 AssetDatabase 在编辑器脚本中自动创建和刷新资源。

> 记忆：**ScriptableObject 加 CreateAssetMenu，编辑器菜单直接建资源。**
