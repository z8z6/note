---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords: ["x86", "SIMD", "VPMULTISHIFTQB", "AVX512/AVX512 VBMI"]
---

<script setup>
const instructionParts = [
  { text: 'VPMULTISHIFTQB', label: '指令助记符', kind: 'mnemonic', description: 'VPMULTISHIFTQB 的 AVX512/AVX512 VBMI 编码。' },
  { text: 'xmm, xmm, xmm', separator: ' ', label: '操作数', kind: 'destination', description: 'Intel 官方资料列出的一个操作数形式；全部形式见下表。' }
]
</script>

# VPMULTISHIFTQB：x86 logical向量指令

`VPMULTISHIFTQB` 属于 AVX512/AVX512 VBMI 的 logical 类 SIMD 指令。传统、VEX 与 EVEX 形式如共享该助记符，会集中列在本页。

<InstructionSlots opcode="Intel SDM · 见各编码形式" full-name="VPMULTISHIFTQB" instruction-set="AVX512_VBMI" :parts="instructionParts" :reference="{ href: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html', label: 'Intel SDM' }" />

<RegisterOperation kind="vpmultishiftqb" architecture="x86" operation-class="logical" :vector-width="512" :element-width="16" />

## 指令形式

| 语法 | 说明 |
| --- | --- |
| `VPMULTISHIFTQB xmm {k}, xmm, xmm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB xmm {z}, xmm, xmm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB xmm, xmm, xmm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB ymm {k}, ymm, ymm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB ymm {z}, ymm, ymm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB ymm, ymm, ymm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB zmm {k}, zmm, zmm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB zmm {z}, zmm, zmm` | Intel 官方操作数形式 |
| `VPMULTISHIFTQB zmm, zmm, zmm` | Intel 官方操作数形式 |

## 操作语义

操作数按 Intel SDM 中该编码规定的 packed 元素或低位标量解释。元素 0 位于向量寄存器最低有效位；128 位 lane 内行为与跨 lane 行为以具体形式为准。

## 注意点

### 修改的寄存器

显式目标寄存器或内存被写入，来源保持不变。传统双操作数形式可能覆盖第一来源；VEX/EVEX 非破坏性形式使用独立目标，并按编码规则清零有效宽度以上的目标位。EVEX 写掩码支持合并与 `{z}` 清零。

### 内存对齐

普通算术和转换内存来源通常没有额外自然对齐要求；名称为 aligned move 的形式以及部分非临时存储必须按 16、32 或 64 字节操作数宽度对齐。地址始终必须可访问完整操作数。

### 标志位与异常

纯整数或数据移动形式通常不修改 MXCSR。 只有 Intel SDM 明确规定的比较、测试或字符串形式修改 EFLAGS/RFLAGS；其他形式不修改整数标志。

## 示例形式

```asm
vpmultishiftqb xmm, xmm, xmm
```

## 参考

- [Intel® 64 and IA-32 Architectures Software Developer’s Manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
