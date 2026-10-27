---
title: 用 git log --oneline 快速查版本号
date: 2026-09-23
category: 版本控制
tags: [git log, 版本号, 历史]
icon: fas fa-wrench
difficulty: 1
---

## 结论

`git log --oneline` 以单行格式显示提交历史，便于快速找到回退目标的提交 ID。

## 命令

```bash
git log --oneline
```

输出示例：

```bash
a1b2c3d 第四次提交：新功能有bug
e4f5g6h 第三次提交：修改样式
i7j8k9l 第二次提交：稳定版本
m0n1o2p 第一次提交：初始化项目
```

左侧短字符串就是提交 ID。

## 常用变体

| 命令 | 作用 |
|---|---|
| `git log --oneline` | 单行显示 |
| `git log --oneline --graph` | 显示分支图 |
| `git log --oneline -5` | 只显示最近 5 条 |
| `git log --oneline --all` | 显示所有分支 |

## 配合回退

复制目标提交 ID，例如 `i7j8k9l`，然后执行：

```bash
git reset --mixed i7j8k9l
```

> 记忆：`git log --oneline` 一行一个提交，复制 ID 就能回退。