---
name: document-x86-instruction
description: Create or update x86 SIMD instruction pages in this VitePress repository with verified syntax, InstructionSlots metadata, circle-based lane visuals, navigation, and build validation.
---

# Document an x86 Instruction

Produce a technically accurate, discoverable instruction page that matches this repository's interactive visual language. Preserve unrelated working-tree changes.

## Establish the exact form

Read `AGENTS.md`, the target page, adjacent x86 notes, `.vitepress/components/InstructionSlots.vue`, and any relevant operation component. Verify niche facts against a current primary source, normally Intel's Software Developer's Manual.

Distinguish legacy, VEX, and EVEX forms. Check encoding and CPUID features, operands and widths, destructive behavior, lane ordering, masks, broadcasts, rounding, upper-bit clearing, flags, exceptions, alignment, and intrinsic equivalents when applicable. Link the official reference without copying large manual sections.

## Build the instruction description

Use neighboring x86 frontmatter conventions. Define syntax parts in `<script setup>` and render them with `InstructionSlots`. Always pass `instruction-set` or `:instruction-set`; the syntax and ISA label must describe the same encoding form.

Give modifiers such as `{k1}`, `{z}`, broadcast, and `{er}` their own semantic slots when present.

## Visualize the operation

Use a circle-based diagram when lane mapping, masking, packing, saturation, or bit layout matters. Prefer:

- `RegisterLaneOperation` for two-source packed floating-point addition;
- `MaskedLaneOperation` for EVEX addition with masks and merge/zero selection;
- `PackSaturationOperation` for signed-word to unsigned-byte saturation and packing.

Only add and register another component when existing components cannot express the operation honestly.

Diagram conventions:

- `bitsPerDot` defaults to 8 and remains configurable;
- dots represent bit groups, with intensity and hover details conveying their values;
- braces mark element or lane boundaries;
- arrows show data flow and corresponding lanes stay aligned;
- arithmetic operators are prominent above the second operand;
- ranges and values remain readable;
- wide diagrams scroll horizontally on narrow screens.

Do not describe floating-point addition as per-bit arithmetic. Explain the distinction between encoded bits and whole-element computation, and state the example's element-order convention.

## Explain and connect

Use concrete pseudocode, examples, mask tables, saturation boundaries, related forms, intrinsics, and pitfalls only when they clarify this instruction. Explicitly distinguish mask merge from `{z}`, saturation from truncation, and full-vector ordering from 128-bit lane-local packing.

For a new page, update `src/language/asm/x86/index.md` and the Chinese x86 sidebar in `.vitepress/config.mts`. Do not alter unrelated locales without corresponding localized content.

Run a VitePress production build and confirm routes, component props, example results, and cleanup of temporary build output before handing off.
