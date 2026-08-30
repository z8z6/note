<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  left?: number[]
  right?: number[]
  oldDestination?: number[]
  initialMask?: boolean[]
}>(), {
  left: () => [1, 2, 3, 4, 5, 6, 7, 8],
  right: () => [9, 10, 11, 12, 13, 14, 15, 16],
  oldDestination: () => [17, 18, 19, 20, 21, 22, 23, 24],
  initialMask: () => [true, false, true, false, false, true, false, true],
})

const mask = ref([...props.initialMask])
const zeroing = ref(false)
const leftInputs = ref(props.left.map(String))
const rightInputs = ref(props.right.map(String))
const oldDestinationInputs = ref(props.oldDestination.map(String))
const leftValues = computed(() => leftInputs.value.map(Number))
const rightValues = computed(() => rightInputs.value.map(Number))
const oldDestinationValues = computed(() => oldDestinationInputs.value.map(Number))
const laneCount = computed(() => Math.min(leftValues.value.length, rightValues.value.length, oldDestinationValues.value.length))
const results = computed(() => leftValues.value.slice(0, laneCount.value).map((value, index) => {
  if (mask.value[index]) return value + rightValues.value[index]
  return zeroing.value ? 0 : (oldDestinationValues.value[index] ?? 0)
}))
const rows = computed(() => [
  { label: 'zmm1 · SRC1', values: leftValues.value },
  { label: 'zmm2 · SRC2', values: rightValues.value },
  { label: 'zmm0 · DEST', values: results.value, result: true },
])

function elementLabel(rowLabel: string, index: number) {
  return `${rowLabel.split(' · ')[0]}[${index}]`
}
</script>

<template>
  <figure class="masked-operation">
    <figcaption>
      <span>MASKED VADDPD · 8 × FLOAT64</span>
      <button type="button" :class="{ active: zeroing }" @click="zeroing = !zeroing">
        {{ zeroing ? '{z} 零化' : 'merge 合并' }}
      </button>
    </figcaption>

    <div class="masked-operation__mask">
      <strong>k1</strong>
      <button
        v-for="(_, displayIndex) in mask"
        :key="displayIndex"
        type="button"
        :class="{ active: mask[mask.length - displayIndex - 1] }"
        :aria-pressed="mask[mask.length - displayIndex - 1]"
        @click="mask[mask.length - displayIndex - 1] = !mask[mask.length - displayIndex - 1]"
      >k[{{ mask.length - displayIndex - 1 }}] = {{ Number(mask[mask.length - displayIndex - 1]) }}</button>
    </div>

    <div class="masked-operation__canvas">
      <section v-for="(row, rowIndex) in rows" :key="row.label" :class="{ result: row.result }">
        <header>{{ row.label }}</header>
        <div class="masked-operation__body">
          <div class="masked-operation__physical-range"><b>{{ row.label.split(' · ')[0] }}</b><code>[511:0]</code></div>
          <div class="masked-operation__lanes">
            <div v-for="(_, displayIndex) in laneCount" :key="displayIndex" class="masked-operation__lane">
              <div class="masked-operation__bits" :class="{ disabled: row.result && !mask[laneCount - displayIndex - 1] }">
                <small>{{ elementLabel(row.label, laneCount - displayIndex - 1) }}</small>
                <b>{{ row.values[laneCount - displayIndex - 1] }}</b>
                <em>FLOAT64</em>
              </div>
              <small v-if="rowIndex === 2">{{ mask[laneCount - displayIndex - 1] ? 'ADD' : (zeroing ? 'ZERO' : 'MERGE') }}</small>
            </div>
          </div>
        </div>
      </section>
    </div>
    <p>点击 k1 位选择 lane；切换 merge / {z} 可观察被屏蔽结果的差异。每个圆球表示一个 FLOAT64 元素。</p>
  </figure>
</template>

