---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords:
  - "MOVAPS"
  - "SSE"
  - "XMM 寄存器"
  - "内存对齐"
---

<script setup>
const movapsLoadParts = [
  {
    text: 'MOVAPS',
    label: '指令助记符',
    kind: 'mnemonic',
    description: 'Move Aligned Packed Single-Precision Floating-Point Values，原样复制 128 位数据。'
  },
  {
    text: 'xmm0',
    label: '目标寄存器',
    kind: 'destination',
    description: '接收源 XMM 寄存器或 128 位内存中的全部位。'
  },
  {
    text: 'xmm1/m128',
    separator: ', ',
    label: '源操作数',
    kind: 'source',
    description: '可以是 XMM 寄存器；使用内存源时，地址必须按 16 字节对齐。'
  }
]

const movapsStoreParts = [
  {
    text: 'MOVAPS',
    label: '指令助记符',
    kind: 'mnemonic',
    description: '存储形式使用另一个操作码，但仍然原样复制 128 位。'
  },
  {
    text: 'xmm1/m128',
    label: '目标操作数',
    kind: 'destination',
    description: '可以是 XMM 寄存器或按 16 字节对齐的 128 位内存位置。'
  },
  {
    text: 'xmm0',
    separator: ', ',
    label: '源寄存器',
    kind: 'source',
    description: '提供要写入目标的全部 128 位。'
  }
]
</script>

# MOVAPS：对齐打包单精度数据移动

`MOVAPS` 是 SSE 的 128 位复制指令。它可以在两个 XMM 寄存器之间复制，也可以加载或存储 128 位内存；助记符中的 `PS` 描述预期的数据布局，但指令不会执行浮点运算或数值转换。

<InstructionSlots
  opcode="0F 28 /r"
  full-name="Move Aligned Packed Single-Precision Floating-Point Values"
  instruction-set="SSE"
  :parts="movapsLoadParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '763'
  }"
/>

<InstructionSlots
  opcode="0F 29 /r"
  full-name="Move Aligned Packed Single-Precision Floating-Point Values"
  instruction-set="SSE"
  :parts="movapsStoreParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '763'
  }"
/>

## 位复制与地址对齐

下图按“低 lane 到高 lane”的数组顺序直接绘制完整的 128 位数据。切换 `LOAD` / `STORE` 可以观察复制方向。

<RegisterOperation
  kind="movaps"
  register-label="xmm0"
  memory-label="m128"
/>

```text
load:  XMM_DEST[127:0] = SRC[127:0]
store: DEST[127:0]     = XMM_SRC[127:0]
```

只有操作数实际访问内存时才检查 16 字节对齐。`movaps xmm0, xmm1` 的两个操作数都是寄存器，不存在内存地址对齐问题；未对齐的 `m128` 源或目标会触发 `#GP`。

## 汇编示例

```asm
section .data
align 16
input:  dd 1.5, -2.0, 10.0, 0.25
output: times 4 dd 0.0

section .text
movaps xmm0, [input]     ; 0F 28：对齐加载
movaps [output], xmm0    ; 0F 29：对齐存储
```

`source` 与 `destination` 必须满足 16 字节对齐。普通 `new float[]` 或栈数组是否满足该条件取决于其声明和分配方式；需要时可使用 `alignas(16)`。

## 向量编码

| 形式 | 宽度 | 内存对齐 | 指令集 | 目标寄存器高位 |
| --- | ---: | ---: | --- | --- |
| `MOVAPS xmm, xmm/m128` | 128 位 | 16 字节 | SSE | XMM 以上对应位保持不变 |
| `VMOVAPS xmm, xmm/m128` | 128 位 | 16 字节 | AVX | 高于 128 位的对应目标位清零 |
| `VMOVAPS ymm, ymm/m256` | 256 位 | 32 字节 | AVX | 高于 256 位的对应目标位清零 |
| `VMOVAPS zmm, zmm/m512` | 512 位 | 64 字节 | AVX-512F / AVX10.1 | 写入完整 ZMM |

128/256 位 EVEX 形式还需要 `AVX-512VL`（或相应 AVX10 支持），并可使用写掩码。对未对齐的单精度内存，应改用 `MOVUPS` / `VMOVUPS`。

`MOVAPS` 不修改 EFLAGS，也不产生 SIMD 浮点异常。

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volume 2B](https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf)
