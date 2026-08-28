---
cover: cpp
topic: "类型与内存"
keywords:
  - "C++"
  - "类型与内存"
  - "type_traits"
---

# 类型特征 type_traits

类型特征在编译期查询或变换类型，是泛型编程、约束和底层优化的基础。标准接口位于 `<type_traits>`。

## 查询特征

```cpp
static_assert(std::is_integral_v<int>);
static_assert(std::is_same_v<std::remove_cv_t<const int>, int>);
static_assert(std::is_trivially_destructible_v<int>);
```

特征通常继承 `std::true_type` 或 `std::false_type`，因此同时提供 `::value`、布尔转换和类型身份。C++17 的 `_v` 变量模板能减少样板代码。

## 类型变换

```cpp
template<class T>
using Stored = std::remove_cvref_t<T>;

using Pointer = std::add_pointer_t<int>; // int*
```

变换特征通过成员 `type` 返回类型，`_t` 别名是更简洁的写法。

## 编译期分支

```cpp
template<class T>
void serialize(const T& value) {
    if constexpr (std::is_trivially_copyable_v<T>) {
        write_bytes(&value, sizeof value);
    } else {
        value.serialize();
    }
}
```

“可平凡复制”并不自动意味着字节表示适合跨平台持久化：填充字节、字节序和版本兼容仍需单独设计。

## 自定义特征

```cpp
template<class T>
struct is_message : std::false_type {};

template<>
struct is_message<LoginRequest> : std::true_type {};
```

除标准明确允许的特化点外，不要向 `std` 命名空间添加特化。现代接口可进一步使用 concept 表达约束，使编译错误更清晰。

::: warning
标准中的“trivial”“standard-layout”等概念有精确定义，不能简单等同于旧资料中的 POD。优先使用最贴近实际需求的具体特征。
:::
