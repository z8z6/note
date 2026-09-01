<script setup>
import { computed } from 'vue'
import { getRiscvPseudocode } from '../data/riscvPseudocode.mjs'

const props = defineProps({ kind: { type: String, required: true } })
const pseudocode = computed(() => getRiscvPseudocode(props.kind) || `# 暂无 ${props.kind} 的伪代码映射`)
</script>

<template>
  <figure class="instruction-pseudocode">
    <figcaption><span>{{ kind.toUpperCase() }}</span><strong>RISC-V V 1.0 · PSEUDOCODE</strong></figcaption>
    <pre><code>{{ pseudocode }}</code></pre>
    <footer><code>agnostic</code> 表示规范允许保留旧值或写全 1；辅助函数名称直接表达其规范动作。</footer>
  </figure>
</template>

<style scoped>
.instruction-pseudocode { overflow: hidden; margin: 18px 0 28px; border: 1px solid color-mix(in srgb, var(--operator-accent, var(--c-signal)) 28%, var(--vp-c-divider)); border-radius: 12px; background: var(--vp-code-block-bg); box-shadow: var(--panel-shadow); }
.instruction-pseudocode figcaption { display: flex; justify-content: space-between; gap: 12px; padding: 9px 13px; border-bottom: 1px solid var(--vp-c-divider); color: var(--operator-accent, var(--c-signal)); font: 750 9px/1.4 var(--vp-font-family-mono); letter-spacing: .1em; }
.instruction-pseudocode figcaption strong { color: var(--vp-c-text-3); font-size: 9px; }
.instruction-pseudocode pre { overflow-x: auto; margin: 0; padding: 16px; background: transparent; }
.instruction-pseudocode pre code { padding: 0; color: var(--vp-code-block-color); background: transparent; font: 12px/1.65 var(--vp-font-family-mono); white-space: pre; }
.instruction-pseudocode footer { padding: 9px 13px; border-top: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); background: color-mix(in srgb, var(--vp-c-bg-soft) 75%, transparent); font: 10px/1.5 var(--vp-font-family-base); }
.instruction-pseudocode footer code { color: var(--operator-accent, var(--c-signal)); font-size: 9px; }
</style>
