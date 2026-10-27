---
title: 字符串是常见的隐藏分配源
date: 2026-09-26
category: 性能优化
tags: [string, 分配, UI]
icon: fas fa-font
difficulty: 2
---

## 结论

string 是不可变引用类型，每次拼接、格式化、`ToString` 都可能产生新对象和 GC。

## 高频场景

- `scoreText.text = "Score: " + score;`
- 每帧 `string.Format`
- 枚举 `ToString`
- 日志字符串在发布包仍然拼接
- TMP 每次赋新字符串

## 优化

- 缓存固定字符串
- 用 `StringBuilder` 拼接复杂文本
- 数字显示用 TMP 的 `SetText` 或字符数组接口
- 日志用条件编译或延迟格式化
- 枚举比较用值而不是 `ToString`

## 注意

不是所有字符串都要优化；只处理每帧或高频调用的热点路径。

> 记忆：**字符串每次变化都可能分配，UI 数字文本是重灾区。**
