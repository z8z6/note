# RISC-V V 1.0 notes

Use the official **V Standard Extension for Vector Operations, Version 1.0** as the source of truth. Treat later editorial editions as acceptable only when the chapter still identifies the ratified V 1.0 extension.

## Required coverage

Keep a coverage index organized like the specification:

1. configuration (`vsetvli`, `vsetivli`, `vsetvl`);
2. vector loads and stores, including unit-stride, strided, indexed, fault-only-first, segment, mask, and whole-register forms;
3. integer, fixed-point, floating-point, reduction, mask, and permutation instructions.

Expand patterned memory mnemonics into one file for every legal canonical spelling (`nf`, data EEW, index EEW, and ordered/unordered variant). Keep every slide form and every other canonical mnemonic in an independent file; operand suffix forms such as `.vv`, `.vx`, and `.vi` may share the base mnemonic file.

## Semantics checklist

- State element order: element 0 occupies the least-significant SEW bits.
- Explain that `VLMAX = LMUL × VLEN / SEW`; software chooses AVL while hardware returns the actual `vl`.
- Validate supported SEW/LMUL combinations, register-group alignment, register-number overflow, EMUL, and architectural overlap restrictions.
- Identify inactive mask elements and tail elements separately. Define `tu`/`ta` and `mu`/`ma`; “agnostic” permits either the old value or all ones on each write.
- Unless the instruction says otherwise, successful vector instructions reset `vstart` to zero. Mention restart/fault behavior where it matters.
- Floating-point notes state whether `fflags` may be accrued. Integer vector arithmetic does not modify scalar integer condition flags because RISC-V has no x86-style condition-code register.
- Vector memory instructions generally do not add an aligned-address requirement beyond supported element accesses; document any implementation or platform constraint separately from the ISA.

## Demonstrations

Use the official RISC-V logo/frontmatter already established by neighboring pages. The default interactive configuration is `vl=10`, `vlen=128`, `sew=32`, `lmul=4`, source register `v8`, and destination register `v0`, adjusted only when an instruction makes that combination illegal or uninformative.

Show every physical register in an LMUL group with its architectural bit range. Use round element nodes, distinct generated values, Chinese parameter labels, editable legal values, and visible validation errors. A slide diagram shows the old destination and never draws a source path to a nonexistent element.

Official reference: <https://docs.riscv.org/reference/isa/v20260120/unpriv/v-st-ext.html>
