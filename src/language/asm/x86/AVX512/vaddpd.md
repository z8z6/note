---
cover: i386
date: 2026-08-29
topic: "汇编与系统"
keywords:
  - "VADDPD"
  - "AVX"
  - "AVX-512"
  - "写掩码"
  - "SIMD 双精度浮点"
---

<script setup>
const vaddpdParts = [
  {
    text: 'VADDPD',
    label: '向量加法',
    kind: 'mnemonic',
    description: '对对应位置的双精度浮点元素执行加法，使用独立的目标操作数。'
  },
  {
    text: 'zmm0',
    label: '目标操作数',
    kind: 'destination',
    description: '保存 8 个 float64 结果；采用合并掩码时，还提供被屏蔽元素的旧值。'
  },
  {
    text: '{k1}',
    separator: '',
    label: '写掩码',
    kind: 'writemask',
    description: 'k1 的低 8 位分别控制 8 个目标元素是否写入。'
  },
  {
    text: '{z}',
    separator: '',
    label: '零化策略',
    kind: 'modifier',
    description: '未选中的元素写零；省略 {z} 时保留目标寄存器中的旧值。'
  },
  {
    text: 'zmm1',
    label: '第一源操作数',
    kind: 'source',
    description: '提供第一组 8 个双精度浮点元素。'
  },
  {
    text: 'zmm2/m512/m64bcst',
    separator: ', ',
    label: '第二源操作数',
    kind: 'source',
    description: '可以是向量寄存器、512 位内存向量，或广播到所有 lane 的单个 64 位内存值。'
  },
  {
    text: '{er}',
    separator: '',
    label: '嵌入舍入',
    kind: 'modifier',
    description: '寄存器源的 EVEX.512 形式可覆盖 MXCSR 舍入模式并抑制精度异常。'
  }
]
</script>

# VADDPD：向量双精度浮点加法

`VADDPD` 是 `ADDPD` 的非破坏性向量形式。VEX 编码提供 128/256 位运算；EVEX 编码进一步提供 512 位向量、写掩码、零化、广播和嵌入舍入。

<InstructionSlots
  opcode="EVEX.512 · 66 0F 58 /r"
  full-name="Vector Add Packed Double-Precision Floating-Point Values"
  :parts="vaddpdParts"
  instruction-set="AVX-512F"
  :reference="{
    href: 'https://cdrdv2-public.intel.com/868137/325462-089-sdm-vol-1-2abcd-3abcd-4.pdf',
    label: 'INTEL SDM',
    page: '137'
  }"
/>

`AVX-512VL` 只用于 128/256 位 EVEX 形式；512 位 ZMM 形式只要求 `AVX-512F`。不带掩码的 128/256 位 VEX 形式属于 AVX。

## 指令形式

| 编码 | 语法 | 元素数 | 指令集 |
| --- | --- | ---: | --- |
| VEX.128 | `vaddpd xmm1, xmm2, xmm3/m128` | 2 | AVX |
| VEX.256 | `vaddpd ymm1, ymm2, ymm3/m256` | 4 | AVX |
| EVEX.128 | `vaddpd xmm1 {k1}{z}, xmm2, xmm3/m128/m64bcst` | 2 | AVX-512F + AVX-512VL |
| EVEX.256 | `vaddpd ymm1 {k1}{z}, ymm2, ymm3/m256/m64bcst` | 4 | AVX-512F + AVX-512VL |
| EVEX.512 | `vaddpd zmm1 {k1}{z}, zmm2, zmm3/m512/m64bcst {er}` | 8 | AVX-512F |

所有 VEX/EVEX 形式都有三个显式操作数，因此 `DEST` 不必覆盖 `SRC1`：

```text
DEST[i] = SRC1[i] + SRC2[i]
```

与传统 SSE 编码不同，写入 XMM 或 YMM 目标时，对应 ZMM 寄存器中高于当前向量长度的位会被清零。

## 写掩码

EVEX 形式以 **64 位元素** 为掩码粒度。`k1[j]` 控制第 `j` 个 `float64` 结果；XMM、YMM、ZMM 分别只使用掩码的低 2、4、8 位。

下图以圆球表示完整的 64 位元素，并在圆球内标注寄存器元素名与位范围。点击 `k1` 的各位可以启用或屏蔽对应 lane，并可切换合并与 `{z}` 零化策略。

<MaskedLaneOperation
  :initial-mask="[true, false, true, false, false, true, false, true]"
/>

<RegisterOperation kind="vaddpd" architecture="x86" operation-class="arithmetic" :vector-width="512" :element-width="64" />

```text
for j = 0 .. element_count - 1:
    if k1[j] == 1:
        DEST[j] = SRC1[j] + SRC2[j]
    else if {z}:
        DEST[j] = 0.0
    else:
        DEST[j] = OLD_DEST[j]
```

假设从低 lane 到高 lane：

```text
zmm1     = [10, 20, 30, 40, 50, 60, 70, 80]
zmm2     = [ 1,  2,  3,  4,  5,  6,  7,  8]
旧 zmm0  = [99, 99, 99, 99, 99, 99, 99, 99]
k1       = 1010_0101b
```

| lane | `k1[j]` | 加法结果 | 合并掩码结果 | `{z}` 结果 |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 11 | 11 | 11 |
| 1 | 0 | 22 | 99 | 0 |
| 2 | 1 | 33 | 33 | 33 |
| 3 | 0 | 44 | 99 | 0 |
| 4 | 0 | 55 | 99 | 0 |
| 5 | 1 | 66 | 66 | 66 |
| 6 | 0 | 77 | 99 | 0 |
| 7 | 1 | 88 | 88 | 88 |

```asm
vaddpd zmm0 {k1},    zmm1, zmm2   ; merge：屏蔽位置保留旧 zmm0
vaddpd zmm0 {k1}{z}, zmm1, zmm2   ; zero：屏蔽位置写入 +0.0
```

编码中不选择写掩码时，所有 lane 都会写入。`k0` 表示这种“无掩码”编码状态，通常不能在该语法位置显式写成 `{k0}`。

## 广播与舍入

`m64bcst` 从内存读取一个 `float64`，复制到所有 lane 后再相加：

```asm
vaddpd zmm0 {k1}{z}, zmm1, [scalar] {1to8}
```

EVEX.512 的寄存器源形式可以使用 `{rn-sae}`、`{rd-sae}`、`{ru-sae}` 或 `{rz-sae}`。它们分别指定就近、向下、向上和向零舍入，并启用 SAE；内存源使用广播时，EVEX.b 已承担广播含义，不能同时表示嵌入舍入。



## 标志位

浮点异常和舍入默认由 `MXCSR` 控制，EFLAGS 不受影响。

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual](https://cdrdv2-public.intel.com/868137/325462-089-sdm-vol-1-2abcd-3abcd-4.pdf)
