---
title: git revert 与 reset 的区别在改写历史
date: 2026-09-23
category: 版本控制
tags: [git revert, git reset, 历史]
icon: fas fa-shield-alt
difficulty: 2
---

## 结论

`git revert` 通过新增反向提交来抵消改动，不修改历史；`git reset` 直接移动 HEAD，会改写历史。

## 对比

| 维度 | git revert | git reset |
|---|---|---|
| 历史 | 不修改 | 修改 |
| 提交记录 | 新增一条 | 删除后续提交 |
| 安全性 | 高 | 中到低 |
| 适用场景 | 已推送远程 | 仅本地 |
| 协作影响 | 无 | 可能导致冲突 |

## 示例

撤销某次提交：

```bash
git revert a1b2c3d
```

回退到某次提交：

```bash
git reset --mixed a1b2c3d
```

## 选择原则

- 代码已经 `git push`：用 `revert`。
- 代码只在本地：用 `reset`。
- 不确定时：优先 `revert`，因为它不会删除历史。

> 记忆：revert 加一笔，reset 改历史；远程用 revert，本地用 reset。