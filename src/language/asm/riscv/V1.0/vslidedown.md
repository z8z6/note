---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vslidedown", "向量滑动"]
---

<script setup>
const parts = [
  { text: 'vslidedown.vx', label: '向低索引滑动', kind: 'mnemonic', description: '把更高源索引的元素写入较低目标索引；.vx 偏移来自整数寄存器。' },
  { text: 'v8', label: '目标寄存器组', kind: 'destination', description: '接收结果；LMUL=2 时占用 v8–v9，并允许与源组重叠。' },
  { text: 'v10', separator: ', ', label: '源寄存器组', kind: 'source', description: '可读取当前 vl 以外、但仍位于 VLMAX 内的元素。' },
  { text: 'a0', separator: ', ', label: '元素偏移', kind: 'offset', description: '按照无符号 XLEN 位整数解释。' },
  { text: 'v0.t', separator: ', ', label: '可选执行掩码', kind: 'mask', description: 'v0[i] 控制目标元素 i；无掩码时省略。' },
]
</script>

# vslidedown：向低索引滑动元素

`vslidedown` 把 `vs2[i+OFFSET]` 写入 `vd[i]`。源索引仍在 `VLMAX` 内时，即使超过当前 `vl` 也可以读取；达到或超过 `VLMAX` 时结果为 0。

<InstructionSlots
  opcode="OP-V 0x57 · funct6=001111"
  full-name="Vector Slide Down"
  instruction-set="RISC-V V 1.0"
  :parts="parts"
  :reference="{ href: 'https://docs.riscv.org/reference/isa/unpriv/v-st-ext', label: 'RISC-V ISA', page: '§30.1.16' }"
/>

<RegisterOperation
  kind="vslidedown"
  :initial-offset="2"
  initial-direction="down"
  :allow-direction-change="false"
/>

## 指令形式

| 形式 | 偏移来源 |
| --- | --- |
| `vslidedown.vx vd, vs2, rs1, vm` | 无符号 XLEN 位整数寄存器 |
| `vslidedown.vi vd, vs2, uimm, vm` | 5 位无符号立即数，范围 0…31 |

```text
for i = vstart .. vl-1:
    if mask[i]:
        vd[i] = (i+OFFSET < VLMAX) ? vs2[i+OFFSET] : 0
```

## 注意点

### 修改的寄存器

指令修改 `vd[vstart .. vl-1]` 中启用的元素。被屏蔽元素由 `vtype.vma` 决定，尾部由 `vtype.vta` 决定。正常完成后 `vstart` 重置为 0；`vs2`、偏移来源、`vl` 和 `vtype` 不变。

### 寄存器重叠

与 `vslideup` 不同，`vslidedown` 允许 `vd` 与 `vs2` 重叠，可用于原地向低索引滑动。掩码形式的 `vd` 仍不能与 `v0` 重叠。

### vstart、vl 与掩码

掩码位控制目标索引。指令可以读取 `vl` 以外但小于 `VLMAX` 的源元素；当 `vstart >= vl` 时不写入任何元素。

### 内存对齐

指令不访问内存，因此没有内存对齐要求。

### 标志位

指令不修改整数条件码、`vxsat`、`vxrm` 或 `fflags`。

## 可汇编示例

```asm
.text
.globl slidedown_demo
slidedown_demo:
    vsetivli t0, 8, e32, m2, tu, mu
    vle32.v v10, (a0)
    vsetivli t0, 6, e32, m2, tu, mu
    vslidedown.vi v8, v10, 2
    vse32.v v8, (a1)
    ret
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/unpriv/v-st-ext)
