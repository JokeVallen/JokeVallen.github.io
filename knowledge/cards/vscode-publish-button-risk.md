---
title: VS Code 发布按钮不会自动创建远程仓库
date: 2026-09-23
category: 版本控制
tags: [VS Code, Publish, 远程仓库]
icon: fas fa-shield-alt
difficulty: 1
---

## 结论

点击 VS Code 的 `Publish to GitHub` 按钮后，不会立刻静默上传，而是需要多次手动确认。

## 点击后的流程

1. **授权确认**：如果未登录 GitHub，会打开浏览器要求登录并授权。
2. **选择仓库类型**：弹窗选择 `Public` 或 `Private`。
3. **确认创建**：只有完成选择后，才会创建远程仓库并推送。

任何一步取消，都不会创建远程仓库。

## 误操作后的处理

如果确实误创建了远程仓库，可以登录 GitHub，进入仓库 `Settings`，滚动到底部点击 `Delete this repository`，按提示确认删除。

本地 `.git` 目录和提交历史不受影响。

## 如何彻底避免

- 将设置 `git.showUnpublishedCommitsButton` 改为 `never`，发布按钮会消失。
- 或添加无效远程地址，让 VS Code 认为已配置远程。

> 记忆：发布按钮不是一键上传，中间有授权和选择，误点可取消。