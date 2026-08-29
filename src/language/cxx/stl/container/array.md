---
cover: cpp
date: 2025-04-20
topic: "STL · 容器"
keywords:
  - "C++"
  - "STL · 容器"
  - "array"
---

# std::array

`std::array<T, N>` 封装固定长度的连续数组。长度 `N` 是类型的一部分，因此 `array<int, 3>` 与 `array<int, 4>` 是不同类型。

## 初始化

```cpp
#include <array>

std::array<int, 4> values{10, 1, 2, 3};
std::array<int, 4> zeros{};
```

`std::array` 是聚合类型，没有接收 `initializer_list` 的构造函数。`{}` 会对未显式给出的元素进行值初始化。

## 访问与遍历

```cpp
values[0] = 42;          // 不检查边界
values.at(1) = 7;        // 越界时抛出 std::out_of_range
auto* data = values.data();

for (int value : values) {
    std::cout << value << '\n';
}
```

它提供 `size()`、`front()`、`back()`、迭代器和比较运算，因此能直接参与标准算法。

## 与 C 数组互操作

```cpp
void consume(const int* data, std::size_t size);
consume(values.data(), values.size());
```

若接口支持 C++20，优先接收 `std::span<const int>`，这样长度与指针能一起传递，同时兼容 `array`、`vector` 和 C 数组。

## 复杂度与失效

随机访问为 O(1)，交换需要逐元素操作 O(N)。对象生命周期内元素地址稳定，但移动整个 `array` 仍会逐元素移动；它不像 `vector` 那样只交换内部指针。

::: tip
大小在编译期确定且不需要扩容时使用 `std::array`；大小在运行期变化时使用 `std::vector`。
:::
