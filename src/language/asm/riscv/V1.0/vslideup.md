---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vslideup", "向量滑动"]
---

<script setup>
const parts = [
  { text: 'vslideup.vx', label: '向高索引滑动', kind: 'mnemonic', description: '把 vs2 的元素移动到更高的目标索引；.vx 的偏移量来自整数寄存器。' },
  { text: 'vd', label: '目标寄存器组', kind: 'destination', description: '接收结果；不能与源寄存器组重叠。' },
  { text: 'vs2', separator: ', ', label: '源寄存器组', kind: 'source', description: '提供待滑动元素。' },
  { text: 'rs1', separator: ', ', label: '元素偏移', kind: 'offset', description: '整数寄存器中的值按无符号 XLEN 位整数解释，不会截断到 SEW。' },
  { text: 'vm', separator: ', ', label: '可选执行掩码', kind: 'mask', description: '掩码操作数控制目标元素；无掩码形式可省略。' },
]
</script>

# vslideup

`vslideup` 把 `vs2[i-OFFSET]` 写入更高索引的 `vd[i]`。低于偏移量的 body 元素不会被此指令写入。

<InstructionSlots
  opcode="OP-V 0x57 · funct6=001110"
  full-name="Vector Slide Up"
  instruction-set="RISC-V V 1.0"
  :parts="parts"
  :reference="{ href: 'https://docs.riscv.org/reference/isa/unpriv/v-st-ext', label: 'RISC-V ISA', page: '§30.1.16' }"
/>

<RegisterOperation
  kind="vslideup"
  :initial-offset="2"
  initial-direction="up"
  :allow-direction-change="false" instruction="vslideup.vi v8, v10, 2" />

## 指令形式

| 形式 | 偏移来源 |
| --- | --- |
| `vslideup.vx vd, vs2, rs1, vm` | 无符号 XLEN 位整数寄存器 |
| `vslideup.vi vd, vs2, uimm, vm` | 5 位无符号立即数，范围 0…31 |

```text
for i = max(vstart, OFFSET) .. vl-1:
    if mask[i]: vd[i] = vs2[i-OFFSET]
```

## 语义伪代码

<InstructionPseudocode kind="vslideup" />

## 注意点

### 修改的寄存器

指令修改 `vd[max(vstart, OFFSET) .. vl-1]` 中启用的元素。`vd` 中低于 `OFFSET` 的 body 元素保持原值；被屏蔽元素由 `vtype.vma` 决定保持或变为 agnostic，尾部由 `vtype.vta` 决定。正常完成后 `vstart` 重置为 0；`vs2`、偏移来源、`vl` 和 `vtype` 不变。

### 寄存器重叠

`vd` 不能与 `vs2` 的寄存器组重叠，否则编码保留；掩码形式的 `vd` 也不能与 `v0` 重叠。LMUL 大于 1 时，每个操作数必须满足寄存器组对齐要求。

### vstart、vl 与掩码

掩码位控制目标索引，而不是源索引。当 `vstart >= vl` 时不写入任何元素，连 agnostic 尾部也不更新。

当前演示的 `VLEN=128`、`SEW=32`、`LMUL=4`，所以 `VLMAX=16`，实际 `vl` CSR 始终满足 `vl≤16`。若程序向 `vsetvli` 提交的 AVL 大于 16，那是“请求处理的剩余元素数”超过 VLMAX，而不是实际 `vl` 超过 16：当 `16<AVL<32` 时实现选择 `ceil(AVL/2)≤vl≤16`，当 `AVL≥32` 时 `vl=16`，剩余元素由后续循环继续处理。

### 内存对齐

指令不访问内存，因此没有内存对齐要求。

### 标志位

指令不修改整数条件码、`vxsat`、`vxrm` 或 `fflags`。

## 可汇编示例

```asm
.text
.globl slideup_demo
slideup_demo:
    vsetivli t0, 8, e32, m2, tu, mu
    vle32.v v10, (a0)
    vsetivli t0, 6, e32, m2, tu, mu
    vslideup.vi v8, v10, 2
    vse32.v v8, (a1)
    ret
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/unpriv/v-st-ext)
