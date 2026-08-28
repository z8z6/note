---
cover: cpp
topic: "STL · 迭代器"
keywords:
  - "C++"
  - "STL · 迭代器"
  - "iterator"
---

# 迭代器与 iterator_traits

迭代器把“如何访问元素”从算法中抽离。算法处理 `[first, last)` 区间，因此同一实现可以服务数组、容器和自定义数据结构。

## 基本类型信息

`std::iterator_traits<I>` 为迭代器提供统一接口：

- `value_type`：元素值类型。
- `difference_type`：迭代器距离类型。
- `pointer` / `reference`：指针与引用类型。
- `iterator_category`：传统迭代器类别。

原始指针有对应特化，因此 `int*` 可以直接参与标准算法。

```cpp
template<class Iterator>
using value_t = typename std::iterator_traits<Iterator>::value_type;
```

## 迭代器类别

| 类别 | 核心能力 | 示例 |
| --- | --- | --- |
| 输入 | 单遍读取、`++` | `istream_iterator` |
| 输出 | 单遍写入、`++` | `ostream_iterator` |
| 前向 | 多遍读取 | `forward_list` |
| 双向 | 再增加 `--` | `list` |
| 随机访问 | 再增加 `+n`、距离、比较 | `vector` |
| 连续（C++20） | 元素物理连续 | `array`、`vector` |

算法可以根据类别选择不同复杂度的实现。例如 `std::advance` 对随机访问迭代器直接执行 `+= n`，对输入迭代器只能逐次递增。

## 使用

```cpp
auto found = std::find(values.begin(), values.end(), target);
if (found != values.end()) {
    std::cout << *found;
}
```

永远不要解引用尾后迭代器。两个迭代器通常必须来自同一范围，才能进行距离和顺序比较。

## 自定义迭代器

C++20 更强调 concept（如 `std::input_iterator`）与操作语义，而不只依赖 category 标签。实现自定义迭代器时，除了提供类型别名和运算符，还必须满足多遍保证、复杂度及引用稳定性等语义要求。

## 失效

迭代器只是访问句柄，其有效性由容器决定。扩容、插入、删除和交换可能使其失效；失效后即使地址看似未变，继续使用也属于未定义行为。

::: tip
修改容器后优先使用操作返回的新迭代器，并缩短迭代器变量的生命周期，能显著减少失效问题。
:::
