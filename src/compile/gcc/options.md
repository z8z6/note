---
cover: gcc
topic: "编译工具链"
keywords:
  - "GCC"
  - "编译工具链"
  - "options"
---

# GCC 常用选项

GCC 的命令行通常由“语言标准、诊断、优化、调试、链接”五部分组成。开发阶段建议开启严格诊断并保留调试信息，发布阶段再切换优化级别。

## 基础编译

```shell
gcc main.c -std=c17 -o app
g++ main.cpp -std=c++20 -o app
```

`-c` 只生成目标文件，`-o` 指定输出，`-I` 增加头文件目录，`-L` 与 `-l` 分别增加库目录和链接库。

```shell
g++ -Iinclude -c src/main.cpp -o build/main.o
g++ build/main.o -Llib -lmath -o build/app
```

## 警告与诊断

```shell
g++ main.cpp -Wall -Wextra -Wpedantic -Wconversion -Wshadow
```

- `-Wall`：常见且高价值的警告。
- `-Wextra`：补充参数、符号比较等检查。
- `-Wpedantic`：报告不符合所选语言标准的扩展。
- `-Werror`：把警告当作错误，适合 CI，不建议盲目用于第三方代码。

## 调试、优化与 Sanitizer

```shell
# 本地调试
g++ main.cpp -Og -g3 -fno-omit-frame-pointer -o app

# 内存与未定义行为检查
g++ main.cpp -O1 -g -fsanitize=address,undefined -fno-omit-frame-pointer -o app

# 发布构建
g++ main.cpp -O2 -DNDEBUG -o app
```

`-O0` 最接近源码，`-Og` 兼顾调试和基础优化，`-O2` 通常是稳妥的发布选择。`-O3` 可能增大体积，应该用基准测试决定是否启用。

::: warning
Sanitizer 会改变内存布局和执行时序，适合发现问题，但不能代替发布配置下的测试。
:::

## 排查命令

```shell
g++ -E main.cpp -o main.ii       # 仅预处理
g++ -S main.cpp -o main.s        # 生成汇编
g++ -v main.cpp -o app           # 显示完整工具链过程
g++ -MMD -MP -c main.cpp         # 生成 Make 依赖文件
```

推荐的日常组合是 `-std=c++20 -Wall -Wextra -Wpedantic -Og -g3`，再由构建系统分别维护调试与发布参数。
