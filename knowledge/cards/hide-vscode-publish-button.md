---
title: 用设置隐藏 VS Code 发布按钮
date: 2026-09-23
category: 版本控制
tags: [VS Code, 设置, 发布按钮]
icon: fas fa-wrench
difficulty: 2
---

## 结论

通过修改 VS Code 设置，可以让源代码管理面板中的 `Publish to GitHub` 按钮彻底消失，避免误点。

## 图形界面设置

1. 按 `Ctrl + ,` 打开设置。
2. 搜索 `git.showUnpublishedCommitsButton`。
3. 将选项从 `whenEmpty` 改为 `never`。

## settings.json 设置

也可以直接编辑 `settings.json`：

```json
{
  "git.showUnpublishedCommitsButton": "never"
}
```

## 可选：添加哑巴远程

如果仍不放心，可以在项目终端执行：

```bash
git remote add origin DISABLED_LOCAL_ONLY
git config remote.origin.pushurl DISABLED_LOCAL_ONLY
```

之后 `git remote -v` 会显示：

```bash
origin  DISABLED_LOCAL_ONLY (fetch)
origin  DISABLED_LOCAL_ONLY (push)
```

VS Code 会认为已配置远程，不再显示发布按钮。

> 记忆：设置 `never` 隐藏按钮，哑巴远程骗过面板。