# C++17 复制消除

复制消除允许对象直接在最终存储位置构造，从而省略中间对象的复制或移动。C++17 对部分纯右值场景给出了保证，而具名返回值优化（NRVO）仍是允许但不强制的优化。

## 强制消除的场景

```cpp
struct Point {
    Point(int, int);
    Point(const Point&) = delete;
    Point(Point&&) = delete;
};

Point make_point() {
    return Point{1, 2};
}

Point point = Point{1, 2};
```

C++17 中，上面的纯右值会直接初始化目标对象，即使复制和移动构造函数被删除也可以通过编译。严格说，这不是“创建临时对象后再消除”，而是纯右值直到需要时才实体化。

## NRVO

```cpp
Point make_point(bool debug) {
    Point result{1, 2};
    if (debug) inspect(result);
    return result;
}
```

返回具名局部变量时，编译器通常执行 NRVO，但标准不保证。若未执行，局部对象会优先被移动；不要写 `return std::move(result)`，它通常会阻止 NRVO。

## 多分支返回

```cpp
Point choose(bool first) {
    if (first) return Point{1, 2};
    return Point{3, 4};
}
```

每个分支都返回纯右值时仍能直接构造结果。若不同分支返回不同具名局部变量，则通常无法进行 NRVO。

::: tip
按值返回对象通常既清晰又高效。先写表达所有权的代码，再通过测量决定是否需要进一步优化。
:::
