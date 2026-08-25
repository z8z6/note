# std::weak_ptr

`std::weak_ptr<T>` 观察由 `shared_ptr` 管理的对象，但不增加强引用计数。它用于表达“可以访问，但不拥有”，并能打破循环所有权。

## 安全访问

```cpp
auto owner = std::make_shared<Point>();
std::weak_ptr<Point> observer = owner;

if (auto point = observer.lock()) {
    point->x = 42;
} else {
    // 对象已经销毁
}
```

不要先调用 `expired()` 再调用 `lock()`，因为并发环境中对象可能在两次调用之间销毁。直接检查 `lock()` 返回的 `shared_ptr` 是原子的“尝试取得所有权”。

## 打破循环引用

```cpp
struct Child;

struct Parent {
    std::shared_ptr<Child> child;
};

struct Child {
    std::weak_ptr<Parent> parent; // 反向关系不拥有 Parent
};
```

应根据领域语义决定哪一侧拥有对象，而不是机械地把任一侧改为 `weak_ptr`。树结构通常由父节点拥有子节点，子节点只观察父节点。

## 引用计数

控制块在强引用计数归零时销毁对象；只要仍有 `weak_ptr`，控制块本身可能继续存在。`use_count()` 适合诊断，不适合驱动业务逻辑，因为计数可能立即变化。

::: tip
若对象根本不需要共享所有权，优先使用值、引用或 `unique_ptr`。`weak_ptr` 只解决已有共享所有权中的非拥有观察问题。
:::
