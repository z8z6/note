---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords:
  - "MOVUPD"
  - "SSE2"
  - "XMM 寄存器"
  - "非对齐内存"
---

<script setup>
const movupdLoadParts = [
  {
    text: 'MOVUPD',
    label: '指令助记符',
    kind: 'mnemonic',
    description: 'Move Unaligned Packed Double-Precision Floating-Point Values，从寄存器或任意字节边界复制 128 位。'
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
    description: '内存源不必位于 16 字节边界。'
  }
]

const movupdStoreParts = [
  {
    text: 'MOVUPD',
    label: '指令助记符',
    kind: 'mnemonic',
    description: '存储形式将 XMM 寄存器中的 128 位原样写入寄存器或内存目标。'
  },
  {
    text: 'xmm1/m128',
    label: '目标操作数',
    kind: 'destination',
    description: '内存目标不必位于 16 字节边界。'
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

# MOVUPD：非对齐打包双精度数据移动

`MOVUPD` 是 SSE2 的非对齐 128 位复制指令。它与 `MOVAPD` 搬运相同数量的数据，但内存操作数可以从非 16 字节边界开始。

<InstructionSlots
  opcode="66 0F 10 /r"
  full-name="Move Unaligned Packed Double-Precision Floating-Point Values"
  instruction-set="SSE2"
  :parts="movupdLoadParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '4-123'
  }"
/>

<InstructionSlots
  opcode="66 0F 11 /r"
  full-name="Move Unaligned Packed Double-Precision Floating-Point Values"
  instruction-set="SSE2"
  :parts="movupdStoreParts"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf',
    label: 'INTEL SDM',
    page: '4-123'
  }"
/>

## 非对齐访问

下图直接绘制完整的 128 位数据。`MOVUPD` 允许内存地址不满足 16 字节对齐；`LOAD` 与 `STORE` 只改变复制方向。

<RegisterOperation
  kind="movupd"
  register-label="xmm0"
  memory-label="m128"
/>

```text
load:  XMM_DEST[127:0] = SRC[127:0]
store: DEST[127:0]     = XMM_SRC[127:0]
```

“允许非对齐”只表示不会因为地址不是 16 字节倍数而产生 `MOVAPD` 的对齐 `#GP`。地址仍须有效并具有相应访问权限，跨越未映射页面时仍可能发生页故障。

## 汇编示例

```asm
section .data
align 16
storage:      db 0
unaligned_pd: dq 1.5, -2.0
output:       times 32 db 0

section .text
movupd xmm0, [unaligned_pd]  ; 66 0F 10：地址可以非 16 字节对齐
movupd [output + 3], xmm0    ; 66 0F 11：非对齐存储
```

这两个内存操作数不要求地址按 16 字节对齐。在部分微架构上，跨越缓存行或页面边界的非对齐访问可能比单一边界内的访问代价更高。

## 与 MOVAPD 的区别

| 指令 | 传统 XMM 内存宽度 | 16 字节对齐要求 | 加载操作码 | 存储操作码 |
| --- | ---: | --- | --- | --- |
| `MOVAPD` | 128 位 | 必须 | `66 0F 28 /r` | `66 0F 29 /r` |
| `MOVUPD` | 128 位 | 不要求 | `66 0F 10 /r` | `66 0F 11 /r` |

两者用于寄存器到寄存器复制时，得到的 128 位结果相同。VEX 形式 `VMOVUPD` 支持 XMM/YMM，EVEX 形式还支持 ZMM 和写掩码；VEX/EVEX 写入 XMM 或 YMM 目标时会清零对应目标寄存器的更高位。

`MOVUPD` 不修改 EFLAGS，也不产生 SIMD 浮点异常。

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual, Volume 2B](https://cdrdv2-public.intel.com/868141/253667-089-sdm-vol-2b.pdf)
