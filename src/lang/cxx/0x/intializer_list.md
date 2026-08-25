# std::initializer_list

`std::initializer_list<T>` 是对编译器生成的只读临时数组的轻量视图，使类可以接收花括号元素序列。

## 构造函数选择

```cpp
class Point {
public:
    Point(int x, int y);
    Point(std::initializer_list<int> values);
};

Point a(1, 2); // 调用 Point(int, int)
Point b{1, 2}; // 优先考虑 initializer_list 重载
```

列表初始化分两阶段进行重载决议：若存在可行的 `initializer_list` 构造函数，它通常优先。即使另一重载看起来转换更少，也可能不会被选择。

## 禁止窄化

```cpp
int a(3.14); // 允许，值被截断
int b{3.14}; // 编译错误：窄化转换
```

这是花括号初始化的重要优势，也意味着把现有 `()` 全部机械替换为 `{}` 可能改变重载结果或导致编译失败。

## 只读元素与生命周期

```cpp
void print(std::initializer_list<int> values) {
    for (int value : values) std::cout << value << ' ';
}
```

迭代器类型等价于 `const T*`，不能移动列表中的元素。临时数组的生命周期至少覆盖接收它的 `initializer_list` 对象，但把 `begin()` 指针保存到外部会产生悬空风险。

## 使用场景

```cpp
class Palette {
public:
    Palette(std::initializer_list<Color> colors)
        : colors_(colors) {}
private:
    std::vector<Color> colors_;
};
```

适合元素类型统一且数量可变的构造接口。若参数具有不同语义，例如宽、高、颜色，明确命名的构造函数或工厂函数通常更清晰。

::: warning
`std::vector<std::unique_ptr<T>>` 不能直接从 initializer_list 移动构造元素，因为列表元素是 `const`。
:::
