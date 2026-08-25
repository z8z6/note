# std::ios_base

`std::ios_base` 保存与字符类型无关的流配置：格式标志、状态位、打开模式、定位方向和 locale。具体字符流通过 `basic_ios` 继承它。

## 状态位

```cpp
std::ios::iostate state = stream.rdstate();
if (state & std::ios::eofbit)  { /* 到达末尾 */ }
if (state & std::ios::failbit) { /* 格式提取失败 */ }
if (state & std::ios::badbit)  { /* 底层 I/O 错误 */ }
```

状态位可以组合。`goodbit` 的值为零，因此不能用按位与判断它，应使用 `good()` 或比较完整状态。

## 格式标志

```cpp
std::cout.setf(std::ios::showpos | std::ios::uppercase);
std::cout.setf(std::ios::hex, std::ios::basefield);
std::cout.unsetf(std::ios::uppercase);
```

`basefield`、`floatfield`、`adjustfield` 是互斥标志组。带掩码的 `setf(flag, mask)` 会先清除该组，再设置目标值。

## 保存与恢复格式

```cpp
const auto flags = std::cout.flags();
const auto precision = std::cout.precision();

std::cout << std::hex << std::showbase << 255;

std::cout.flags(flags);
std::cout.precision(precision);
```

库函数若临时改变调用方传入流的格式，应该在返回前恢复状态。工程中可用一个小型 RAII guard 自动完成恢复。

## sync_with_stdio

`std::ios_base::sync_with_stdio(false)` 可解除 C++ 流与 C stdio 的同步，通常在程序开始且尚未进行 I/O 时调用。解除后混用两套 I/O 的相对顺序不再可靠。
