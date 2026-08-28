---
cover: cpp
topic: "STL · 适配器"
keywords:
  - "C++"
  - "STL · 适配器"
  - "functor"
---

# 函数对象与适配器

函数对象（functor）是重载了 `operator()` 的对象。与普通函数相比，它可以携带状态；与虚函数相比，它通常能被编译器内联。

## 基本形式

```cpp
struct GreaterThan {
    int threshold;

    bool operator()(int value) const {
        return value > threshold;
    }
};

auto count = std::ranges::count_if(values, GreaterThan{10});
```

无状态 Lambda 通常是最简洁的写法；需要复用、命名或复杂状态时，自定义函数对象更合适。

## 标准函数对象

`<functional>` 提供 `std::plus<>`、`std::less<>`、`std::logical_not<>` 等透明函数对象。空模板参数允许它们从实参推导类型。

```cpp
std::sort(values.begin(), values.end(), std::greater<>{});
int total = std::accumulate(values.begin(), values.end(), 0, std::plus<>{});
```

## std::function 与 std::bind

`std::function<R(Args...)>` 可以擦除具体可调用对象类型，适合回调存储和接口边界，但可能带来间接调用与动态分配成本。

```cpp
std::function<int(int)> transform = [offset = 3](int value) {
    return value + offset;
};
```

现代代码通常优先 Lambda，而不是 `std::bind`；Lambda 的参数、捕获和返回类型更直观。

::: tip
若函数只需立即调用回调，优先使用模板参数接收可调用对象；只有需要长期存储或类型擦除时再使用 `std::function`。
:::
