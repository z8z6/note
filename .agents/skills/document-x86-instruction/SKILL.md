---
name: document-vector-instruction
description: Create or update RISC-V V 1.0 and x86 SIMD instruction notes in this VitePress repository, including verified forms, architectural effects, interactive register visuals, hierarchical navigation, and build validation.
---

# Document a Vector Instruction

Produce technically accurate, discoverable RISC-V V 1.0 or x86 SIMD notes that match this repository's interactive visual language. Preserve unrelated working-tree changes.

Honor the requested deliverable boundary. If the user requests only named components, add only the component data and invocations needed to render them. Do not add prose or navigation outside that boundary.

## Establish the exact form

Read `AGENTS.md`, the target page, adjacent notes, `.vitepress/components/InstructionSlots.vue`, and the relevant operation component. Then read the ISA-specific reference selected below:

- RISC-V V 1.0: `references/riscv-v.md`
- x86 SIMD: `references/x86-simd.md`

Verify niche facts against current primary documentation. Every canonical mnemonic has its own Markdown file; do not use a combined family note as a substitute. Patterned encodings such as RISC-V segment memory operations must expand to every canonical assembler mnemonic. Distinguish architectural instructions from assembler aliases and pseudoinstructions.

## Build the instruction description

Use neighboring frontmatter conventions. Each instruction file defines verified syntax parts in `<script setup>` and renders exactly one primary `InstructionSlots`. Always supply the matching ISA label. Multiple operand forms of the same mnemonic may share the file and must be enumerated there; different mnemonics never share an instruction file.

A complete note normally contains:

1. frontmatter, title, and a concise purpose;
2. syntax slots or a complete forms table;
3. a truthful `RegisterOperation` demonstration on every instruction page, extending its generic operation modes when a specialized mode is unavailable;
4. equivalent pseudocode or element-wise semantics;
5. `注意点`, including modified registers/state, memory alignment, inactive/tail behavior or upper-bit behavior, and flags/exceptions where applicable;
6. a concrete assembly example and an official reference link.

Do not add Intrinsic sections, intrinsic examples, or instruction-to-intrinsic tables.

## Visualize the operation

Use the unified `RegisterOperation` component on every instruction page. Set `kind` to that page's lowercase canonical instruction name; do not use a family alias. Pass explicit architecture and operation-class metadata when the instruction has no specialized renderer. Extend the component's generic modes instead of omitting the visualization.

- one sphere represents one complete packed element;
- values are automatically distinct unless an instruction requires boundary-test values;
- a register bar above the spheres names every physical register and its bit range;
- show the complete active register group without offset-driven clipping;
- expose meaningful, legal parameters and show Chinese validation messages for illegal combinations;
- changed or selected destination elements use a distinct background;
- x86 diagrams omit decorative arithmetic operators and flow arrows;
- wide diagrams scroll horizontally on narrow screens.

Do not describe element arithmetic as per-bit arithmetic. State the element-order convention whenever it could be ambiguous.

## Explain architectural effects

Every complete note explicitly states what changes and what does not.

- RISC-V: describe `vd`, source preservation, `vl`, `vstart`, mask behavior, `vta`/`vma`, overlap constraints, EMUL/register-group legality, and any scalar or `fflags` effects that apply.
- x86: describe the destination, destructive versus non-destructive operands, legacy versus VEX/EVEX upper-bit behavior, EFLAGS/RFLAGS, MXCSR, mask merge/zero behavior, and exceptions that apply.
- Memory operations: state element/index width, addressing mode, ordering, fault behavior, and alignment. Explicitly say when there is no special alignment requirement beyond valid memory access.

## Organize and verify

Update the ISA index and the Chinese sidebar for complete new notes. Sidebar groups must mirror the Markdown directory hierarchy exactly; preserve directory names and URL-encode spaces in links. Maintain a canonical-mnemonic coverage index and mechanically verify that every instruction file contains both `InstructionSlots` and `RegisterOperation`.

Run focused checks while editing, then run the VitePress production build. Confirm routes, component props, representative results, coverage indexes, and removal of temporary artifacts before handing off.
