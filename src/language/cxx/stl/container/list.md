---
cover: cpp
topic: "STL · 容器"
keywords:
  - "C++"
  - "STL · 容器"
  - "list"
---

# std::list

`std::list` 是双向链表。已知迭代器位置时，插入和删除为 O(1)，并且操作其他节点不会使已有迭代器、指针和引用失效。

## 基本操作

```cpp
#include <list>

std::list<int> values{1, 3, 4};
auto position = std::next(values.begin());
values.insert(position, 2);
values.erase(std::prev(values.end()));
```

它不支持 `operator[]`，移动到第 n 个元素需要 O(n)。若主要需求是随机访问和顺序遍历，应使用 `vector`。

## 链表专用算法

```cpp
values.sort();
values.unique();
values.remove_if([](int value) { return value < 0; });
```

通用 `std::sort` 要求随机访问迭代器，不能用于 `list`；成员函数 `sort` 会重新链接节点。

## splice

```cpp
std::list<int> ready{1, 2};
std::list<int> waiting{3, 4};
ready.splice(ready.end(), waiting, waiting.begin());
```

`splice` 在分配器兼容时只改变链接，不移动或复制元素。被转移元素的引用、指针和迭代器保持有效。

## 失效规则

插入不会使迭代器失效；删除只使指向被删元素的迭代器失效。`clear()` 会使所有元素迭代器失效，`end()` 仍可重新获取。

::: warning
O(1) 插删不等于整体更快。查找插入位置仍需 O(n)，节点分配与缓存未命中也可能主导性能。
:::
