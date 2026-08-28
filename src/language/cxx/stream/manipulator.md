---
cover: cpp
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "manipulator"
---

# 流操纵器

操纵器是可以插入流表达式的函数或对象，用于改变格式或执行动作。流的 `operator<<` / `operator>>` 提供接收函数指针的重载。

## 无参数操纵器

```cpp
std::cout << "done" << std::endl;
```

`std::endl` 写入换行并刷新，概念上类似：

```cpp
template<class CharT, class Traits>
std::basic_ostream<CharT, Traits>&
endl(std::basic_ostream<CharT, Traits>& out) {
    return flush(out.put(out.widen('\n')));
}
```

由于参数依赖查找，即使写成 `endl(std::cout)`，编译器也能在 `std` 命名空间找到候选；实际代码仍建议明确使用 `std::endl`。

## 常用格式

```cpp
#include <iomanip>

std::cout << std::left << std::setw(10) << std::setfill('.') << "PRTS";
std::cout << std::fixed << std::setprecision(2) << 3.14159;
std::cout << std::hex << std::showbase << 255;
```

- `setw` 只影响下一次格式化字段。
- `setfill`、`left`、`fixed` 等会持续生效。
- `quoted` 可按带引号字符串写入和读取，适合包含空格的简单文本格式。

## 输入控制

```cpp
std::cin >> std::noskipws;
char ch{};
while (std::cin >> ch) {
    // 空白字符也会被提取
}
```

`skipws` / `noskipws` 控制格式化字符输入是否跳过前导空白，`std::ws` 则立即消费当前连续空白。

::: tip
一般输出换行用 `'\n'`；只有确实要求立即刷新时才使用 `std::endl`。
:::
