---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords:
  - "MOVAPD"
  - "SSE2"
  - "XMM 寄存器"
  - "内存对齐"
---

<script setup>
const movapdLoadParts = [
  {
    text: 'MOVAPD',
    label: '指令助记符',
    kind: 'mnemonic',
    description: 'Move Aligned Packed Double-Precision Floating-Point Values，原样复制 128 位数据。'
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

const movapdStoreParts = [
  {
    text: 'MOVAPD',
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

# MOVAPD：对齐打包双精度数据移动

`MOVAPD` 是 SSE2 的 128 位复制指令，通常把一个 XMM 寄存器理解成两个 `float64`。它不会解析或改变浮点值，因此同样可以原样搬运任意 128 位位模式。

<InstructionSlots
  opcode="66 0F 28 /r"
  full-name="Move Aligned Packed Double-Precision Floating-Point Values"
  instruction-set="SSE2"
  :parts="movapdLoadParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '759'
  }"
/>

<InstructionSlots
  opcode="66 0F 29 /r"
  full-name="Move Aligned Packed Double-Precision Floating-Point Values"
  instruction-set="SSE2"
  :parts="movapdStoreParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '759'
  }"
/>

## 位复制与地址对齐

传统 `MOVAPD` 访问内存时要求 16 字节对齐。图中的两个 64 位 lane 只是便于阅读的分组；复制本身以完整的 128 位位模式为准。

<RegisterOperation
  kind="movapd"
  register-label="xmm0"
  memory-label="m128"
/>

```text
load:  XMM_DEST[127:0] = SRC[127:0]
store: DEST[127:0]     = XMM_SRC[127:0]
```

寄存器到寄存器的形式不检查地址对齐。内存源或内存目标不是 16 字节对齐时，传统 `MOVAPD` 会触发 `#GP`；需要接受非对齐地址时使用 `MOVUPD`。

## 汇编示例

```asm
section .data
align 16
input:  dq 1.5, -2.0
output: times 2 dq 0.0

section .text
movapd xmm0, [input]     ; 66 0F 28：对齐加载
movapd [output], xmm0    ; 66 0F 29：对齐存储
```

两个指针都必须满足 16 字节对齐；数组可使用 `alignas(16)` 明确声明该约束。

## 向量编码

| 形式 | 宽度 | 内存对齐 | 指令集 | 目标寄存器高位 |
| --- | ---: | ---: | --- | --- |
| `MOVAPD xmm, xmm/m128` | 128 位 | 16 字节 | SSE2 | XMM 以上对应位保持不变 |
| `VMOVAPD xmm, xmm/m128` | 128 位 | 16 字节 | AVX | 高于 128 位的对应目标位清零 |
| `VMOVAPD ymm, ymm/m256` | 256 位 | 32 字节 | AVX | 高于 256 位的对应目标位清零 |
| `VMOVAPD zmm, zmm/m512` | 512 位 | 64 字节 | AVX-512F / AVX10.1 | 写入完整 ZMM |

128/256 位 EVEX 形式还需要 `AVX-512VL`（或相应 AVX10 支持），并可使用写掩码。对齐要求随内存操作数宽度增加，不应把传统 XMM 形式的 16 字节规则套到 YMM 或 ZMM。

`MOVAPD` 不修改 EFLAGS，也不产生 SIMD 浮点异常。

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volume 2B](https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf)
