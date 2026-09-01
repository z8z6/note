---
cover: riscv
date: 2026-08-30
topic: "汇编与系统"
keywords: ["RISC-V", "RVV 1.0", "vsetvl"]
---

<script setup>
const instructionParts = [
  { text: 'vsetvl', label: '指令助记符', kind: 'mnemonic', description: '用两个整数寄存器配置 vl 与完整 vtype。' },
  { text: 'rd', separator: ' ', label: '新 vl', kind: 'destination', description: '接收硬件选出的 vl；写 x0 可丢弃结果。' },
  { text: 'rs1', separator: ', ', label: 'AVL', kind: 'source', description: '整数寄存器提供应用向量长度；x0 的特殊组合见下文。' },
  { text: 'rs2', separator: ', ', label: '完整 vtype', kind: 'source', description: '整数寄存器提供全部 XLEN 位 vtype，常用于上下文恢复。' }
]
</script>

# vsetvl

`vsetvl` 使用 `rs1` 中的应用向量长度（AVL）和 `rs2` 中完整的 XLEN 位 `vtype` 值配置向量状态，常用于恢复先前保存的 `vl` 与 `vtype`。

<InstructionSlots opcode="OP-V · funct3=111" full-name="Vector Set Vector Length" instruction-set="RISC-V V 1.0" :parts="instructionParts" :reference="{ href: 'https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html', label: 'RISC-V V 1.0', page: 314 }" />

<RegisterOperation kind="vsetvl" architecture="riscv" operation-class="state" instruction="vsetvl t0, a0, t1" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `vsetvl rd, rs1, rs2` | `x[rs1]` 提供 AVL，`x[rs2]` 提供完整 vtype |

## 配置语义

`VLMAX = LMUL × VLEN / SEW`。硬件依据 `x[rs1]` 中的 AVL、VLMAX 和规范约束选择新 `vl`，成功执行后 `x[rd] = vl`。`rs1=x0` 时的 AVL 特殊组合与 `vsetvli` 相同。

`x[rs2]` 的全部 XLEN 位都会被检查：`vtype[XLEN-1]` 是 `vill`，`XLEN-2:8` 是必须为零的保留位，位 7 是 `vma`，位 6 是 `vta`，位 5:3 是 `vsew`，位 2:0 是 `vlmul`。上方演示以合法配置逐位显示其含义。

## 语义伪代码

<InstructionPseudocode kind="vsetvl" />

## 注意点

### 修改的寄存器与状态

指令写入 `vl`、`vtype` 和整数目标 `rd`，并在成功结束时把 `vstart` 清零；`rs1`、`rs2`、向量寄存器、`fflags`、`vxrm` 与 `vxsat` 保持不变。配置指令不使用执行掩码，也不直接改写任何尾部或被掩码的向量元素。

若 `rs2` 任一位形成实现不支持的 `vtype`，硬件令 `vtype.vill=1`、其余 `vtype` 位为零，并令 `vl=0`。

### 内存对齐

不访问数据内存，因此没有内存对齐要求。

## 示例

```asm
csrr t1, vtype       # 保存的 vtype
vsetvl t0, a0, t1    # AVL=a0，恢复完整 vtype，t0 得到新 vl
```

## 参考

- [RISC-V “V” Standard Extension for Vector Operations, Version 1.0](https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html)
