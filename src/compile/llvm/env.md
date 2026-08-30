---
title: LLVM 环境配置与工具
cover: llvm
description: LLVM 的编译配置，以及相关工具的使用
date: 2026-08-29
topic: "LLVM"
keywords:
  - "LLVM"
  - "llvm"
---

# LLVM 配置

LLVM 是一个开源的编译器项目，它的特点在于架构设计做得很好，
在学习源码的过程中，你可以看到它对于各个架构，以及模块划分的很好，
组件式开发，且易于拓展；如果想要添加 Pass或者新的后端会很容易。
可以预料到，编译器的未来一定是 LLVM 框架主导的，所以必须充分掌握 LLVM 的基础设施，
尤其是自行编写的 C++ 拓展库。

Github仓库：[](https://githun.com/llvm-project)
文档：[](https://llvm.org)

## LLVM 编译

```shell
BUILD="/root/llvm/22.1.0"

cmake -S llvm -G "Ninja" -B ${BUILD} \
    -DLLVM_ENABLE_PROJECTS="llvm;mlir" \
    -DLLVM_TARGETS_TO_BUILD="X86;RISCV" \
    -DCMAKE_BUILD_TYPE="Debug"

cmake --build ${BUILD} --config Debug -j
```

在 llvm 项目的根目录下，运行上述命令

| cmake 参数              | 含义                   | 常见值            |
| ----------------------- | ---------------------- | ----------------- |
| `LLVM_ENABLE_PROJECTS`  | 需要编译的 llvm 子项目 | llvm, mlir，clang |
| `LLVM_TARGETS_TO_BUILD` | 面向的后端架构         | X86, RISCV        |
| CMAKE_BUILD_TYPE        | 编译模式               | Debug, Release    |

llvm的编译最少需要 30G 内存，内存越大，编译速度越快，
在1T内存的服务器上编译，大概需要3-5分钟；在32G的笔记本中编译，大概需要30分钟。
由此可见，内存对于编译速度的影响非常大，这也影响了在某些性能较差的硬件平台上使用 llvm，
此时需要提前编译好。

llvm在编译时首先会运行 tablegen, 生成一系列指令的C++头文件，枚举值等。
这些文件位于 build目录下，不在源码树中，需要额外查找。

## LLVM 工具

LLVM 的工具位于build/bin目录下。

### opt

opt就是llvm核心库本身，包含了编译相关的一系列文件,
执行-h命令可以查看其支持的命令，有很多参数可以使用。

```shell
opt -h
```

### llc

llc 是面向 LLVM IR的编译器，它只接受 IR 层级的输入，最后输出特定架构的二进制代码。
输入的IR格式可以是.ll文本，或者.bc二进制化的IR。

| llc 参数 | 含义                     | 常见值                                              |
| -------- | ------------------------ | --------------------------------------------------- |
| -march   | 指令集架构               | x86-64, riscv64                                     |
| -mcpu    | 特定CPU                  | skylake                                             |
| -mtriple | 使用 triple 指定目标环境 | x86_64-unknown-linux-gnu, riscv64-unknown-linux-gnu |
| -mattr | 开启或关闭某些指令集 | +avx512f，-avx2 |

```shell
llc test.ll -march=riscv64 -mattr=+m,+a,+f,+d,+c
```

- 查看支持哪些CPU

```shell
llc -march=x86-64 -mcpu=help
```

- debug pass

```shell
llc -debug-pass=Structure test.ll
```


### llvm-mca

llvm-mac是用来模拟测算某个指令的执行时间和周期的，
其分析质量取决于 LLVM 中这个 CPU 是否有准确的 scheduling model，它并不是在真正的 CPU 上执行。

### llvm-exegesis

llvm-exegesis是验证llvm-mca的工具。
对于某条指令，它会生成测试用例，然后使用JIT在硬件上执行，测算相关数据。