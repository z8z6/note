---
cover: cpp
date: 2025-04-10
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "range_for"
---

# 范围 for 循环

范围 `for` 为数组、容器和自定义范围提供统一遍历语法。它依赖 `begin` 与 `end`，区间采用左闭右开形式。

## 基本写法

```cpp
for (const auto& item : items) {
    inspect(item);
}

for (auto& item : items) {
    item.reset();
}
```

小型标量可按值遍历；大型对象通常使用 `const auto&` 只读。使用 `auto&&` 可以兼容代理引用和特殊范围。

## 近似展开

```cpp
{
    auto&& range = items;
    auto first = begin(range);
    auto last = end(range);
    for (; first != last; ++first) {
        auto& item = *first;
        // 循环体
    }
}
```

实际规则随语言版本略有变化。数组的边界由编译器直接得知；类类型会查找成员 `begin/end`，否则通过参数依赖查找寻找自由函数。

```cpp
template<class T, std::size_t N>
constexpr T* begin(T (&array)[N]) noexcept { return array; }
```

数组引用保留了长度信息，避免形参退化为指针。

## 生命周期

C++23 扩展了范围初始化表达式中部分临时对象的生命周期，但链式调用中的中间引用仍可能悬空。复杂范围建议用初始化语句命名所有者：

```cpp
for (auto owner = make_items(); const auto& item : owner.values()) {
    inspect(item);
}
```

## 修改容器

循环期间插入或删除元素可能使迭代器失效。需要删除时优先使用 erase-remove、`std::erase_if`，或编写显式迭代器循环并接收 `erase` 返回的新位置。
