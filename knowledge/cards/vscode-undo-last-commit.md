---
title: VS Code 内置可撤销上次提交
date: 2026-09-23
category: 版本控制
tags: [VS Code, 撤销提交, reset]
icon: fas fa-wrench
difficulty: 1
---

## 结论

VS Code 源代码管理面板内置了“撤销上次提交”功能，实际执行的是 `git reset --soft HEAD~1`。

## 操作路径

1. 打开源代码管理面板。
2. 点击右上角 `...` 更多操作。
3. 选择 `撤销上次提交` 或 `Undo Last Commit`。

## 执行效果

| 项目 | 结果 |
|---|---|
| 提交记录 | 撤销最近一次提交 |
| 代码改动 | 保留 |
| 暂存状态 | 仍在暂存区 |
| 等价命令 | `git reset --soft HEAD~1` |

## 适用场景

- 刚提交完发现提交信息写错。
- 刚提交完发现漏了文件。
- 想重新组织这次提交。

## 注意事项

该功能只撤销最近一次提交。如果要回退到更早的任意提交，需要使用命令面板中的 `Git: Reset HEAD to Commit...`，或安装 Git Graph 插件。

> 记忆：VS Code 撤销上次提交等于 `reset --soft HEAD~1`，代码还在暂存区。