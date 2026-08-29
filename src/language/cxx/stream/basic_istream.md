---
cover: cpp
date: 2025-04-20
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "basic_istream"
---

# std::basic_istream

`std::basic_istream<CharT, Traits>` 提供格式化提取和原始字符读取。`std::istream` 是面向 `char` 的常用别名。

## 格式化提取

```cpp
int id{};
std::string name;
if (std::cin >> id >> name) {
    use(id, name);
}
```

默认启用 `skipws`，提取前会跳过空白。遇到类型不匹配时设置 `failbit`，目标值在不同重载下可能保持不变或被置为边界值，应以流状态判断成功。

## 非格式化输入

- `get()`：读取一个字符，保留空白。
- `getline()`：读取到分隔符并丢弃分隔符。
- `peek()`：查看下一个字符但不提取。
- `ignore()`：跳过字符。
- `unget()` / `putback()`：尝试退回字符。

```cpp
int value{};
if (!(std::cin >> value)) {
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}
```

清除 `failbit` 只恢复流的可操作状态；还必须丢弃造成失败的输入，否则下一次提取会在同一字符处再次失败。

## sentry

格式化输入在真正读取前创建 sentry：检查流状态、刷新绑定的输出流，并按设置跳过前导空白。这个机制解释了为什么 `std::cin` 默认会在读取前刷新 `std::cout`。
