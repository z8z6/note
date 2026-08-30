---
cover: i386
date: 2026-08-29
topic: "汇编与系统"
keywords:
  - "PACKUSWB"
  - "SSE2"
  - "饱和转换"
  - "SIMD 整数"
---

<script setup>
const packuswbParts = [
  {
    text: 'PACKUSWB',
    label: '无符号饱和打包',
    kind: 'mnemonic',
    description: '把两组有符号 16 位整数压缩成无符号 8 位整数，并将越界值钳制到 0…255。'
  },
  {
    text: 'xmm0',
    label: '目标与第一源操作数',
    kind: 'destination',
    description: '原有的 8 个 int16 转换后进入结果的低 8 个 byte，随后被结果覆盖。'
  },
  {
    text: 'xmm1/m128',
    separator: ', ',
    label: '第二源操作数',
    kind: 'source',
    description: '另外 8 个 int16 转换后进入结果的高 8 个 byte。'
  }
]
</script>

# PACKUSWB：无符号饱和打包

`PACKUSWB`（Pack with Unsigned Saturation）把两个操作数中的有符号 word（`int16`）转换成无符号 byte（`uint8`），再打包进目标寄存器。转换采用饱和规则，不会简单截断高位。

<InstructionSlots
  opcode="66 0F 67 /r"
  full-name="Pack with Unsigned Saturation"
  :parts="packuswbParts"
  instruction-set="SSE2"
  :reference="{
    href: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    label: 'INTEL SDM',
    page: '919'
  }"
/>

## 饱和规则

对每个有符号 16 位输入 `x`，输出为：

```text
          0,  x < 0
sat_u8 =  x,  0 <= x <= 255
        255,  x > 255
```

| 输入 `int16` | 输出 `uint8` | 原因 |
| ---: | ---: | --- |
| -20 | 0 | 低于无符号 byte 下界 |
| 0 | 0 | 范围内 |
| 127 | 127 | 范围内 |
| 255 | 255 | 范围内 |
| 256 | 255 | 高于无符号 byte 上界 |
| 1000 | 255 | 高于无符号 byte 上界 |

这与普通窄化转换不同。例如，截断 `256` 的低 8 位会得到 `0`，而 `PACKUSWB` 得到 `255`。

## 两个寄存器如何打包

每个 XMM 源包含 8 个 word，结果 XMM 包含 16 个 byte。以下数组都按低位元素到高位元素书写：

<PackSaturationOperation
/>

<RegisterOperation kind="packuswb" architecture="x86" operation-class="convert" :vector-width="128" :element-width="8" />

```text
xmm0 words = [-20,   0,  1, 127, 255, 256, 1000, 42]
xmm1 words = [300, 254, -1, 128,  10, 500,  255, 256]

pack xmm0  = [  0,   0,  1, 127, 255, 255, 255, 42]
pack xmm1  = [255, 254,  0, 128,  10, 255, 255, 255]

result     = [  0,   0,  1, 127, 255, 255, 255, 42, 255, 254,  0, 128,  10, 255, 255, 255]
```

也就是说，第一源的转换结果进入目标低半部，第二源的转换结果进入目标高半部：

```text
DEST.byte[0..7]  = sat_u8(OLD_DEST.word[0..7])
DEST.byte[8..15] = sat_u8(SRC.word[0..7])
```

## 其他编码形式

| 指令 | 输入与输出 | 指令集 | 特点 |
| --- | --- | --- | --- |
| `PACKUSWB mm, mm/m64` | 8 × `int16` → 8 × `uint8` | MMX | 使用 MMX 寄存器 |
| `PACKUSWB xmm1, xmm2/m128` | 16 × `int16` → 16 × `uint8` | SSE2 | 两操作数，覆盖目标 |
| `VPACKUSWB xmm1, xmm2, xmm3/m128` | 16 × `int16` → 16 × `uint8` | AVX | 三操作数 |
| `VPACKUSWB ymm1, ymm2, ymm3/m256` | 32 × `int16` → 32 × `uint8` | AVX2 | 每个 128 位 lane 独立打包 |
| `VPACKUSWB zmm1 {k1}{z}, zmm2, zmm3/m512` | 64 × `int16` → 64 × `uint8` | AVX-512BW | 支持 byte 粒度写掩码 |


`PACKUSWB` 不修改 EFLAGS，也不产生 SIMD 浮点异常。
