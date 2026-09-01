---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vfadd"]
---

<script setup>
const instructionParts = [
  { text: 'vfadd.vv', label: '指令助记符', kind: 'mnemonic', description: 'vfadd：浮点加减' },
  { text: 'vd, vs2, vs1, vm', separator: ' ', label: '操作数', kind: 'destination', description: '该形式的操作数顺序；其他形式见下表。' }
]
</script>

# vfadd

`vfadd` 是 RISC-V V 1.0 的浮点加减指令。不同操作数后缀属于同一助记符并集中列在本页。

<InstructionSlots opcode="V 1.0 · 见官方编码表" full-name="vfadd：浮点加减" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0' }" />

<RegisterOperation kind="vfadd" architecture="riscv" operation-class="arithmetic" instruction="vfadd.vv v0, v8, v12" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `vfadd.vv vd, vs2, vs1, vm` | RISC-V V 1.0 规范形式 |
| `vfadd.vf vd, vs2, rs1, vm` | RISC-V V 1.0 规范形式 |

## 元素语义

元素 0 位于寄存器组最低 SEW 位；活动 body 元素按 `arithmetic` 类语义处理。`VLMAX = LMUL × VLEN / SEW`，实际写入范围由 `vstart`、`vl`、执行掩码和尾部策略共同决定。

## 语义伪代码

<InstructionPseudocode kind="vfadd" />

## 注意点

### 修改的寄存器与状态

活动目标元素写入 `vd`，来源保持不变；prestart 元素不变，被掩码元素由 `vma`、尾部元素由 `vta` 决定保持或 agnostic，正常完成后 `vstart=0`。目标与来源须满足 LMUL/EMUL 对齐、编号范围和重叠限制。

### 内存对齐

该指令只使用寄存器，不访问数据内存，因此没有内存对齐要求。整数、掩码和排列操作不修改 x86 风格条件码；浮点运算按规范累积 `fflags`。

## 示例

```asm
vsetvli t0, a0, e32, m1, tu, mu
vfadd.vv v0, v8, v12
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
