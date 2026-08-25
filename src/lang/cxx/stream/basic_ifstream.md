# std::ifstream

`std::ifstream` 是面向文件的输入流，默认以 `std::ios::in` 打开文件，并通过 RAII 在析构时关闭资源。

## 文本读取

```cpp
#include <fstream>
#include <string>

std::ifstream input("config.txt");
if (!input) {
    throw std::runtime_error("无法打开 config.txt");
}

for (std::string line; std::getline(input, line);) {
    process(line);
}

if (!input.eof()) {
    throw std::runtime_error("读取过程中发生错误");
}
```

不要写成 `while (!input.eof())`：末尾状态只有在一次读取尝试失败后才会设置。应始终以读取操作本身作为循环条件。

## 二进制读取

```cpp
std::ifstream input("image.bin", std::ios::binary | std::ios::ate);
if (!input) return;

const auto end = input.tellg();
input.seekg(0, std::ios::beg);
std::vector<char> bytes(static_cast<std::size_t>(end));
input.read(bytes.data(), static_cast<std::streamsize>(bytes.size()));
```

`binary` 可避免部分平台对换行等字节进行文本转换。读取前要检查 `tellg()` 是否失败，并为超大文件验证长度是否能安全转换。

## 定位与异常

`seekg` 设置读取位置，`tellg` 查询位置。默认情况下失败通过状态位报告；也可以设置 `exceptions(failbit | badbit)` 改为抛出 `std::ios_base::failure`。
