---
cover: cpp
topic: "STL · 容器"
keywords:
  - "C++"
  - "STL · 容器"
  - "forward_list"
---

# std::forward_list

`std::forward_list` 是单向链表。每个节点只保存一个后继指针，适合需要节点地址稳定、频繁在已知位置后插删且只需单向遍历的场景。

## 基本操作

```cpp
#include <forward_list>

std::forward_list<int> values{2, 3, 4};
values.push_front(1);

auto before = values.before_begin();
values.insert_after(before, 0);
values.erase_after(before);
```

由于单向链表无法高效找到前驱，接口采用 `insert_after` 和 `erase_after`。`before_begin()` 是首元素之前的特殊迭代器。

## 为什么没有 size

标准没有要求 `forward_list::size()`，以保证移动区间和拼接等操作可以维持预期复杂度。需要数量时可用 `std::distance` 计算 O(n)，或在业务层单独维护计数。

## splice_after

```cpp
std::forward_list<int> source{3, 4};
std::forward_list<int> target{1, 2};
target.splice_after(target.before_begin(), source);
```

拼接会转移节点而不复制元素，被转移节点的引用和指针仍然有效。迭代器属于的逻辑容器发生变化，应避免继续用旧区间假设操作它们。

## 选择建议

与 `vector` 相比，链表每个元素需要额外指针和独立分配，缓存局部性也更差。除非节点稳定性或 O(1) 拼接是明确需求，否则通常先选择 `vector`。
