---
title: 顶点处理阶段与坐标变换
date: 2026-09-23
category: 图形性能
tags: [顶点着色器, GPU, 渲染管线]
icon: fas fa-layer-group
difficulty: 3
---

## 定义

顶点处理阶段对每个顶点执行顶点着色器，完成坐标变换、法线变换、蒙皮、顶点动画等操作，并把结果传给后续图元装配和光栅化。

## 主要工作

- 模型空间到世界空间、观察空间、裁剪空间的矩阵变换。
- 法线、切线等方向的变换。
- 骨骼蒙皮、顶点动画、曲面细分后的顶点计算。
- 输出插值器，供片元着色器使用。

## 代码示例

```hlsl
struct appdata
{
    float4 vertex : POSITION;
    float3 normal : NORMAL;
};

struct v2f
{
    float4 pos : SV_POSITION;
    float3 worldNormal : TEXCOORD0;
};

v2f vert(appdata v)
{
    v2f o;
    o.pos = UnityObjectToClipPos(v.vertex);
    o.worldNormal = UnityObjectToWorldNormal(v.normal);
    return o;
}
```

## 常见坑

- 顶点数很多时，顶点着色器开销会线性增加。
- 法线变换必须使用正确的逆转置矩阵，否则光照会错误。
- 顶点着色器不能直接创建或销毁图元，几何扩展需要几何着色器或曲面细分。

- 曲面细分和几何着色器可插入到几何阶段前后。

> 记忆：**逐顶点执行，做坐标和法线变换；输出插值器，交给光栅化。**
