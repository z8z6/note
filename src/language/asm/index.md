---
cover: asm
date: 2025-04-09
topic: "汇编与系统"
keywords:
  - "Assembly"
  - "汇编与系统"
  - "汇编语言导览"
---

<script setup>
const evexVaddpd = [
  { text: 'EVEX', label: '编码前缀', kind: 'prefix', description: '选择 EVEX 编码形式，使指令可以使用掩码、零化等扩展能力。' },
  { text: 'v', separator: '.', label: '向量形式', kind: 'mnemonic', description: '表示 VEX/EVEX 编码的非破坏性向量指令形式。' },
  { text: 'add', separator: '', label: '加法操作', kind: 'operation', description: '对对应位置的元素执行加法。' },
  {
    text: 'p', separator: '', label: '数据排列', kind: 'shape',
    values: [
      { value: 'p', description: 'packed：一次处理多个元素' },
      { value: 's', description: 'scalar：只处理最低位元素' }
    ]
  },
  {
    text: 'd', separator: '', label: '元素精度', kind: 'type',
    values: [
      { value: 'd', description: 'double：64 位双精度浮点数' },
      { value: 's', description: 'single：32 位单精度浮点数' }
    ]
  },
  { text: '{k}', separator: '', label: '写掩码', kind: 'modifier', description: '由操作掩码寄存器控制哪些目标元素会被写入。' },
  { text: '{z}', separator: '', label: '零化策略', kind: 'modifier', description: '未通过掩码的目标元素写零；省略时采用合并策略。' },
  { text: 'xmm0', label: '目标操作数', kind: 'destination', description: '接收运算结果的 128 位向量寄存器。' },
  { text: 'xmm1', label: '第一源操作数', kind: 'source', description: '提供第一组待相加的双精度浮点元素。' },
  { text: 'xmm2', label: '第二源操作数', kind: 'source', description: '提供第二组待相加的双精度浮点元素。' }
]
</script>

# 汇编语言导览

汇编语言是机器指令的文本表示。学习它的目标通常不是手写完整应用，而是理解 ABI、调用约定、栈帧、编译器生成代码和底层性能行为。

## 从源代码到指令

```text
C/C++ 源码 → 预处理 → 汇编 → 目标文件 → 链接 → 可执行文件
```

可以让编译器保留可读汇编：

```shell
gcc -O2 -S -masm=intel demo.c -o demo.s
objdump -d -Mintel ./demo
```

## 核心概念

- **寄存器**：CPU 内部的高速存储位置。
- **内存寻址**：通过基址、索引、比例和偏移计算地址。
- **栈**：保存返回地址、局部变量以及部分函数参数。
- **标志位**：记录算术结果，供条件跳转使用。
- **ABI**：规定参数传递、返回值、寄存器保存责任与数据布局。

## 指令槽位

较长的指令语法可以拆成若干语义槽位，助记符内部也能继续按字母分段。将鼠标移到片段或释义上，或用键盘聚焦片段，可以看到二者的对应关系。

<InstructionSlots
  opcode="EVEX VECTOR ADD"
  full-name="Vector Add Packed Double-Precision Floating-Point Values"
  :parts="evexVaddpd"
/>

## 一个最小示例

```asm
; Intel 语法：计算 eax = edi + esi
add_two:
    mov eax, edi
    add eax, esi
    ret
```

在 x86-64 System V ABI 中，前两个整数参数通常位于 `edi`、`esi`，返回值放在 `eax`。不同平台的调用约定可能不同，阅读反汇编时必须先确认目标架构和 ABI。

## 建议路线

先掌握十六进制、补码和位运算，再学习寄存器与寻址，随后观察简单 C 函数在 `-O0` 和 `-O2` 下的差异。调试时可使用 GDB 的 `disassemble`、`info registers` 和 `x` 命令。
