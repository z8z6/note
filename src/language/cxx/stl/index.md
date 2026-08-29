---
cover: cpp
date: 2025-04-20
topic: "C++ 基础"
keywords:
  - "C++"
  - "C++ 基础"
  - "STL 导览"
---

# STL 导览

标准模板库由容器、迭代器、算法、函数对象和适配器组成。它们通过统一的区间模型协作：算法通常接收 `[first, last)`，并不需要知道底层容器类型。

## 组件关系

```text
容器 ──提供──> 迭代器 ──描述区间──> 算法
  │                                  │
  └──分配器管理存储          函数对象提供策略
```

## 容器选择

| 需求 | 推荐容器 | 关键特性 |
| --- | --- | --- |
| 连续存储、随机访问 | `std::vector` | 缓存友好，尾部插入均摊 O(1) |
| 固定大小 | `std::array` | 大小属于类型，无动态分配 |
| 稳定节点地址、双向遍历 | `std::list` | 任意位置已知节点插删 O(1) |
| 仅单向节点链 | `std::forward_list` | 节点开销较小，无 `size()` |
| 键值查找 | `std::map` / `std::unordered_map` | 有序 O(log n) / 平均 O(1) |

默认优先考虑 `vector`。链表的常数开销、分配次数和缓存局部性往往使它在实际工作负载中更慢，除非确实需要节点稳定性或拼接操作。

## 算法与范围

```cpp
#include <algorithm>
#include <vector>

std::vector<int> values{4, 1, 3, 2};
std::ranges::sort(values);
auto even = std::ranges::count_if(values, [](int n) { return n % 2 == 0; });
```

C++20 ranges 能直接接收范围并减少 `begin/end` 样板代码。传统算法仍非常重要，尤其是在需要子区间或兼容旧标准时。

## 元素与引用

标准容器保存的是元素对象，而不是引用。需要间接共享对象时，可以存放智能指针；只想引用已有对象且能保证生命周期时，可使用 `std::reference_wrapper<T>`。

```cpp
std::vector<std::reference_wrapper<int>> refs{a, b};
std::vector<std::unique_ptr<Node>> owned_nodes;
```

::: warning
每种容器的插入、删除操作都有不同的迭代器失效规则。修改容器前应先查看对应规则，尤其是 `vector` 的扩容和中间插入。
:::
