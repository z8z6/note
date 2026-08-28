---
cover: cpp
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "unique_ptr"
---

# std::unique_ptr

`std::unique_ptr<T>` 表达独占所有权：任意时刻只有一个智能指针负责释放资源。它体积小、可移动，通常是动态资源所有权的默认选择。

## 创建与转移

```cpp
auto point = std::make_unique<Point>(1, 2);
auto next = std::move(point);

assert(!point);
assert(next);
```

它不能复制，但可以移动。函数按值接收表示转移所有权，按 `const unique_ptr<T>&` 接收通常不如直接接收 `const T&` 清晰。

```cpp
std::unique_ptr<Point> create_point();
void consume(std::unique_ptr<Point> point);

auto point = create_point();
consume(std::move(point));
```

返回局部 `unique_ptr` 时可直接 `return point;`，编译器会执行复制消除或隐式移动。

## 作为类成员

```cpp
class Scene {
public:
    Scene() : root_(std::make_unique<Node>()) {}
private:
    std::unique_ptr<Node> root_;
};
```

RAII 会自动清理已经成功构造的成员。包含 `unique_ptr` 的类默认不可复制但可以移动；若需要复制，应实现明确的深复制语义。

## 数组与删除器

```cpp
auto bytes = std::make_unique<std::byte[]>(4096);

using File = std::unique_ptr<FILE, decltype(&std::fclose)>;
File file(std::fopen("data.txt", "r"), &std::fclose);
```

动态数组特化使用 `delete[]`，但多数可变长度数组仍应使用 `vector`。自定义删除器是指针类型的一部分，适合包装 C API 句柄。

## release、reset 与 get

- `get()`：只观察裸指针，不改变所有权。
- `reset(ptr)`：释放旧资源并接管新资源。
- `release()`：放弃所有权并返回裸指针，不会释放资源。

::: warning
`release()` 很容易造成泄漏，只应用于把所有权交给明确接管裸指针的旧接口。
:::
