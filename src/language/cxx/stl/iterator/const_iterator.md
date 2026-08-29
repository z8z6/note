---
cover: cpp
date: 2025-04-20
topic: "STL · 迭代器"
keywords:
  - "C++"
  - "STL · 迭代器"
  - "const_iterator"
---

# const_iterator

`const_iterator` 允许读取元素但禁止通过该迭代器修改元素。它表达的是“访问权限”，不代表底层容器一定是 `const`。

## 使用

```cpp
std::vector<int> values{1, 2, 3};

for (auto it = values.cbegin(); it != values.cend(); ++it) {
    std::cout << *it << '\n';
    // *it = 0; // 编译错误
}
```

普通 `iterator` 通常可以隐式转换为 `const_iterator`，反向转换不允许。

## const 容器

```cpp
void print(const std::vector<int>& values) {
    auto first = values.begin(); // 类型本身就是 const_iterator
    std::copy(first, values.end(),
              std::ostream_iterator<int>(std::cout, " "));
}
```

`cbegin()` / `cend()` 能在容器不是 `const` 时主动表达只读意图，特别适合查找后只观察元素的代码。

::: tip
`const_iterator` 禁止修改元素，但不能阻止其他代码修改容器。容器结构变化后，仍需遵守相同的迭代器失效规则。
:::
