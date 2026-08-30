---
cover: i386
date: 2026-08-30
topic: "汇编与系统"
keywords: ["x86", "AVX-512VL", "EVEX"]
---

# AVX-512VL：128/256 位 EVEX 形式

AVX-512VL 本身不定义一套独立的新助记符，而是与 AVX-512F、BW、DQ、CD、IFMA、VBMI、VBMI2、VNNI、BITALG、VPOPCNTDQ、BF16、FP16 等子集组合，为相应指令提供 XMM/YMM 的 EVEX.128 与 EVEX.256 形式。

这些形式写入较窄目标后按 EVEX 规则清零更高位，并可使用 opmask 合并或 `{z}`。普通内存来源通常无额外自然对齐要求；aligned move 仍要求 16 或 32 字节对齐。它们不因 VL 后缀改变 EFLAGS/MXCSR 语义。

## 参考

- [Intel® Software Developer’s Manual](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
