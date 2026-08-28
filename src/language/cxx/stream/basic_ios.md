---
cover: cpp
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "basic_ios"
---

# std::basic_ios

`std::basic_ios<CharT, Traits>` 位于 `ios_base` 与具体输入输出流之间，负责流缓冲区指针、状态检查、填充字符和绑定流。

```cpp
template<class CharT, class Traits>
class basic_ios : public ios_base;
```

## 状态查询

| 函数 | 条件 |
| --- | --- |
| `good()` | 没有设置任何错误位 |
| `eof()` | 设置了 `eofbit` |
| `fail()` | 设置了 `failbit` 或 `badbit` |
| `bad()` | 设置了 `badbit` |
| `operator bool()` | 等价于 `!fail()` |

```cpp
if (stream) {
    // 上一次流操作没有进入失败状态
}
```

到达 EOF 不一定意味着本次读取失败。例如恰好读完最后一个值时可能同时得到有效值并设置 `eofbit`。

## clear 与 setstate

```cpp
stream.clear();                    // 恢复为 goodbit
stream.setstate(std::ios::failbit); // 追加状态位
```

`clear(state)` 会替换状态，`setstate(state)` 会追加状态。恢复输入流后通常还需处理缓冲区中导致错误的字符。

## 异常掩码

```cpp
stream.exceptions(std::ios::badbit);
```

当被掩码选中的状态位被设置时，会抛出 `std::ios_base::failure`。常见策略是只对 `badbit` 抛异常，把可恢复的格式错误留给显式分支处理。

## 其他成员

`rdbuf()` 访问关联缓冲区，`tie()` 管理读取前需刷新的输出流，`fill()` 设置宽度不足时的填充字符，`widen()` / `narrow()` 借助 locale 转换字符。
