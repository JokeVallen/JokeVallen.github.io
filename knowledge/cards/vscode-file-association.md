---
title: VSCode 文件关联设置
date: 2026-09-23
category: 工具
tags: [VSCode, 文件关联, 编辑器]
icon: fas fa-wrench
difficulty: 1
---

## 定义

VSCode 文件关联把某种文件扩展名映射到指定语言 ID，从而启用对应的语法高亮、补全和格式化能力。

## 配置方式

在用户设置或工作区设置的 `settings.json` 中添加：

```json
{
  "files.associations": {
    "*.shader": "hlsl",
    "*.cs": "csharp",
    "*.proto": "protobuf"
  }
}
```

- 用户设置对所有工作区生效。
- 工作区设置只对当前项目生效，适合项目私有扩展名。

## 常见用途

- 让 `.shader`、`.compute` 使用 HLSL 高亮。
- 让自定义配置、模板或代码生成文件获得正确高亮。
- 修复 VSCode 未识别扩展名导致的纯文本显示。

## 常见坑

- 文件关联只影响编辑器语言模式，不会改变编译器或构建系统行为。
- C# 的补全和调试依赖 C# 扩展与项目文件，不只是文件关联。
- 工作区设置优先于用户设置，冲突时应检查 `.vscode/settings.json`。

> 记忆：**扩展名映射语言 ID，只影响编辑体验，不影响编译。**
