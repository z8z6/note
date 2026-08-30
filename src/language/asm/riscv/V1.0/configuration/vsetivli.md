---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vsetivli"]
---

<script setup>
const instructionParts = [
  { text: 'vsetivli', label: '指令助记符', kind: 'mnemonic', description: 'vsetivli：用立即数 AVL 配置 vl 与 vtype' },
  { text: 'rd, uimm, vtypei', separator: ' ', label: '操作数', kind: 'destination', description: '该形式的操作数顺序；其他形式见下表。' }
]
</script>

# vsetivli：用立即数 AVL 配置 vl 与 vtype

`vsetivli` 是 RISC-V V 1.0 的用立即数 AVL 配置 vl 与 vtype指令。不同操作数后缀属于同一助记符并集中列在本页。

<InstructionSlots opcode="V 1.0 · 见官方编码表" full-name="vsetivli：用立即数 AVL 配置 vl 与 vtype" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0' }" />

<RegisterOperation kind="vsetivli" architecture="riscv" operation-class="state" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `vsetivli rd, uimm, vtypei` | RISC-V V 1.0 规范形式 |

## 元素语义

元素 0 位于寄存器组最低 SEW 位；活动 body 元素按 `state` 类语义处理。`VLMAX = LMUL × VLEN / SEW`，实际写入范围由 `vstart`、`vl`、执行掩码和尾部策略共同决定。

## 注意点

### 修改的寄存器与状态

指令写入 `vl`、`vtype` 和整数目标 `rd`；来源寄存器保持不变，不修改 `fflags`、`vxrm` 或 `vxsat`。

### 内存对齐

不访问数据内存，因此没有内存对齐要求。

## 示例

```asm
vsetvli t0, a0, e32, m1, tu, mu
vsetivli rd, uimm, vtypei
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
