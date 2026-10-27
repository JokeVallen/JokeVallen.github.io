---
title: git reset 三种模式决定代码去留
date: 2026-09-23
category: 版本控制
tags: [git reset, 回退, HEAD]
icon: fas fa-code
difficulty: 2
---

## 结论

`git reset` 移动 HEAD 指针，并按模式决定暂存区和工作区是否保留改动。

## 三种模式

| 模式 | HEAD | 暂存区 | 工作区 | 用途 |
|---|---|---|---|---|
| `--soft` | 回退 | 保留 | 保留 | 撤销提交，改动仍在暂存区 |
| `--mixed` | 回退 | 清空 | 保留 | 撤销提交，改动回到工作区 |
| `--hard` | 回退 | 清空 | 删除 | 彻底放弃目标提交之后的改动 |

## 示例

```bash
git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1
```

- `HEAD~1` 表示上一个提交。
- 不带模式参数时，默认是 `--mixed`。

## 常见坑

- `--hard` 会永久删除未提交改动。
- 已推送到远程的历史不要用 `reset`，应使用 `revert`。
- 误用 `--hard` 后可用 `git reflog` 找回。

> 记忆：soft 留暂存，mixed 留工作区，hard 全丢。