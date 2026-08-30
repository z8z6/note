---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vfslide1down"]
---

<script setup>
const instructionParts = [
  { text: 'vfslide1down.vf', label: '指令助记符', kind: 'mnemonic', description: '向低索引滑动一格并在最高活动边界插入浮点标量。' },
  { text: 'vd, vs2, rs1, vm', separator: ' ', label: '操作数', kind: 'destination', description: '目标、向量来源、浮点标量来源与可选执行掩码。' }
]
</script>

# vfslide1down：插入浮点标量并向下滑动一格

`vfslide1down.vf vd, vs2, rs1, vm` 固定滑动一个元素，并从寄存器标量向空出的边界位置插入一个值。

<InstructionSlots opcode="OP-V · funct6=001111" full-name="Vector Floating-Point Slide One Down" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0' }" />

<RegisterOperation kind="vfslide1down" initial-direction="down" :slide-one="true" :allow-direction-change="false" insert-label="f[rs1]" />

## 元素语义

```text
vd[i] = (i + 1 < VLMAX) ? vs2[i + 1] : f[rs1]
```

元素 0 位于最低 SEW 位。仅修改 `vstart` 到 `vl-1` 的活动目标元素；来源与标量寄存器保持不变，尾部遵循 `vta`，被掩码元素遵循 `vma`，正常完成后 `vstart=0`。向上形式禁止目标组与来源组重叠；向下形式遵循规范规定的安全重叠约束。

该指令不访问内存，没有内存对齐要求。浮点标量按位传送，不执行浮点运算，因此不累积 `fflags`。

## 示例

```asm
vsetvli t0, a0, e32, m4, tu, mu
vfslide1down.vf v0, v8, fa0
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
