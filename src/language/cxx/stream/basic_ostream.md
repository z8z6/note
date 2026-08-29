---
cover: cpp
date: 2025-04-20
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "basic_ostream"
---

# std::basic_ostream

`std::basic_ostream<CharT, Traits>` 提供格式化输出与原始字符输出。常用的 `std::ostream` 是其 `char` 特化。

## 格式化输出

```cpp
std::cout << "count=" << 42 << ' ' << std::hex << 255 << '\n';
```

`operator<<` 根据值类型执行格式化。宽度、精度、进制等状态保存在流对象中，其中多数设置会持续生效。

## 非格式化输出

```cpp
std::cout.put('A');
const char payload[] = {'A', '\0', 'B'};
std::cout.write(payload, sizeof payload);
```

`put` 写一个字符，`write` 写指定数量的字符，不把 `\0` 当作终止符。

## 缓冲与刷新

- `std::flush`：提交流缓冲区，不写换行。
- `std::endl`：写换行并刷新。
- `std::unitbuf`：让后续输出自动刷新。

普通日志或批量输出优先使用 `'\n'`，避免不必要的频繁刷新；交互式提示和关键阶段日志才需要显式刷新。

## sentry

每次格式化输出前构造 sentry 对象，用于检查状态、执行与绑定流相关的准备工作，并在结束时处理 `unitbuf`。自定义 `operator<<` 应将输出委托给已有操作，并返回原流以支持链式调用。

```cpp
std::ostream& operator<<(std::ostream& out, const Point& point) {
    return out << '(' << point.x << ", " << point.y << ')';
}
```
