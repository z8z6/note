---
cover: cpp
date: 2025-04-20
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "vexing_parse"
---

# 最令人困惑的解析

当一条语句既能解释为对象定义，也能解释为函数声明时，C++ 语法优先选择函数声明。这称为 most vexing parse。

## 典型示例

```cpp
Widget value(Widget());
```

它不是用临时 `Widget` 构造 `value`，而是声明函数 `value`：参数是返回 `Widget` 的函数指针，返回类型也是 `Widget`。

迭代器区间也容易触发：

```cpp
std::vector<int> values(
    std::istream_iterator<int>(std::cin),
    std::istream_iterator<int>());
```

## 推荐解法

先为边界迭代器命名，语义最清楚：

```cpp
std::istream_iterator<int> first(std::cin);
std::istream_iterator<int> last;
std::vector<int> values(first, last);
```

也可以使用额外括号消除函数声明解释：

```cpp
std::vector<int> values(
    (std::istream_iterator<int>(std::cin)),
    std::istream_iterator<int>());
```

花括号适合普通对象初始化，但不能机械用于这里：`vector{first, last}` 可能选择 `initializer_list` 构造函数，从而表示“两个元素”，而不是迭代器区间。

::: tip
现代代码可用具名变量、工厂函数或 `auto value = Widget{};` 避免歧义。重点是让声明意图对编译器和读者都唯一。
:::
