---
title: Git 三棵树模型决定 reset 行为
date: 2026-09-23
category: 版本控制
tags: [Git, reset, 三棵树]
icon: fas fa-sitemap
difficulty: 2
---

## 结论

`git reset` 的行为由 Git 的三棵树决定：HEAD、暂存区、工作区。不同模式决定回退时覆盖哪几棵树。

## 三棵树

| 名称 | 英文 | 含义 |
|---|---|---|
| 历史记录 | HEAD | 已提交的版本库 |
| 暂存区 | Index / Staging | `git add` 后的待提交内容 |
| 工作区 | Working Directory | 硬盘上正在编辑的文件 |

## reset 的本质

`git reset` 先移动 HEAD 指针到目标提交，然后根据模式决定是否重置暂存区和工作区。

- `--soft`：只移动 HEAD，暂存区和工作区保留。
- `--mixed`：移动 HEAD，重置暂存区，工作区保留。
- `--hard`：移动 HEAD，重置暂存区，覆盖工作区。

## 示例

假设提交历史为 `A -> B -> C`，当前在 `C`：

```bash
git reset --soft A
git reset --mixed A
git reset --hard A
```

三种命令都会让 HEAD 回到 `A`，但代码保留程度不同。

> 记忆：HEAD 是历史，Index 是暂存，Working 是文件；reset 模式决定动哪几棵。