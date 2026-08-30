---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords:
  - "ADDPS"
  - "SSE2"
  - "XMM 寄存器"
  - "SIMD 单精度浮点"
---

<script setup>
const addpsParts = [
  {
    text: 'ADDPS',
    label: '指令助记符',
    kind: 'mnemonic',
    description: 'Add Packed Single-Precision Floating-Point Values，对四组对应的单精度浮点元素执行加法。'
  },
  {
    text: 'xmm0',
    label: '目标与第一源操作数',
    kind: 'destination',
    description: '保存第一个 128 位操作数；运算完成后，原有的四个 float32 元素被结果覆盖。'
  },
  {
    text: 'xmm1/m128',
    separator: ', ',
    label: '第二源操作数',
    kind: 'source',
    description: '可以是 XMM 寄存器，也可以是包含四个 float32 元素的 128 位内存操作数。'
  }
]
</script>

# ADDPS：打包单精度浮点加法

`ADDPS`（Add Packed Single-Precision Floating-Point Values）是 SSE 指令。
它把两个 128 位操作数分别看成四个 IEEE 754 单精度浮点数，对相同位置的元素执行加法，再将两项结果写回目标 XMM 寄存器。

<InstructionSlots
  opcode="0F 58 /r"
  full-name="Add Packed Single-Precision Floating-Point Values"
  instruction-set="SSE"
  :parts="addpsParts"
  :reference="{
    href: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    label: 'INTEL SDM',
    page: '140'
  }"
/>

<RegisterOperation
  kind="addps"
  left-label="xmm0（原值）"
  right-label="xmm1（源）"
  result-label="xmm0（结果）"
/>

## 等价语义

数组和图示均按低 lane 到高 lane 编号：

```text
DEST[31:0]   = float32(DEST[31:0])   + float32(SRC[31:0])
DEST[63:32]  = float32(DEST[63:32])  + float32(SRC[63:32])
DEST[95:64]  = float32(DEST[95:64])  + float32(SRC[95:64])
DEST[127:96] = float32(DEST[127:96]) + float32(SRC[127:96])
```

每个 32 位范围编码一个完整的 IEEE 754 `float32`，并不是 32 个彼此独立的位加法。

## 注意点

### 修改的寄存器

传统 `ADDPS xmm1, xmm2/m128` 是破坏性双操作数形式：`xmm1` 同时是第一来源和目标，其低 128 位被四个加法结果覆盖；第二来源不变。传统 SSE 编码不会清零对应 YMM/ZMM 的更高位。

VEX/EVEX 的 `VADDPS` 使用独立目标和两项来源；VEX.128/256 以及 EVEX.128/256 会清零目标有效宽度以上的位。EVEX 形式还可使用写掩码，未选 lane 按合并策略保留旧目标，使用 `{z}` 时清零。

### 内存对齐

`ADDPS` 的 `m128` 来源不要求 16 字节自然对齐，只需 16 字节操作数全部可访问。VEX/EVEX 的 `m128`、`m256`、`m512` 普通内存来源同样没有额外自然对齐要求；跨越无效页面仍会产生访问异常。

### 标志位与异常

`ADDPS` 不修改 EFLAGS/RFLAGS。非屏蔽浮点异常会按架构规则产生 SIMD 浮点异常；屏蔽的异常状态累积到 MXCSR。舍入模式、FTZ 和 DAZ 会影响结果，EVEX 形式可在规定编码中使用嵌入舍入或 SAE。

## 汇编示例

```asm
section .data
align 16
left:  dd 1.0, 2.0, 3.0, 4.0
right: dd 0.5, 1.5, -1.0, 8.0

section .text
movaps xmm0, [left]
addps  xmm0, [right]  ; xmm0 = [1.5, 3.5, 2.0, 12.0]
```

## 参考

- [Intel® Software Developer’s Manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
