---
title: 用标签回退本地稳定版本
date: 2026-09-23
category: 版本控制
tags: [git reset, 标签, 回退]
icon: fas fa-wrench
difficulty: 2
---

## 结论

给稳定版本打标签后，可以用标签名代替提交 ID 执行回退，避免记忆长哈希值。

## 操作步骤

1. 在稳定版本上打标签：

```bash
git tag -a stable-v1 -m "功能正常的稳定版本"
```

2. 继续开发并产生多次提交。
3. 发现问题后回退到标签：

```bash
git reset --mixed stable-v1
```

## 结果

- 提交历史回到 `stable-v1` 对应版本。
- 之后的代码改动保留在工作区，变成未暂存状态。
- 可以重新修改后提交新版本。

## 如果只想撤销某次提交

已推送到远程时，不要用 `reset`，应使用：

```bash
git revert <commit-id>
```

## 查看标签

```bash
git tag
git show stable-v1
```

> 记忆：稳定版本打标签，回退只用 `reset --mixed 标签名`。