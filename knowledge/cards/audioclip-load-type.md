---
title: AudioClip Load Type 的三种取舍
date: 2026-09-24
category: 资源管理
tags: [AudioClip, 内存, 加载]
icon: fas fa-volume-up
difficulty: 2
---

## 结论

| Load Type | 内存 | CPU | 适用 |
|---|---|---|---|
| Decompress On Load | 高 | 播放时低 | 短音效、高频播放 |
| Compressed In Memory | 中 | 播放时解压 | 中等长度音频 |
| Streaming | 低 | 持续读取解码 | 长音乐、背景音 |

## 实践

- 短促、高频的 UI 音效用 Decompress On Load
- 长 BGM 用 Streaming，避免常驻大内存
- 语音可考虑 Compressed In Memory
- 单声道足够时开启 Force To Mono
- 需要无延迟播放时开启 Preload Audio Data

## 常见坑

- 所有音频都用 Decompress On Load，内存暴涨
- 短音效用 Streaming，频繁磁盘读取导致卡顿
- 压缩格式与平台不匹配
- 同时播放大量音效导致 CPU 峰值

> 记忆：**短音效解压常驻，长音乐流式播放。**
