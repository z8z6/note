---
cover: cpp
topic: "现代 C++"
keywords:
  - "C++"
  - "现代 C++"
  - "decltype"
---

# decltype

`decltype(expression)` 在不执行表达式的情况下取得其类型，常用于泛型代码、尾置返回类型和精确保留引用属性。

## 两套规则

当参数是未加括号的变量名或成员访问时，`decltype` 得到该实体声明的类型；其他表达式则按值类别推导：左值得到 `T&`，将亡值得到 `T&&`，纯右值得到 `T`。

```cpp
int value = 0;
int& reference = value;

decltype(value) a = 1;        // int
decltype(reference) b = value; // int&
decltype((value)) c = value;  // int&，括号使它走表达式规则
decltype(value + 1) d = 2;    // int
```

## 泛型返回类型

```cpp
template<class Left, class Right>
auto multiply(Left left, Right right)
    -> decltype(left * right) {
    return left * right;
}
```

C++14 后也可让普通 `auto` 从返回表达式推导类型，但 `auto` 会丢弃顶层引用。需要完整保留表达式类型时使用 `decltype(auto)`。

```cpp
decltype(auto) element(std::vector<int>& values, std::size_t index) {
    return values[index]; // 返回 int&
}
```

## 表达式示例

```cpp
int i = 10;
decltype(++i) first = i; // int&，前置 ++ 返回左值
decltype(i++) second = 0; // int，后置 ++ 返回纯右值

int* pointer = &i;
decltype(*pointer) third = i; // int&
```

条件表达式的类型由两侧操作数共同决定，不宜只靠“其中是否有右值”判断。实际使用中可通过 `static_assert(std::is_same_v<...>)` 验证复杂推导。

::: warning
`decltype(auto)` 对括号敏感：返回局部变量时，`return (local);` 会推导为悬空引用。除非确实要保留引用，否则不要给返回表达式添加多余括号。
:::
