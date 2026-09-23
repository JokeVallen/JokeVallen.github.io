---
title: git reflog 能恢复误重置的提交
date: 2026-09-23
category: 版本控制
tags: [git reflog, 恢复, 后悔药]
icon: fas fa-shield-alt
difficulty: 2
---

## 结论

`git reflog` 记录 HEAD 的所有移动历史，能找回被 `git reset --hard` 误删的提交。

## 使用步骤

1. 查看 HEAD 移动记录：

```bash
git reflog
```

输出类似：

```bash
a1b2c3d HEAD@{0}: reset: moving to HEAD~1
e4f5g6h HEAD@{1}: commit: 添加新功能
i7j8k9l HEAD@{2}: commit: 稳定版本
```

2. 找到误删前的提交 ID，例如 `e4f5g6h`。
3. 恢复到该提交：

```bash
git reset --hard e4f5g6h
```

## 注意事项

- `reflog` 只记录本地 HEAD 移动，不涉及远程。
- 默认保留 30 天，过期后可能被垃圾回收。
- 越早恢复越安全。

## 适用场景

- 误用 `git reset --hard`。
- 误删分支。
- 误执行变基或重置。

> 记忆：HEAD 动过就有记录，reflog 是本地 30 天后悔药。