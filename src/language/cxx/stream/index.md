---
cover: cpp
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "C++ 流体系导览"
---

# C++ 流体系导览

C++ I/O 以字符类型、字符特征和缓冲区为基础，通过状态位和格式标志提供统一的控制台、文件与字符串输入输出接口。

## 继承关系

```text
ios_base
  └─ basic_ios<CharT, Traits>
       ├─ basic_istream  ─┐
       ├─ basic_ostream  ─┼─ basic_iostream
       └─ 关联 basic_streambuf
```

常用别名 `std::istream`、`std::ostream` 分别是 `char` 特化；`std::ifstream`、`std::ofstream` 管理文件缓冲区；`std::stringstream` 在内存字符串上读写。

## 输入状态

```cpp
int value{};
while (std::cin >> value) {
    std::cout << value << '\n';
}

if (std::cin.eof()) {
    // 正常到达输入末尾
} else {
    // 格式错误或底层 I/O 错误
}
```

`goodbit` 表示正常，`eofbit` 表示到达末尾，`failbit` 表示格式提取失败，`badbit` 表示严重底层错误。清除状态后，还应处理导致失败的输入。

## 格式与性能

```cpp
#include <iomanip>

std::cout << std::fixed << std::setprecision(2) << 3.14159;
std::ios::sync_with_stdio(false);
std::cin.tie(nullptr);
```

关闭与 C stdio 的同步可提升大量文本 I/O 性能，但此后不应随意混用 `printf` 与 `cout`。解绑 `cin` 后，交互式提示需要主动 `flush`。

## RAII

文件流在析构时关闭文件。仍应在打开后检查状态，并在必须确认写入成功时显式调用 `close()` 后检查结果。