<style scoped>
.masked-operation { --accent: var(--operator-accent, var(--c-signal, #cf5b3e)); margin: 28px 0; font-family: var(--vp-font-family-mono); }
.masked-operation figcaption { display: flex; justify-content: space-between; align-items: center; padding: 0 4px 9px; color: var(--accent); font-size: 9px; letter-spacing: .1em; }
.masked-operation button { border: 1px solid var(--vp-c-divider); border-radius: 4px; color: var(--vp-c-text-2); background: var(--vp-c-bg-soft); cursor: pointer; }
.masked-operation button.active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--vp-c-bg-soft)); }
.masked-operation figcaption button { padding: 5px 9px; font: 650 10px var(--vp-font-family-base); }
.masked-operation__controls { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 10px; padding: 12px 14px; border: 1px solid var(--vp-c-divider); border-radius: 14px; background: var(--vp-c-bg-soft); }
.masked-operation__controls fieldset, .masked-operation__parameter { min-width: 0; padding: 9px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent); }
.masked-operation__controls legend { color: var(--vp-c-text-3); font: 9px/1.35 var(--vp-font-family-base); }
.masked-operation__controls fieldset label { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px; align-items: center; margin-top: 5px; }
.masked-operation__controls code { color: var(--vp-c-text-3); font-size: 8px; }
.masked-operation__controls input, .masked-operation__controls select { box-sizing: border-box; width: 100%; min-width: 0; padding: 5px 6px; border: 1px solid var(--vp-c-divider); border-radius: 4px; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: 9px var(--vp-font-family-mono); }
.masked-operation__mask { display: grid; grid-template-columns: 70px repeat(8, 68px); gap: 5px; width: 100%; min-width: 0; overflow-x: auto; margin-bottom: 8px; }
.masked-operation__mask strong { align-self: center; color: var(--vp-c-text-2); font-size: 12px; }
.masked-operation__mask button { padding: 5px 2px; font: 9px var(--vp-font-family-mono); }
.masked-operation__canvas { overflow-x: auto; padding: 18px; border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider)); border-radius: 12px 12px 0 0; background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 1px, transparent 1px), color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent); background-size: 24px 24px; box-shadow: var(--panel-shadow); }
.masked-operation section { display: grid; grid-template-columns: 70px minmax(704px, 1fr); min-width: 780px; padding: 7px 0; }
.masked-operation section.result { border-top: 1px solid color-mix(in srgb, var(--accent) 35%, var(--vp-c-divider)); }
.masked-operation section header { align-self: center; color: var(--vp-c-text-2); font: 650 10px var(--vp-font-family-base); }
.masked-operation__body { min-width: 0; }
.masked-operation__physical-range { display: flex; justify-content: space-between; margin-bottom: 5px; padding: 5px 8px; border: 1px solid var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--vp-c-bg)); }
.masked-operation__physical-range b { font-size: 10px; }
.masked-operation__physical-range code { color: inherit; background: none; font-size: 9px; }
.masked-operation__lanes { display: grid; grid-template-columns: repeat(8, minmax(82px, 1fr)); gap: 5px; }
.masked-operation__lane { min-width: 0; text-align: center; }
.masked-operation__bits { display: grid; place-content: center; justify-items: center; box-sizing: border-box; width: 78px; height: 78px; margin: 0 auto; padding: 9px; border: 1px solid color-mix(in srgb, var(--accent) 58%, var(--vp-c-divider)); border-radius: 50%; color: var(--accent); background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--vp-c-bg) 95%, white), color-mix(in srgb, var(--accent) 8%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, var(--accent) 18%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--accent) 5%, transparent), 0 7px 15px color-mix(in srgb, var(--accent) 12%, transparent); }
.masked-operation__bits.disabled { filter: grayscale(1); opacity: .5; }
.masked-operation__bits small { overflow: hidden; max-width: 64px; color: var(--vp-c-text-3); font-size: 6px; text-overflow: ellipsis; white-space: nowrap; }
.masked-operation__bits b { overflow: hidden; max-width: 62px; margin: 3px 0; color: var(--vp-c-text-1); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.masked-operation__bits em { color: var(--accent); font: 7px var(--vp-font-family-mono); }
.masked-operation section.result .masked-operation__bits:not(.disabled) { border-color: #2b9270; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, #55c69b 24%, var(--vp-c-bg)), color-mix(in srgb, #2b9270 25%, var(--vp-c-bg-soft)) 68%, color-mix(in srgb, #2b9270 38%, var(--vp-c-bg-soft))); box-shadow: inset 0 0 0 3px color-mix(in srgb, #2b9270 10%, transparent), 0 8px 18px color-mix(in srgb, #2b9270 25%, transparent); }
.masked-operation__lane small { color: var(--accent); font: 700 8px var(--vp-font-family-base); letter-spacing: .08em; }
.masked-operation > p { margin: 0; padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 12px 12px; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); font: 10px/1.5 var(--vp-font-family-base); }
@media (max-width: 760px) { .masked-operation__controls { grid-template-columns: 1fr; } }
</style>
