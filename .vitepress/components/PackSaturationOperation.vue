<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  first?: number[]
  second?: number[]
  bitsPerDot?: number
}>(), {
  first: () => [-20, 0, 1, 127, 255, 256, 1000, 42],
  second: () => [300, 254, -1, 128, 10, 500, 255, 256],
  bitsPerDot: 8,
})

const chunkSize = computed(() => Math.min(16, Math.max(1, Math.round(props.bitsPerDot))))
const output = computed(() => [...props.first, ...props.second].map(value => Math.min(255, Math.max(0, Math.trunc(value)))))
const inputRows = computed(() => [
  { label: 'xmm0 · int16', values: props.first },
  { label: 'xmm1 · int16', values: props.second },
])

function chunks(value: number, width: number) {
  const normalized = BigInt.asUintN(width, BigInt(Math.trunc(value)))
  const bits = normalized.toString(2).padStart(width, '0')
  const result: string[] = []
  for (let index = 0; index < width; index += chunkSize.value) result.push(bits.slice(index, index + chunkSize.value))
  return result
}

function opacity(chunk: string) {
  const ones = [...chunk].filter(bit => bit === '1').length
  return { opacity: String(.2 + .8 * ones / chunk.length) }
}
</script>

<template>
  <figure class="pack-operation">
    <figcaption>PACKUSWB · SIGNED WORD → UNSIGNED BYTE</figcaption>
    <div class="pack-operation__canvas">
      <section v-for="row in inputRows" :key="row.label">
        <header>{{ row.label }}</header>
        <div class="pack-operation__elements inputs">
          <div v-for="(value, index) in row.values" :key="index" class="pack-operation__element">
            <div class="pack-operation__bits">
              <i v-for="(chunk, chunkIndex) in chunks(value, 16)" :key="chunkIndex" :style="opacity(chunk)" :title="chunk" />
            </div>
            <svg viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 C1 4 3 5 8 5 H42 C47 5 47 10 50 10 C53 10 53 5 58 5 H92 C97 5 99 4 99 1" /></svg>
            <b>{{ value }}</b>
          </div>
        </div>
      </section>

      <div class="pack-operation__flow"><span>↓</span><b>sat_u8 + pack</b><span>↓</span></div>

      <section class="result">
        <header>xmm0 · uint8</header>
        <div class="pack-operation__elements outputs">
          <div v-for="(value, index) in output" :key="index" class="pack-operation__element">
            <div class="pack-operation__bits">
              <i v-for="(chunk, chunkIndex) in chunks(value, 8)" :key="chunkIndex" :style="opacity(chunk)" :title="chunk" />
            </div>
            <svg viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 C1 4 3 5 8 5 H42 C47 5 47 10 50 10 C53 10 53 5 58 5 H92 C97 5 99 4 99 1" /></svg>
            <b>{{ value }}</b>
          </div>
        </div>
      </section>
    </div>
    <p>输入元素各占 16 bits，饱和后各占 8 bits；每个圆点表示 {{ chunkSize }} bits。结果低 8 bytes 来自 xmm0，高 8 bytes 来自 xmm1。</p>
  </figure>
</template>

<style scoped>
.pack-operation { --accent: var(--operator-accent, var(--c-signal, #cf5b3e)); margin: 28px 0; font-family: var(--vp-font-family-mono); }
.pack-operation figcaption { padding: 0 4px 9px; color: var(--accent); font-size: 9px; letter-spacing: .1em; }
.pack-operation__canvas { overflow-x: auto; padding: 16px; border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider)); border-radius: 12px 12px 0 0; background: var(--vp-c-bg-elv); }
.pack-operation section { display: grid; grid-template-columns: 92px minmax(720px, 1fr); align-items: center; min-width: 818px; padding: 8px 0; }
.pack-operation section.result { border-top: 1px solid color-mix(in srgb, var(--accent) 35%, var(--vp-c-divider)); }
.pack-operation section header { color: var(--vp-c-text-2); font: 650 10px var(--vp-font-family-base); }
.pack-operation__elements { display: grid; gap: 5px; }
.pack-operation__elements.inputs { grid-template-columns: repeat(8, minmax(82px, 1fr)); }
.pack-operation__elements.outputs { grid-template-columns: repeat(16, minmax(40px, 1fr)); }
.pack-operation__element { text-align: center; }
.pack-operation__bits { display: flex; justify-content: center; gap: 5px; min-height: 27px; padding: 9px 3px; border: 1px solid var(--vp-c-divider); border-radius: 6px; color: var(--accent); background: var(--vp-c-bg-soft); }
.pack-operation__bits i { width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 3px currentColor; }
.pack-operation svg { display: block; width: 100%; height: 9px; margin-top: 2px; }
.pack-operation svg path { fill: none; stroke: var(--accent); stroke-width: 1; vector-effect: non-scaling-stroke; }
.pack-operation__element b { color: var(--vp-c-text-1); font-size: 11px; }
.pack-operation__flow { min-width: 818px; padding: 3px 0 3px 92px; color: var(--accent); text-align: center; }
.pack-operation__flow span { font-size: 18px; }
.pack-operation__flow b { margin: 0 10px; font: 800 11px var(--vp-font-family-base); letter-spacing: .06em; }
.pack-operation > p { margin: 0; padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 12px 12px; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); font: 10px/1.5 var(--vp-font-family-base); }
</style>
