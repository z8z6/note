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

`ADDPD`（Add Packed Double-Precision Floating-Point Values）是 SSE2 指令。它把两个 128 位操作数分别看成两个 IEEE 754 双精度浮点数，对相同位置的元素执行加法，再将两项结果写回目标 XMM 寄存器。

<InstructionSlots
  title="66 0F 58 /r"
  instruction-set="SSE2"
  :parts="addpdParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/774492/325383-sdm-vol-2abcd.pdf',
    label: 'INTEL SDM'
  }"
/>

该形式采用 Intel 语法，元素布局为 2 × `float64`，且不影响 EFLAGS。内存形式可写成 `addpd xmm0, [values]`。

## 对应位置如何运算

下方组件按照寄存器的常见书写方式把高位放在左侧。默认每个小圆形代表 8 bits，亮度反映其中 `1` 的数量；下大括号将 128 位寄存器划分成两个 64 位 lane。可以修改两个寄存器中的数值，位模式和结果会同步更新。

<RegisterLaneOperation
  :left="[1.5, 10]"
  :right="[2.25, -4]"
  left-label="xmm0（原值）"
  right-label="xmm1（源）"
  result-label="xmm0（结果）"
  :bits-per-dot="8"
/>

其等价操作是：

```text
DEST[63:0]   = DEST[63:0]   + SRC[63:0]
DEST[127:64] = DEST[127:64] + SRC[127:64]
```

这里的“对应位置”是两个 **64 位元素（lane）**，而不是把 128 个二进制位分别相加。每条 lane 内部执行一次完整的浮点加法，符号位、指数位和尾数位会按 IEEE 754 规则共同参与结果计算。两条 lane 彼此独立，不会发生跨 lane 的进位或数据混合。

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

花括号在注释中按“高位在左、低位在右”书写；内存却按低地址到高地址依次存放 `1.5`、`10.0`。阅读 SIMD 代码时，这两种观察顺序很容易混淆。

对应的 C/C++ intrinsic 是：

```cpp
#include <emmintrin.h>

__m128d add_two_pairs(__m128d a, __m128d b) {
    return _mm_add_pd(a, b);
}
```

## 与相近指令的区别

| 指令 | 元素数 | 是否覆盖高位元素 | 操作数形式 |
| --- | ---: | --- | --- |
| `ADDPD xmm1, xmm2/m128` | 2 × `float64` | 是 | 两操作数，破坏性写回 |
| `ADDSD xmm1, xmm2/m64` | 1 × `float64` | 否，高 64 位保持不变 | 两操作数，破坏性写回 |
| `VADDPD xmm1, xmm2, xmm3/m128` | 2 × `float64` | 是 | 三操作数，目标与源分离 |
| `VADDPD ymm1, ymm2, ymm3/m256` | 4 × `float64` | 是 | AVX 256 位形式 |

传统 `ADDPD` 会覆盖第一个操作数。需要保留它时，应先复制寄存器，或在可用的平台上使用非破坏性的 `VADDPD`。

## 异常与内存注意事项

- 浮点舍入模式和异常屏蔽由 `MXCSR` 控制；可能产生无效操作、非规格化、溢出、下溢和精度异常。
- NaN、无穷大和有符号零遵循 SIMD 浮点规则，不能用普通整数加法的直觉解释其位模式。
- 传统 SSE 形式的 128 位内存操作数应按 16 字节对齐。数据可能未对齐时，可先用 `MOVUPD` 载入 XMM 寄存器，再执行寄存器形式的 `ADDPD`。
- 使用前应确认处理器支持 SSE2；x86-64 基线包含 SSE2，而 32 位 x86 不能一概假定支持。

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volume 2](https://cdrdv2-public.intel.com/774492/325383-sdm-vol-2abcd.pdf)
