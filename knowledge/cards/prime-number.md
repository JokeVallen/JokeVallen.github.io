---
title: 质数判断与埃氏筛法详解
date: 2026-09-23
category: 数学
tags: [质数, 筛法, 数论]
icon: fas fa-calculator
difficulty: 2
---

## 定义

质数是大于 1 且只能被 1 和自身整除的自然数。判断单个数常用试除法，批量求质数常用埃拉托斯特尼筛法。

## 试除法

只需检查 `2` 到 `sqrt(n)`：

```csharp
static bool IsPrime(int n)
{
    if (n < 2) return false;
    if (n == 2) return true;
    if (n % 2 == 0) return false;

    for (int i = 3; i * i <= n; i += 2)
        if (n % i == 0) return false;
    return true;
}
```

时间复杂度为 O(sqrt(n))。

## 埃氏筛法

```csharp
static List<int> Sieve(int max)
{
    var isPrime = new bool[max + 1];
    Array.Fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;

    for (int i = 2; i * i <= max; i++)
        if (isPrime[i])
            for (int j = i * i; j <= max; j += i)
                isPrime[j] = false;

    return Enumerable.Range(2, max - 1).Where(i => isPrime[i]).ToList();
}
```

时间复杂度约为 O(n log log n)。

## 常见坑

- 1 不是质数，2 是唯一的偶质数。
- 试除法循环条件用 `i * i <= n` 可避免开方。
- 筛法从 `i * i` 开始标记，避免重复工作。

## 补充要点

- 试除法适合判断少量数字，筛法适合求某个范围内的全部质数。
- 线性筛可做到每个合数只被最小质因子筛一次，复杂度 O(n)。
- 大数素性测试可使用 Miller-Rabin 等概率算法。

- 判断质数时先处理偶数，可显著减少试除循环次数。

> 记忆：**单个数试除到根号 n，批量用埃氏筛；1 不是质数。**
