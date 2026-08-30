# x86 SIMD notes

Use Intel's Software Developer's Manual instruction reference as the primary source. Organize notes by the first ISA extension that introduces the documented encoding, while cross-linking later VEX/EVEX forms.

## Required coverage

Maintain coverage by extension rather than treating “SIMD” as only SSE:

- MMX, SSE, SSE2, SSE3, SSSE3, SSE4.1, and SSE4.2;
- AVX, F16C, FMA, and AVX2;
- AVX-512 foundation and the BW, CD, DQ, VL, IFMA, VBMI, VBMI2, VNNI, BITALG, VPOPCNTDQ, BF16, and FP16 subsets represented by the official instruction set.

Give every canonical mnemonic its own file and list it in the coverage index. Different legacy/VEX/EVEX forms of the same canonical mnemonic may share that file. Pseudo-op spellings and assembler aliases are labeled as such. Do not infer availability from intrinsic names.

## Semantics checklist

- Separate legacy destructive two-operand forms from VEX/EVEX non-destructive forms.
- State vector width, packed element type, lane-local behavior, and source/destination ordering.
- State what happens above the written width: preserved, zeroed, or otherwise defined by the encoding.
- State EFLAGS/RFLAGS effects explicitly. Cover MXCSR status/control effects for floating-point operations.
- For EVEX forms, distinguish writemask merge from `{z}`, memory broadcast, embedded rounding, and SAE.
- For memory operands, give the exact aligned boundary when required. Otherwise say there is no special alignment requirement beyond an accessible operand of the documented size.
- Distinguish saturation from truncation and full-vector ordering from 128-bit lane-local packing.

## Demonstrations

Use `RegisterOperation` with a lowercase x86 mnemonic for supported register mappings. Each packed element is one sphere; the bar above it names the XMM/YMM/ZMM register and the architectural bit range. Values are generated and nonrepeating unless boundary values are essential, such as `PACKUSWB` saturation tests. Do not show per-register value input boxes, per-bit circles, braces, decorative plus signs, or flow arrows.

Official references:

- <https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html>
- <https://www.intel.com/content/www/us/en/docs/intrinsics-guide/index.html>
