---
cover: i386
date: 2026-08-29
topic: "汇编与系统"
keywords:
  - "ADDPD"
  - "SSE2"
  - "XMM 寄存器"
  - "SIMD 双精度浮点"
---

<script setup>
const addpdParts = [
  {
    text: 'ADDPD',
    label: '指令助记符',
    kind: 'mnemonic',
    description: 'Add Packed Double-Precision Floating-Point Values，对两个打包的双精度浮点元素执行加法。'
  },
  {
    text: 'xmm0',
    label: '目标与第一源操作数',
    kind: 'destination',
    description: '保存第一个 128 位操作数；运算完成后，其原值被两个结果覆盖。'
  },
  {
    text: 'xmm1/m128',
    separator: ', ',
    label: '第二源操作数',
    kind: 'source',
    description: '可以是 XMM 寄存器，也可以是包含两个 float64 元素的 128 位内存操作数。'
  }
]
</script>

# ADDPD：打包双精度浮点加法

`ADDPD`（Add Packed Double-Precision Floating-Point Values）是 SSE2 指令。
它把两个 128 位操作数分别看成两个 IEEE 754 双精度浮点数，对相同位置的元素执行加法，再将两项结果写回目标 XMM 寄存器。

<InstructionSlots
  opcode="66 0F 58 /r"
  full-name="Add Packed Double-Precision Floating-Point Values"
  instruction-set="SSE2"
  :parts="addpdParts"
  :reference="{
    href: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    label: 'INTEL SDM',
    page: '137'
  }"
/>

<RegisterOperation
  kind="addpd"
  left-label="xmm0（原值）"
  right-label="xmm1（源）"
  result-label="xmm0（结果）"
/>

其等价操作是：

```text
DEST[63:0]   = DEST[63:0]   + SRC[63:0]
DEST[127:64] = DEST[127:64] + SRC[127:64]
```

## 注意点

### lane独立性

对应位置是两个 **64 位元素（lane）**，而不是把 128 个二进制位分别相加。
每条 lane 内部执行一次完整的浮点加法，符号位、指数位和尾数位会按 IEEE 754 规则共同参与结果计算。
两条 lane 彼此独立，不会发生跨 lane 的进位。

### 内存对齐

addpd如果使用内存操作数，必须是16字节对齐，否则会触发异常。
但是 vaddpd 的内存操作数不需要对齐！

数据可能未对齐时，可先用 `MOVUPD` 载入 XMM 寄存器，再执行寄存器形式的 `ADDPD`。

### 标志位

只会更新 MXCSR。
浮点指令不会更新 RFLAGS 标志位。

## 衍生指令

| 指令前缀 | 指令名 | 指令集  | 特点                       |
| -------- | ------ | ------- | -------------------------- |
| VEX      | VADDPD | AVX     | 256 位，支持三个独立操作数 |
| EVEX     | VADDPD | AVX512F | 512位，支持掩码和64位广播  |

## 一个可运行的例子

下面使用 Intel 语法。内存中的低地址元素进入 XMM 寄存器的低 64 位：

```asm
section .data
align 16
a: dq 1.5, 10.0
b: dq 2.25, -4.0

section .text
movapd xmm0, [a]       ; xmm0 = { 10.0, 1.5 }
addpd  xmm0, [b]       ; xmm0 = {  6.0, 3.75 }
```

花括号在注释中按“高位在左、低位在右”书写；内存却按低地址到高地址依次存放 `1.5`、`10.0`。
阅读 SIMD 代码时，这两种观察顺序很容易混淆。
