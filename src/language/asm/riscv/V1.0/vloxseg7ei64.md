---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vloxseg7ei64"]
---

<script setup>
const instructionParts = [
  { text: 'vloxseg7ei64.v', label: '指令助记符', kind: 'mnemonic', description: 'vloxseg7ei64.v：有序索引分段加载' },
  { text: 'vd, (rs1), vs2, vm', separator: ' ', label: '操作数', kind: 'destination', description: '该形式的操作数顺序；其他形式见下表。' }
]
</script>

# vloxseg7ei64.v

`vloxseg7ei64` 是 RISC-V V 1.0 的有序索引分段加载指令。不同操作数后缀属于同一助记符并集中列在本页。

<InstructionSlots opcode="V 1.0 · 见官方编码表" full-name="vloxseg7ei64.v：有序索引分段加载" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0' }" />

<RegisterOperation kind="vloxseg7ei64" architecture="riscv" operation-class="memory" instruction="vloxseg7ei64.v v0, (a1), v8" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `vloxseg7ei64.v vd, (rs1), vs2, vm` | RISC-V V 1.0 规范形式 |

## 元素语义

元素 0 位于寄存器组最低 SEW 位；活动 body 元素按 `memory` 类语义处理。`VLMAX = LMUL × VLEN / SEW`，实际写入范围由 `vstart`、`vl`、执行掩码和尾部策略共同决定。

## 语义伪代码

<InstructionPseudocode kind="vloxseg7ei64" />

## 注意点

### 修改的寄存器与状态

加载形式写目标向量寄存器，存储形式写内存；基址、步长、索引和来源寄存器保持不变。正常完成后 `vstart=0`，异常时可按规范从 `vstart` 重启。

### 内存对齐

V 1.0 不统一要求自然对齐；地址仍须满足执行环境对相应元素访问的支持并可访问完整元素。

## 示例

```asm
vsetvli t0, a0, e64, m1, tu, mu
vloxseg7ei64.v v0, (a1), v8
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
