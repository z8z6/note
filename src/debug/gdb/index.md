# gdb

gbd是目前最好的调试工具，基本适用于任何场景

## 常用命令

| 命令 | 含义       |
| ---- | ---------- |
| si   | 指令级单步 |
| s   | 代码级单步 |
| n   | 代码函数级单步 |
| b   | 断点 |
| bt   | 查看调用栈 |
| disas main   | 反汇编函数 |
| disas $pc-32, $pc+32   | 反汇编指定地址 |

- 可视化窗口

```gdb
set disassembly-flavor intel
layout split
```