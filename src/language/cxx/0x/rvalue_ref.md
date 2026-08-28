---
cover: cpp
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "rvalue_ref"
---

# 右值引用与移动语义

右值引用写作 `T&&`，它允许程序识别即将结束生命周期的对象并转移其资源。移动不是自动“搬运内存”的魔法，而是由类型的移动构造与移动赋值定义。

## 值类别

- **左值**：具有可识别身份，通常可以取地址。
- **纯右值**：用于初始化对象或计算值的临时结果。
- **将亡值**：仍有身份，但资源可以被复用，例如 `std::move(value)` 的结果。

```cpp
std::string text = "PRTS";
std::string copy = text;            // 复制
std::string moved = std::move(text); // 移动
```

`std::move` 只做类型转换，不移动任何内容。移动发生在后续构造或赋值中。被移动对象仍然有效但状态未指定，可以析构或重新赋值。

## 移动构造函数

```cpp
class Buffer {
public:
    Buffer(Buffer&& other) noexcept
        : data_(std::exchange(other.data_, nullptr)),
          size_(std::exchange(other.size_, 0)) {}

private:
    std::byte* data_{};
    std::size_t size_{};
};
```

移动操作应维持双方对象的不变量。标记 `noexcept` 很重要：`vector` 扩容时，为保持强异常保证，通常只会在移动构造不抛异常时选择移动。

## 转发引用

模板推导上下文中的 `T&&` 可能是转发引用：

```cpp
template<class T>
void relay(T&& value) {
    consume(std::forward<T>(value));
}
```

`std::forward` 保留调用者传入表达式的值类别。普通的 `Widget&&` 参数不是转发引用。

## 返回值

```cpp
Widget make_widget() {
    Widget result;
    return result; // 优先 NRVO；否则隐式移动
}
```

返回局部对象时不要随意添加 `std::move`，它可能阻止 NRVO。移动迭代器则适合把一个区间的元素显式转移到另一个容器。
