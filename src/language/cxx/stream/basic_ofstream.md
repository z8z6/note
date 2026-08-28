---
cover: cpp
topic: "流与 I/O"
keywords:
  - "C++"
  - "流与 I/O"
  - "basic_ofstream"
---

# std::ofstream

`std::ofstream` 是文件输出流，默认使用 `std::ios::out`。资源由对象生命周期管理，但写入错误仍需显式检查。

## 写入文本

```cpp
#include <fstream>

std::ofstream output("report.txt");
if (!output) {
    throw std::runtime_error("无法创建 report.txt");
}

output << "status=" << 200 << '\n';
output.close();
if (!output) {
    throw std::runtime_error("写入或关闭文件失败");
}
```

析构函数不会把关闭失败以异常形式暴露出来。对于配置、数据库导出等关键文件，应显式 `close()` 并检查流状态。

## 打开模式

| 模式 | 含义 |
| --- | --- |
| `std::ios::out` | 输出 |
| `std::ios::app` | 每次写入都定位到末尾 |
| `std::ios::trunc` | 打开后截断原内容 |
| `std::ios::binary` | 二进制模式 |

```cpp
std::ofstream log("app.log", std::ios::app);
std::ofstream data("cache.bin", std::ios::binary | std::ios::trunc);
```

## 安全替换文件

重要文件可先写入同目录临时文件，确认 `flush`、`close` 成功后再用操作系统提供的原子重命名替换目标。仅调用 `flush()` 不等于数据已经持久化到物理设备。
