---
cover: cpp
date: 2025-04-12
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "functor"
---

# 函数对象

函数对象是实现了调用运算符 `operator()` 的对象。它既能像函数一样调用，也能用成员保存策略或运行时状态。

## 定义与使用

```cpp
struct DivisibleBy {
    int divisor;

    bool operator()(int value) const {
        return value % divisor == 0;
    }
};

std::vector<int> values{1, 2, 3, 4, 5, 6};
auto count = std::ranges::count_if(values, DivisibleBy{3});
```

算法通常按值接收谓词，因此内部可能复制函数对象。谓词不应依赖“整个算法过程中只有唯一副本”这一假设。

## remove_if 的要求

```cpp
values.erase(
    std::remove_if(values.begin(), values.end(),
                   [](int value) { return value % 3 == 0; }),
    values.end());
```

谓词应根据元素值稳定地给出结果。用内部计数器删除“第 n 个元素”会依赖算法调用次数与复制行为，属于脆弱设计。若需求与位置有关，应显式遍历或先计算目标迭代器。

```cpp
if (values.size() >= 3) {
    values.erase(values.begin() + 2);
}
```

## Lambda 与状态

```cpp
int threshold = 10;
auto greater = [threshold](int value) { return value > threshold; };
```

Lambda 本质上也是编译器生成的函数对象。按值捕获提供独立状态，按引用捕获要求被引用对象在调用期间持续存活。

::: tip
需要跨调用共享可变状态时，先确认算法是否允许有副作用。很多排序、删除和并行算法要求谓词满足更严格的稳定性与线程安全条件。
:::
