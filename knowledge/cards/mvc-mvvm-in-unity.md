---
title: MVC 与 MVVM 在 Unity UI 中的落地
date: 2026-09-25
category: 架构
tags: [MVC, MVVM, UI架构]
icon: fas fa-columns
difficulty: 3
---

## 结论

Unity UI 中更常见的落地方式是「View + Presenter/ViewModel + Model」：

- View：按钮、文本、动画等 Unity 对象
- Presenter/ViewModel：处理交互、状态与数据转换
- Model：业务数据与规则

## MVC

- Controller 接收输入并更新 Model
- Model 变化后通知 View 刷新
- 适合交互流程清晰的界面

## MVVM

- View 绑定 ViewModel 属性与命令
- 数据驱动 UI，减少手动 SetText/SetActive
- 需要绑定框架或自己实现轻量通知

## Unity 实践

- View 不直接访问网络和存档
- ViewModel 不依赖 UnityEngine 越少越好
- 用事件或属性通知刷新
- 生命周期结束时取消绑定
- 不要为了模式而模式，小界面可以简化

## 常见坑

- View 和逻辑混在一个 MonoBehaviour
- 双向绑定造成循环刷新
- ViewModel 持有 View 导致泄漏
- 数据刷新过于频繁，触发大量 UI 重建

> 记忆：**View 负责显示，ViewModel 负责状态，Model 负责规则。**
