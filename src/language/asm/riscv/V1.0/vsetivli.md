---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vsetivli"]
---

<script setup>
const instructionParts = [
  { text: 'vsetivli', label: '指令助记符', kind: 'mnemonic', description: '用 5 位立即数 AVL 配置 vl 与 vtype。' },
  { text: 'rd', separator: ' ', label: '新 vl', kind: 'destination', description: '接收硬件选出的 vl；写 x0 可丢弃结果。' },
  { text: 'uimm', separator: ', ', label: 'AVL', kind: 'immediate', description: '5 位零扩展立即数，范围为 0…31。' },
  { text: 'vtypei', separator: ', ', label: '向量类型立即数', kind: 'immediate', description: '编码 SEW、LMUL、尾部策略与掩码策略。' }
]
</script>

# vsetivli

`vsetivli` 使用 5 位零扩展立即数给出应用向量长度（AVL），使用 `vtypei` 配置 `vl`、`vtype`，并把硬件选出的新 `vl` 写入整数寄存器 `rd`。

<InstructionSlots opcode="OP-V · funct3=111" full-name="Vector Set Immediate Vector Length Immediate" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0', page: 314 }" />

<RegisterOperation kind="vsetivli" architecture="riscv" operation-class="state" instruction="vsetivli t0, 12, e16, m2, ta, ma" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `vsetivli rd, uimm, vtypei` | `uimm[4:0]` 给出 AVL，`vtypei` 提供新向量类型 |

## 配置语义

`VLMAX = LMUL × VLEN / SEW`。AVL 是 `uimm[4:0]` 的零扩展值，范围为 0…31；硬件依据 AVL、VLMAX 和规范约束选择新 `vl`，成功执行后 `x[rd] = vl`。

`vtype` 中 `vill` 位于 `XLEN-1`，`XLEN-2:8` 为必须写零的保留位，位 7 是 `vma`，位 6 是 `vta`，位 5:3 是 `vsew`，位 2:0 是 `vlmul`。上方演示会逐位显示当前设置及其含义；在本指令编码内，`vtypei[9:8]` 必须为零。

## 语义伪代码

<InstructionPseudocode kind="vsetivli" />

## 注意点

### 修改的寄存器与状态

指令写入 `vl`、`vtype` 和整数目标 `rd`，并在成功结束时把 `vstart` 清零；向量寄存器、`fflags`、`vxrm` 与 `vxsat` 保持不变。配置指令不使用执行掩码，也不直接改写任何尾部或被掩码的向量元素；`vta`、`vma` 只规定后续向量指令的写入策略。

若实现不支持给出的 `vtype` 任一位组合，硬件令 `vtype.vill=1`、其余 `vtype` 位为零，并令 `vl=0`。

### 内存对齐

不访问数据内存，因此没有内存对齐要求。

## 示例

```asm
vsetivli t0, 12, e16, m2, ta, ma  # AVL=12，t0 得到硬件选择的新 vl
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
