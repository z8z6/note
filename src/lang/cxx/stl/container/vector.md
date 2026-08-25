# std::vector

`std::vector<T>` 是动态长度的连续数组，也是大多数顺序数据的默认容器。它支持 O(1) 随机访问，尾部插入具有均摊 O(1) 复杂度。

## size 与 capacity

```cpp
std::vector<int> values;
values.reserve(80); // 只预留存储，不创建元素
values.resize(20);  // 改变元素数量
```

`size()` 是当前元素数，`capacity()` 是无需重新分配即可容纳的元素数。`reserve(n)` 只在 `n > capacity()` 时扩容；提前知道大致数量时可减少重分配。

## 迭代器失效

- 发生重新分配：所有迭代器、指针和引用失效。
- 未重新分配的尾部插入：`end()` 失效，既有元素引用保持有效。
- 中间插入或删除：操作位置及其后的迭代器、指针和引用失效。

```cpp
auto position = values.begin() + 2;
position = values.erase(position); // 使用返回的下一个有效位置
```

仅 `reserve` 足够容量不能让中间插入变安全，因为元素移动仍会使操作点后的引用失效。

## 添加元素

```cpp
values.push_back(42);

std::vector<Point> points;
points.emplace_back(1, 2); // 在尾部直接构造 Point
```

`emplace_back` 不是总比 `push_back` 快；已有对象时 `push_back(object)` 意图通常更明确。C++17 起 `emplace_back` 返回新元素引用。

## 删除与收缩

```cpp
std::erase_if(values, [](int value) { return value < 0; }); // C++20
values.shrink_to_fit(); // 非强制请求
```

`clear()` 删除元素但通常保留容量。`shrink_to_fit()` 不保证一定收缩；频繁收缩再增长会造成额外分配。

## data 与互操作

```cpp
consume(values.data(), values.size());
```

存储连续意味着可以与接收指针和长度的 C API 互操作。空 `vector` 的 `data()` 可以传递，但不能解引用。

## `vector<bool>` 特化

`vector<bool>` 是按位压缩的特化，`operator[]` 返回代理对象而不是 `bool&`。需要稳定引用或普通并发写语义时，应考虑 `vector<std::uint8_t>`；固定长度位集合可用 `std::bitset`。

::: tip
除非测量显示其他数据结构更合适，顺序数据优先使用 `vector`：连续布局通常带来更好的缓存局部性。
:::
