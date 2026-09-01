---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords:
  - "RISC-V"
  - "RVV 1.0"
  - "vmerge"
  - "向量掩码"
---

<script setup>
const vmergeParts = [
  {
    text: 'vmerge.vvm',
    label: '向量掩码合并',
    kind: 'mnemonic',
    description: '逐元素依据 v0，从两个向量来源中选择结果。'
  },
  {
    text: 'v8',
    label: '目标向量寄存器组',
    kind: 'destination',
    description: '接收合并结果；不能与选择掩码寄存器 v0 重叠。'
  },
  {
    text: 'v10',
    separator: ', ',
    label: 'v0=0 时的来源',
    kind: 'source',
    description: '当 v0.mask[i] 为 0 时，目标元素 i 取自 vs2[i]。'
  },
  {
    text: 'v12',
    separator: ', ',
    label: 'v0=1 时的来源',
    kind: 'source',
    description: '当 v0.mask[i] 为 1 时，目标元素 i 取自 vs1[i]。'
  },
  {
    text: 'v0',
    separator: ', ',
    label: '选择掩码',
    kind: 'mask',
    description: '必选的选择寄存器，写作 v0 而不是普通掩码指令使用的 v0.t。'
  }
]
</script>

# vmerge

RISC-V `V` 扩展 1.0 的 vmerge 指令依据 `v0` 的每个掩码位，从 `vs2` 与第二来源中选择元素。第二来源可以是向量、整数寄存器或 5 位有符号立即数。

<InstructionSlots
  opcode="OP-V 0x57 · funct6=010111 · vm=0"
  full-name="Vector Integer Merge"
  instruction-set="RISC-V V 1.0"
  :parts="vmergeParts"
  :reference="{
    href: 'https://docs.riscv.org/reference/isa/unpriv/v-st-ext',
    label: 'RISC-V ISA',
    page: '§30.1.11.15'
  }"
/>

<RegisterOperation
  kind="vmerge"
  :mask="[0, 1, 0, 1, 1, 0, 0, 0]"
  :destination-register="4" instruction="vmerge.vim v16, v8, -1,  v0" />

## 指令形式

| 指令 | `v0[i]=0` 时 | `v0[i]=1` 时 |
| --- | --- | --- |
| `vmerge.vvm vd, vs2, vs1, v0` | `vd[i] = vs2[i]` | `vd[i] = vs1[i]` |
| `vmerge.vxm vd, vs2, rs1, v0` | `vd[i] = vs2[i]` | `vd[i] = x[rs1]` |
| `vmerge.vim vd, vs2, imm, v0` | `vd[i] = vs2[i]` | `vd[i] = sign_extend(imm)` |

最后一个操作数必须写作 `v0`，不能写成普通掩码向量指令使用的 `v0.t`。vmerge 的编码固定为 `vm=0`；对应的 `vm=1` 编码属于 `vmv.v.v`、`vmv.v.x` 和 `vmv.v.i`，并不是“不带掩码的 vmerge”。

## 元素如何合并

假设 `VLMAX=8`、`vl=6`、`vstart=0`，并使用 tail-undisturbed（`tu`）。数组按元素索引从低到高书写：

```text
索引       0   1   2   3   4   5   6   7
旧 vd     90  91  92  93  94  95  96  97
vs2       10  11  12  13  14  15  16  17
vs1       20  21  22  23  24  25  26  27
v0         0   1   0   1   1   0   -   -
结果       10  21  12  23  24  15  96  97
```

等价操作可以概括为：

```text
for i = vstart .. vl-1:
    if v0.mask[i] == 1:
        vd[i] = second_source[i]
    else:
        vd[i] = vs2[i]
```

其中 `second_source[i]` 对 `.vvm` 是 `vs1[i]`，对 `.vxm` 和 `.vim` 则是广播到所有 body 元素的标量值。与普通 masked 向量运算不同，vmerge 会写入 `vstart` 到 `vl-1` 的每个 body 元素。

## 语义伪代码

<InstructionPseudocode kind="vmerge" />

## 注意点

### 修改的寄存器

指令修改 `vd` 中从 `vstart` 到 `vl-1` 的全部 body 元素；这些元素没有“被屏蔽而不执行”的状态，因此 `vtype.vma` 不决定它们的结果。`vl` 以后的尾部元素仍由 `vtype.vta` 决定保持原值或变为 agnostic。

正常完成后 `vstart` 被重置为 0。`vs2`、`vs1`、整数源寄存器、`v0`、`vl` 和 `vtype` 不被修改；执行造成向量状态变化时，向量上下文状态会被标记为 Dirty。

### 掩码语义

`v0` 是数据选择器而不是可选的执行掩码：掩码位为 0 时选择第一个来源 `vs2`，为 1 时选择第二来源。因为 vmerge 是 masked 编码，`vd` 不能与 `v0` 重叠，否则编码保留。

### 寄存器重叠

在满足向量寄存器组对齐且不与 `v0` 重叠的前提下，等宽来源遵循一般向量寄存器重叠规则，因此 `.vvm` 允许 `vd` 与 `vs2` 或 `vs1` 重叠。`.vxm` 和 `.vim` 同样允许目标与等宽的 `vs2` 重叠。

### 标量与立即数宽度

`.vxm` 中，若 XLEN 大于 SEW，只使用整数寄存器的最低 SEW 位；若 XLEN 小于 SEW，则把 XLEN 位标量符号扩展到 SEW。

`.vim` 使用 5 位有符号立即数，编码范围为 -16…15，并把它符号扩展到 SEW 后参与选择。

### vstart 与 vl

`vstart` 以前的 prestart 元素保持不变。当 `vstart >= vl`（包括 `vl=0`）时，指令不写入任何元素，连 agnostic 尾部也不会更新。

### 内存对齐

所有 vmerge 形式都只有向量寄存器、整数寄存器或立即数操作数，不读取或写入内存，因此没有内存对齐要求，也不会产生由数据内存访问引起的异常。

### 标志位

RISC-V 没有 x86 风格的算术条件码。vmerge 不修改整数标志、`vxsat`、`vxrm` 或浮点 `fflags`。

## 一个可汇编的例子

下面的 GNU 汇编示例用一字节的低 8 位装入选择掩码，并分别演示三个 vmerge 形式：

```asm
.text
.globl merge_demo
merge_demo:
    vsetivli t0, 8, e32, m2, tu, mu
    vle32.v v8, (a0)
    vle32.v v10, (a1)
    vlm.v   v0, (a2)

    vmerge.vvm v12, v8, v10, v0
    vmerge.vxm v14, v8, a3,  v0
    vmerge.vim v16, v8, -1,  v0

    vse32.v v12, (a4)
    ret
```

`m2` 配置要求向量寄存器组从偶数编号开始；这里使用的 `v8`、`v10`、`v12`、`v14` 和 `v16` 均满足对齐要求且彼此不重叠。`vlm.v` 按位读取掩码，`vl=8` 时只需从 `a2` 读取一个字节。

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/unpriv/v-st-ext)
