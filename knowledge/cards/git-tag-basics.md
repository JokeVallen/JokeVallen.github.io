---
title: Git 标签是固定不变的存档点
date: 2026-09-23
category: 版本控制
tags: [git tag, 标签, 存档]
icon: fas fa-code
difficulty: 1
---

## 结论

Git 标签是指向某次提交的固定指针，不会随新提交移动，适合标记稳定版本。

## 两种标签

| 类型 | 命令 | 特点 |
|---|---|---|
| 轻量标签 | `git tag v1.0` | 只是一个名字 |
| 附注标签 | `git tag -a v1.0 -m "说明"` | 包含作者、日期、备注 |

正式版本推荐使用附注标签。

## 常用命令

```bash
git tag
git tag -a v1.0 -m "第一个稳定版本"
git show v1.0
git tag -d v1.0
```

## 给历史提交打标签

```bash
git tag -a v0.9 -m "稳定版本" i7j8k9l
```

其中 `i7j8k9l` 是目标提交 ID。

## 与远程的关系

标签默认只在本地。推送到远程需要：

```bash
git push origin v1.0
git push --tags
```

> 记忆：分支会走，标签不动；打标签就是给提交贴永久书签。