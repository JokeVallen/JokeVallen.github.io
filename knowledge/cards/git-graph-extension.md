---
title: Git Graph 插件可图形化回退版本
date: 2026-09-23
category: 版本控制
tags: [Git Graph, VS Code, 回退]
icon: fas fa-wrench
difficulty: 1
---

## 结论

安装 Git Graph 插件后，可以在 VS Code 中查看提交图谱，并通过右键菜单直接回退版本。

## 安装与打开

1. 在 VS Code 扩展市场搜索 `Git Graph`。
2. 安装由 `mhutchie` 开发的版本。
3. 点击源代码管理面板右上角的 `View Git Graph` 按钮。
4. 或按 `Ctrl + Shift + P`，输入 `Git Graph: View Git Graph`。

## 回退操作

在提交图谱中找到目标提交，右键选择：

| 菜单项 | 作用 | 适用场景 |
|---|---|---|
| `Revert Commit` | 创建反向提交 | 已推送远程 |
| `Reset Current Branch to Commit` | 移动分支指针 | 仅本地 |

选择 `Reset` 后，会弹出模式选项：

- `Soft`：保留改动在暂存区。
- `Mixed`：保留改动在工作区。
- `Hard`：彻底删除改动。

## 建议

本地回退优先选择 `Mixed`，代码不会丢失。

> 记忆：Git Graph 看图右键，Revert 安全，Reset 选 Mixed。