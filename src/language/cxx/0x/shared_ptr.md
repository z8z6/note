---
cover: cpp
date: 2025-04-12
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "shared_ptr"
---

# std::shared_ptr

`std::shared_ptr<T>` 表达共享所有权：最后一个强引用销毁时，对象由控制块中的删除器释放。它适合确实存在多个、生命周期彼此独立的所有者。

## 创建对象

```cpp
auto point = std::make_shared<Point>(1, 2);
```

`make_shared` 通常把控制块与对象放在一次分配中，异常安全且局部性更好。需要自定义删除器、管理已有资源或要求对象与控制块分开释放时，可使用指针构造函数。

```cpp
std::shared_ptr<FILE> file(std::fopen("data.txt", "r"), [](FILE* value) {
    if (value) std::fclose(value);
});
```

## 控制块与复制

复制 `shared_ptr` 会共享控制块。绝不能从同一个裸指针分别构造两个 `shared_ptr`，否则两个控制块会各自尝试删除对象。

```cpp
auto first = std::make_shared<Point>();
auto second = first; // 正确：共享控制块
```

## 别名构造

```cpp
auto owner = std::make_shared<Point>();
std::shared_ptr<int> x(owner, &owner->x);
```

别名指针观察成员 `x`，但与 `owner` 共享所有权。只要 `x` 存在，整个 `Point` 都不会销毁。

## enable_shared_from_this

```cpp
class Session : public std::enable_shared_from_this<Session> {
public:
    std::shared_ptr<Session> self() { return shared_from_this(); }
};
```

对象必须已经被 `shared_ptr` 管理后才能调用 `shared_from_this()`；构造函数中调用通常会抛出 `std::bad_weak_ptr`。不要返回 `std::shared_ptr<Session>(this)`，那会创建第二个控制块。

## 并发与循环

不同 `shared_ptr` 实例可以在不同线程增减同一控制块的引用计数，但同一个智能指针对象的并发读写仍需同步。C++20 可用 `std::atomic<std::shared_ptr<T>>` 发布共享快照。

循环所有权会阻止释放，应让非拥有方向使用 `weak_ptr`。引用计数也有原子操作成本，不应把 `shared_ptr` 当作默认指针。
