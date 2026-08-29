---
cover: cpp
date: 2025-04-12
topic: "STL · 适配器"
keywords:
  - "C++"
  - "STL · 适配器"
  - "iterator"
---

# 迭代器适配器

迭代器适配器不改变容器，而是改变读写区间的方式。常见类型包括插入迭代器、反向迭代器和流迭代器。

## 插入迭代器

- `std::back_inserter(container)`：赋值转为 `push_back`。
- `std::front_inserter(container)`：赋值转为 `push_front`。
- `std::inserter(container, pos)`：赋值转为 `insert(pos, value)`。

```cpp
std::vector<int> source{1, 2, 3};
std::vector<int> target;
std::ranges::copy(source, std::back_inserter(target));
```

插入迭代器能让算法负责“写入”，容器负责“扩容”，避免提前创建无意义的默认元素。

## 反向迭代器

```cpp
for (auto it = values.rbegin(); it != values.rend(); ++it) {
    std::cout << *it << ' ';
}
```

反向迭代器的 `base()` 指向其当前元素的后一个位置。这是为了维持半开区间语义，转换后使用位置时尤其需要注意。

## 流迭代器

```cpp
std::istream_iterator<int> first(std::cin);
std::istream_iterator<int> last;
std::vector<int> values(first, last);

std::copy(values.begin(), values.end(),
          std::ostream_iterator<int>(std::cout, " "));
```

声明输入区间时使用具名迭代器可避免“最令人困惑的解析”。对复杂输入格式，直接循环读取通常更容易处理错误。

## 移动迭代器

`std::make_move_iterator` 让解引用结果表现为右值，从而在目标容器构造时移动元素。移动后源元素仍然有效，但值处于合法且未指定的状态。
