---
cover: cpp
date: 2025-04-09
topic: "C++ 基础"
keywords:
  - "C++"
  - "C++ 基础"
  - "C++ 知识库"
---

# C++ 知识库

这里记录 C++ 语言机制、对象生命周期、标准库实现与 I/O 模型。每篇笔记尽量同时回答三个问题：它解决什么问题、编译器或库如何实现、工程中容易在哪里出错。

## 学习路线

1. 从[类与对象](/language/cxx/oop/class)理解构造、析构和特殊成员函数。
2. 通过[右值引用](/language/cxx/0x/rvalue_ref)与[复制消除](/language/cxx/17/copy_elision)理解值类别和对象传递。
3. 学习 `unique_ptr`、`shared_ptr`、`weak_ptr`，建立清晰的所有权模型。
4. 从 [STL 导览](/language/cxx/stl/)进入容器、迭代器和算法。
5. 从[流体系](/language/cxx/stream/)理解格式状态、缓冲区与文件 I/O。

## 编译建议

```shell
g++ demo.cpp -std=c++20 -Wall -Wextra -Wpedantic -Og -g3 -o demo
```

学习语言规则时建议同时观察编译器诊断，并在 Compiler Explorer 或本地 `-S` 输出中查看生成代码。涉及未定义行为时，可开启 AddressSanitizer 与 UndefinedBehaviorSanitizer。

## 阅读约定

- 示例默认使用 C++20；特定版本特性会单独注明。
- “左值/右值”描述表达式类别，不等同于对象是否可修改。
- 复杂度结论遵循标准库接口保证，实际性能仍需结合数据布局和工作负载测量。
- 以 `std::` 开头的内部实现名称可能随标准库版本变化，不应在业务代码中依赖。

::: tip
遇到资源管理问题，先画出所有权和生命周期，再选择智能指针；不要从“用哪一种指针”倒推设计。
:::
