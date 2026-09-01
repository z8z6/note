---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vslide1up", "向量插入"]
---

<script setup>
const parts = [
  { text: 'vslide1up.vx', label: '插入并向上滑动一格', kind: 'mnemonic', description: '在最低元素插入整数标量，其余源元素移动到高一个索引。' },
  { text: 'vd', label: '目标寄存器组', kind: 'destination', description: '接收插入和滑动结果。' },
  { text: 'vs2', separator: ', ', label: '源寄存器组', kind: 'source', description: '元素 i 被复制到目标元素 i+1。' },
  { text: 'rs1', separator: ', ', label: '插入值', kind: 'source', description: '整数寄存器中的最低 XLEN 位标量按照 SEW 截断或符号扩展。' },
  { text: 'vm', separator: ', ', label: '可选执行掩码', kind: 'mask', description: '掩码操作数逐目标元素控制是否写入；无掩码形式可省略。' },
]
</script>

# vslide1up

`vslide1up.vx` 把整数寄存器中的标量写入 `vd[0]`，并把 `vs2[i-1]` 写入 `vd[i]`。它等价于带标量插入的固定偏移 1 上滑。

<InstructionSlots
  opcode="OP-V 0x57 · funct6=001110"
  full-name="Vector Slide One Up"
  instruction-set="RISC-V V 1.0"
  :parts="parts"
  :reference="{ href: 'https://docs.riscv.org/reference/isa/unpriv/v-st-ext', label: 'RISC-V ISA', page: '§30.1.16' }"
/>

<RegisterOperation
  kind="vslide1up"
  :slide-one="true"
  :insert-value="99"
  insert-label="x[a0]"
  initial-direction="up"
  :allow-direction-change="false" instruction="vslide1up.vx v8, v10, a2" />

## 等价操作

```text
for i = vstart .. vl-1:
    if mask[i]:
        vd[i] = (i == 0) ? scalar : vs2[i-1]
```

浮点对应形式为 `vfslide1up.vf vd, vs2, fs1, vm`，它从浮点寄存器取得一个 SEW 宽元素；本页演示整数形式。

## 语义伪代码

<InstructionPseudocode kind="vslide1up" />

## 注意点

### 修改的寄存器

指令修改 `vd[vstart .. vl-1]` 中启用的元素。被屏蔽元素由 `vtype.vma` 决定，尾部由 `vtype.vta` 决定。正常完成后 `vstart` 重置为 0；`vs2`、标量源、`vl` 和 `vtype` 不变。

### 寄存器重叠

`vd` 不能与 `vs2` 重叠，否则编码保留；掩码形式的 `vd` 不能与 `v0` 重叠。

### 标量宽度

XLEN 小于 SEW 时，插入标量被符号扩展；XLEN 大于 SEW 时，只复制最低 SEW 位。

### vstart 与掩码

若 `vstart>0`，元素 0 不会被重新插入。使用 `v0.t` 时，掩码位 0 也控制标量是否写入 `vd[0]`。当 `vstart >= vl` 时不写入任何元素。

### 内存对齐

指令不访问内存，因此没有内存对齐要求。

### 标志位

指令不修改整数条件码、`vxsat`、`vxrm` 或 `fflags`。

## 可汇编示例

```asm
.text
.globl slide1up_demo
slide1up_demo:
    vsetivli t0, 6, e32, m2, tu, mu
    vle32.v v10, (a0)
    vslide1up.vx v8, v10, a2
    vse32.v v8, (a1)
    ret
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/unpriv/v-st-ext)
