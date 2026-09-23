---
title: 本地回退优先使用 mixed 模式
date: 2026-09-23
category: 版本控制
tags: [git reset, mixed, 安全]
icon: fas fa-shield-alt
difficulty: 2
---

## 结论

本地回退版本时，优先使用 `git reset --mixed`，它只回退提交记录，保留代码改动。

## 为什么安全

| 模式 | 代码是否保留 | 风险 |
|---|---|---|
| `--soft` | 保留在暂存区 | 低 |
| `--mixed` | 保留在工作区 | 低 |
| `--hard` | 彻底删除 | 高 |

`--mixed` 是默认模式，不带参数时就是它。

## 推荐流程

1. 查看历史：

```bash
git log --oneline
```

2. 回退到目标提交：

```bash
git reset --mixed <commit-id>
```

3. 检查工作区代码，确认改动仍在。
4. 重新修改并提交。

## 避免操作

- 不要随意使用 `git reset --hard`。
- 不要对已推送的提交使用 `reset`。
- 误操作后立即使用 `git reflog` 恢复。

> 记忆：本地回退用 mixed，提交回退，代码留下。