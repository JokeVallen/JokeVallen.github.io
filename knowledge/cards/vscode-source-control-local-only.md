---
title: VS Code 源代码管理仅操作本地仓库
date: 2026-09-23
category: 版本控制
tags: [VS Code, Source Control, 本地]
icon: fas fa-wrench
difficulty: 1
---

## 结论

VS Code 内置 Source Control 是 Git 的本地图形界面，所有操作只读写项目中的 `.git` 目录，不会自动上传 GitHub。

## 如何自查

在项目终端执行：

```bash
git remote -v
```

- 无输出：没有配置远程仓库，想传也传不出去。
- 显示 `origin`：已配置远程地址。
- 只有执行 `git push` 或点击 `Publish to GitHub` 才会联网。

## 常见操作是否联网

| 操作 | 是否联网 |
|---|---|
| 初始化仓库 | 否 |
| 暂存文件 | 否 |
| 提交 | 否 |
| 查看历史 | 否 |
| 点击 Publish to GitHub | 是 |
| 执行 git push | 是 |

## 安全边界

Source Control 面板只是把命令行 Git 操作图形化。它不会在后台偷偷创建远程仓库，也不会自动推送。只要不主动点击发布按钮或执行 `git push`，代码始终只在本地。

> 记忆：Source Control 管本地，Publish 和 push 才出网。