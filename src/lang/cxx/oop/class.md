# C++ 类与对象

类把数据、不变量和操作组合成一个类型。良好的类应让有效状态容易构造，让资源随对象生命周期自动获得和释放。

## 封装与构造

```cpp
class Point {
public:
    Point(double x, double y) : x_(x), y_(y) {}

    [[nodiscard]] double x() const noexcept { return x_; }
    [[nodiscard]] double y() const noexcept { return y_; }

    void translate(double dx, double dy) noexcept {
        x_ += dx;
        y_ += dy;
    }

private:
    double x_{};
    double y_{};
};
```

成员按声明顺序初始化，而不是按初始化列表的书写顺序。需要维持不变量时，应在构造完成前验证参数。

## 特殊成员函数

编译器可能生成默认构造、析构、复制构造、复制赋值、移动构造和移动赋值。是否自动生成以及是否被删除，取决于成员与用户声明的特殊成员。

### Rule of Zero

```cpp
class Document {
    std::string title_;
    std::vector<std::string> lines_;
};
```

成员都能自行管理资源时，不写任何特殊成员函数通常最好。这称为 Rule of Zero。

### 独占资源

```cpp
class Buffer {
public:
    explicit Buffer(std::size_t size)
        : data_(std::make_unique<std::byte[]>(size)), size_(size) {}

    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;
    Buffer(Buffer&&) noexcept = default;
    Buffer& operator=(Buffer&&) noexcept = default;

private:
    std::unique_ptr<std::byte[]> data_;
    std::size_t size_{};
};
```

显式删除复制并默认移动，能准确表达独占所有权。若确实需要复制，应定义深复制，而不是让两个对象管理同一裸指针。

## const 与引用限定

```cpp
class Text {
public:
    const std::string& value() const & { return value_; }
    std::string value() && { return std::move(value_); }
private:
    std::string value_;
};
```

`const` 成员函数不能修改普通成员；引用限定符还能区分对象是左值还是右值，避免从临时对象返回悬空引用。

## 多态

```cpp
class Operator {
public:
    virtual ~Operator() = default;
    virtual void execute() = 0;
};
```

需要通过基类指针删除派生对象时，基类析构函数必须是虚函数。组合通常比继承更灵活；只有明确存在“is-a”关系和运行时替换需求时才采用动态多态。

::: tip
先让成员类型承担资源管理，再设计类的不变量。能使用默认特殊成员函数时，就不要手写复制、移动和析构逻辑。
:::
