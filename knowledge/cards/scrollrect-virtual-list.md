---
title: ScrollRect 大列表应使用虚拟滚动
date: 2026-09-24
category: Unity
tags: [UGUI, ScrollRect, 对象池]
icon: fas fa-list
difficulty: 3
---

## 结论

数据量超过几十项时，不要一次性创建全部 Item。虚拟滚动只创建可视区域附近的单元格，并在滚动时复用。

## 核心步骤

1. 根据数据计算内容总高度或总宽度
2. 根据滚动位置计算当前可见的索引区间
3. 从对象池取出单元格，绑定对应数据
4. 移出可视区的单元格回收进池
5. 只更新位置和内容，不重建整个列表

## 常见坑

- 用 `VerticalLayoutGroup + ContentSizeFitter` 驱动大列表，布局重建代价高
- 每帧调用 `LayoutRebuilder.ForceRebuildLayoutImmediate`
- 可变高度单元格的偏移需要缓存前缀和
- 回收时未取消事件、未重置状态，导致数据串位
- 缩放或旋转后可视区域计算错误

## 推荐

固定高度优先自己实现虚拟列表；可变高度可用前缀和 + 二分查找定位。裁剪配合 `RectMask2D`。

> 记忆：**列表只实例化看得见的，滚动时复用而不是重建。**
