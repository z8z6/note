<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  first?: number[]
  second?: number[]
}>(), {
  first: () => [-20, 0, 1, 127, 255, 256, 1000, 42],
  second: () => [300, 254, -1, 128, 10, 500, 255, 256],
})

const firstInputs = ref(props.first.map(String))
const secondInputs = ref(props.second.map(String))
const firstValues = computed(() => firstInputs.value.map(Number))
const secondValues = computed(() => secondInputs.value.map(Number))
const output = computed(() => [...firstValues.value, ...secondValues.value].map(value => Math.min(255, Math.max(0, Math.trunc(value)))))
const inputRows = computed(() => [
  { label: 'xmm0 · int16', values: firstValues.value },
  { label: 'xmm1 · int16', values: secondValues.value },
])

</script>

<template>
  <figure class="pack-operation">
    <figcaption>PACKUSWB · SIGNED WORD → UNSIGNED BYTE</figcaption>
    <div class="pack-operation__canvas">
      <section v-for="row in inputRows" :key="row.label">
        <header>{{ row.label }}</header>
        <div class="pack-operation__body">
          <div class="pack-operation__physical-range"><b>{{ row.label.split(' · ')[0] }}</b><code>[127:0]</code></div>
          <div class="pack-operation__elements inputs">
            <div v-for="(value, index) in row.values" :key="index" class="pack-operation__element">
              <div class="pack-operation__bits">
                <small>{{ row.label.split(' · ')[0] }}[{{ index }}]</small>
                <b>{{ value }}</b>
                <em>INT16</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="result">
        <header>xmm0 · uint8</header>
        <div class="pack-operation__body">
          <div class="pack-operation__physical-range"><b>xmm0</b><code>[127:0]</code></div>
          <div class="pack-operation__elements outputs">
            <div v-for="(value, index) in output" :key="index" class="pack-operation__element">
              <div class="pack-operation__bits">
                <small>xmm0[{{ index }}]</small>
                <b>{{ value }}</b>
                <em>UINT8</em>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <p>输入元素各占 16 bits，饱和后各占 8 bits；每个圆球表示一个完整元素。结果低 8 bytes 来自 xmm0，高 8 bytes 来自 xmm1。</p>
  </figure>
</template>

<style scoped>
.pack-operation { --accent: var(--operator-accent, var(--c-signal, #cf5b3e)); margin: 28px 0; font-family: var(--vp-font-family-mono); }
.pack-operation figcaption { padding: 0 4px 9px; color: var(--accent); font-size: 9px; letter-spacing: .1em; }
.pack-operation__controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; padding: 12px 14px; border: 1px solid var(--vp-c-divider); border-radius: 14px; background: var(--vp-c-bg-soft); }
.pack-operation__controls fieldset, .pack-operation__parameter { min-width: 0; padding: 9px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent); }
.pack-operation__controls legend { color: var(--vp-c-text-3); font: 9px/1.35 var(--vp-font-family-base); }
.pack-operation__controls fieldset label { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px; align-items: center; margin-top: 5px; }
.pack-operation__controls code { color: var(--vp-c-text-3); font-size: 8px; }
.pack-operation__controls input, .pack-operation__controls select { box-sizing: border-box; width: 100%; min-width: 0; padding: 5px 6px; border: 1px solid var(--vp-c-divider); border-radius: 4px; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: 9px var(--vp-font-family-mono); }
.pack-operation__canvas { overflow-x: auto; padding: 18px; border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider)); border-radius: 12px 12px 0 0; background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px), color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent); background-size: 24px 24px; box-shadow: var(--panel-shadow); }
.pack-operation section { display: grid; grid-template-columns: 92px minmax(720px, 1fr); align-items: center; min-width: 818px; padding: 8px 0; }
.pack-operation section.result { border-top: 1px solid color-mix(in srgb, var(--accent) 35%, var(--vp-c-divider)); }
.pack-operation section header { color: var(--vp-c-text-2); font: 650 10px var(--vp-font-family-base); }
.pack-operation__body { min-width: 0; }
.pack-operation__physical-range { display: flex; justify-content: space-between; margin-bottom: 5px; padding: 5px 8px; border: 1px solid var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--vp-c-bg)); }
.pack-operation__physical-range b { font-size: 10px; }
.pack-operation__physical-range code { color: inherit; background: none; font-size: 9px; }
.pack-operation__elements { display: grid; gap: 5px; }
.pack-operation__elements.inputs { grid-template-columns: repeat(8, minmax(78px, 1fr)); }
.pack-operation__elements.outputs { grid-template-columns: repeat(16, minmax(78px, 1fr)); }
.pack-operation__element { text-align: center; }
.pack-operation__bits { display: grid; place-content: center; justify-items: center; box-sizing: border-box; width: 68px; height: 68px; margin: 0 auto; padding: 8px; border: 1px solid color-mix(in srgb, var(--accent) 58%, var(--vp-c-divider)); border-radius: 50%; color: var(--accent); background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--vp-c-bg) 95%, white), color-mix(in srgb, var(--accent) 8%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, var(--accent) 18%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--accent) 5%, transparent), 0 7px 15px color-mix(in srgb, var(--accent) 12%, transparent); }
.pack-operation__bits small { overflow: hidden; max-width: 56px; color: var(--vp-c-text-3); font-size: 5px; text-overflow: ellipsis; white-space: nowrap; }
.pack-operation__bits b { overflow: hidden; max-width: 54px; margin: 2px 0; color: var(--vp-c-text-1); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.pack-operation__bits em { color: var(--accent); font: 6px var(--vp-font-family-mono); }
.pack-operation section.result .pack-operation__bits { border-color: #2b9270; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, #55c69b 24%, var(--vp-c-bg)), color-mix(in srgb, #2b9270 25%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, #2b9270 38%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, #2b9270 10%, transparent), 0 8px 18px color-mix(in srgb, #2b9270 25%, transparent); }
.pack-operation > p { margin: 0; padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 12px 12px; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); font: 10px/1.5 var(--vp-font-family-base); }
@media (max-width: 720px) { .pack-operation__controls { grid-template-columns: 1fr; } }
</style>
