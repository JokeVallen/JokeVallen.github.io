---
title: HTTP 协议
date: 2026-09-22
category: 网络
tags: [HTTP, 协议, 应用层]
icon: fas fa-globe
difficulty: 1
---

**定位**：应用层协议，通常基于 TCP（HTTP/3 基于 QUIC/UDP）。

## 核心特点

- **请求-响应模型**：客户端 Request，服务器 Response
- **无状态**：服务器不记上一次请求，状态靠 Cookie / Token / Session
- 由 **方法 + URL + Headers + Body** 组成

## 常见方法

GET（获取）、POST（提交/创建）、PUT（更新）、DELETE（删除）、PATCH（部分更新）。

## 状态码分类

| 段 | 含义 |
|---|---|
| 2xx | 成功（200） |
| 3xx | 重定向（301/302） |
| 4xx | 客户端错误（400/401/403/404） |
| 5xx | 服务端错误（500/502/503） |

## 版本演进

HTTP/1.1（keep-alive）→ HTTP/2（多路复用）→ HTTP/3（QUIC）。

## Unity 中的应用

`UnityWebRequest`（GET / POST / 下载资源 / 贴图）。

实时战斗一般用 **TCP/UDP + 自定义协议 + WebSocket**，不用 HTTP。

> 记忆：**HTTP = 无状态、请求-响应、跑在 TCP 上。**