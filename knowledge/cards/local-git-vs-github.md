---
title: 本地 Git 与 GitHub 是两套系统
date: 2026-09-23
category: 版本控制
tags: [Git, GitHub, 本地仓库]
icon: fas fa-code
difficulty: 1
---

## 结论

Git 是本地版本控制工具，GitHub 是远程代码托管平台。两者独立，本地 Git 不需要联网。

## 核心区别

| 维度 | Git | GitHub |
|---|---|---|
| 位置 | 本地电脑 | 远程服务器 |
| 作用 | 管理版本历史 | 托管远程仓库 |
| 是否联网 | 不需要 | 需要 |
| 数据存储 | `.git` 目录 | 远程仓库 |

## 本地 Git 能做什么

- 初始化仓库：`git init`
- 暂存改动：`git add`
- 提交版本：`git commit`
- 查看历史：`git log`
- 回退版本：`git reset`
- 打标签：`git tag`

以上操作全部在本地完成，不访问网络。

## 什么时候才需要网络

只有涉及远程仓库的操作才需要联网：

```bash
git clone
git push
git pull
git fetch
```

> 记忆：Git 管版本，GitHub 管托管；本地提交不出网。