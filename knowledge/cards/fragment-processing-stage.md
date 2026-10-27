---
title: 片元处理阶段与着色流程
date: 2026-09-23
category: 图形性能
tags: [片元着色器, 像素, GPU]
icon: fas fa-layer-group
difficulty: 3
---

## 定义

片元处理阶段对光栅化生成的每个片元执行片元着色器，计算最终颜色、透明度等输出，并决定片元是否被丢弃。

## 主要工作

- 采样纹理和法线贴图。
- 执行光照、阴影、反射等计算。
- 根据 alpha 或自定义条件 `discard` 片元。
- 输出一个或多个渲染目标颜色。

## 代码示例

```hlsl
fixed4 frag(v2f i) : SV_Target
{
    fixed4 tex = tex2D(_MainTex, i.uv);
    fixed3 color = tex.rgb * _Color.rgb;
    return fixed4(color, tex.a * _Color.a);
}
```

## 性能要点

- 片元数量乘以片元着色器复杂度决定像素填充开销。
- 纹理采样、动态分支和复杂数学都会增加开销。
- 移动端应避免高精度、高复杂度的逐像素计算。

## 常见坑

- `discard` 会破坏 Early-Z 等优化，应谨慎使用。
- 过度绘制会导致同一像素被多次着色。
- 片元着色器输出格式要与渲染目标匹配。

> 记忆：**逐片元着色，采样纹理算光照；输出颜色，写入渲染目标。**
