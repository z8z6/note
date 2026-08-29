<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  left?: number[]
  right?: number[]
  oldDestination?: number[]
  initialMask?: boolean[]
  bitsPerDot?: number
}>(), {
  left: () => [10, 20, 30, 40, 50, 60, 70, 80],
  right: () => [1, 2, 3, 4, 5, 6, 7, 8],
  oldDestination: () => [99, 99, 99, 99, 99, 99, 99, 99],
  initialMask: () => [true, false, true, false, false, true, false, true],
  bitsPerDot: 8,
})

const mask = ref([...props.initialMask])
const zeroing = ref(false)
const chunkSize = computed(() => Math.min(64, Math.max(1, Math.round(props.bitsPerDot))))
const laneCount = computed(() => Math.min(props.left.length, props.right.length))
const results = computed(() => props.left.slice(0, laneCount.value).map((value, index) => {
  if (mask.value[index]) return value + props.right[index]
  return zeroing.value ? 0 : (props.oldDestination[index] ?? 0)
}))
const rows = computed(() => [
  { label: 'zmm1 · SRC1', values: props.left },
  { label: 'zmm2 · SRC2', values: props.right },
  { label: 'zmm0 · DEST', values: results.value, result: true },
])

function chunks(value: number) {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setFloat64(0, value, false)
  const bits = view.getBigUint64(0, false).toString(2).padStart(64, '0')
  const result: string[] = []
  for (let index = 0; index < 64; index += chunkSize.value) result.push(bits.slice(index, index + chunkSize.value))
  return result
}

function opacity(chunk: string) {
  const ones = [...chunk].filter(bit => bit === '1').length
  return { opacity: String(.2 + .8 * ones / chunk.length) }
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
        <div class="masked-operation__lanes">
          <div v-for="(_, displayIndex) in laneCount" :key="displayIndex" class="masked-operation__lane">
            <div v-if="rowIndex === 1" class="masked-operation__plus">＋</div>
            <div class="masked-operation__bits" :class="{ disabled: row.result && !mask[laneCount - displayIndex - 1] }">
              <i
                v-for="(chunk, chunkIndex) in chunks(row.values[laneCount - displayIndex - 1])"
                :key="chunkIndex"
                :style="opacity(chunk)"
                :title="`${chunk} · 0x${BigInt(`0b${chunk}`).toString(16).toUpperCase()}`"
              />
            </div>
            <svg viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 C1 4 3 5 8 5 H42 C47 5 47 10 50 10 C53 10 53 5 58 5 H92 C97 5 99 4 99 1" /></svg>
            <b>{{ row.values[laneCount - displayIndex - 1] }}</b>
            <span v-if="rowIndex < 2">↓</span>
            <small v-else>{{ mask[laneCount - displayIndex - 1] ? 'ADD' : (zeroing ? 'ZERO' : 'MERGE') }}</small>
          </div>
        </div>
      </section>
    </div>
    <p>点击 k1 位选择 lane；切换 merge / {z} 可观察被屏蔽结果的差异。每个圆点表示 {{ chunkSize }} bits。</p>
  </figure>
</template>

<style scoped>
.masked-operation { --accent: var(--operator-accent, var(--c-signal, #cf5b3e)); margin: 28px 0; font-family: var(--vp-font-family-mono); }
.masked-operation figcaption { display: flex; justify-content: space-between; align-items: center; padding: 0 4px 9px; color: var(--accent); font-size: 9px; letter-spacing: .1em; }
.masked-operation button { border: 1px solid var(--vp-c-divider); border-radius: 4px; color: var(--vp-c-text-2); background: var(--vp-c-bg-soft); cursor: pointer; }
.masked-operation button.active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--vp-c-bg-soft)); }
.masked-operation figcaption button { padding: 5px 9px; font: 650 10px var(--vp-font-family-base); }
.masked-operation__mask { display: grid; grid-template-columns: 70px repeat(8, 68px); gap: 5px; width: 100%; min-width: 0; overflow-x: auto; margin-bottom: 8px; }
.masked-operation__mask strong { align-self: center; color: var(--vp-c-text-2); font-size: 12px; }
.masked-operation__mask button { padding: 5px 2px; font: 9px var(--vp-font-family-mono); }
.masked-operation__canvas { overflow-x: auto; padding: 14px; border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider)); border-radius: 12px 12px 0 0; background: var(--vp-c-bg-elv); }
.masked-operation section { display: grid; grid-template-columns: 70px minmax(704px, 1fr); min-width: 780px; padding: 7px 0; }
.masked-operation section.result { border-top: 1px solid color-mix(in srgb, var(--accent) 35%, var(--vp-c-divider)); }
.masked-operation section header { align-self: center; color: var(--vp-c-text-2); font: 650 10px var(--vp-font-family-base); }
.masked-operation__lanes { display: grid; grid-template-columns: repeat(8, minmax(82px, 1fr)); gap: 5px; }
.masked-operation__lane { min-width: 0; text-align: center; }
.masked-operation__bits { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px; min-height: 27px; padding: 9px 4px; border: 1px solid var(--vp-c-divider); border-radius: 6px; color: var(--accent); background: var(--vp-c-bg-soft); }
.masked-operation__bits.disabled { filter: grayscale(1); opacity: .5; }
.masked-operation__bits i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; box-shadow: 0 0 3px currentColor; }
.masked-operation svg { display: block; width: 100%; height: 9px; margin-top: 2px; }
.masked-operation svg path { fill: none; stroke: var(--accent); stroke-width: 1; vector-effect: non-scaling-stroke; }
.masked-operation__lane b { display: block; color: var(--vp-c-text-1); font-size: 12px; }
.masked-operation__lane span { display: block; height: 18px; color: var(--accent); font-size: 17px; line-height: 18px; }
.masked-operation__lane small { color: var(--accent); font: 700 8px var(--vp-font-family-base); letter-spacing: .08em; }
.masked-operation__plus { height: 25px; color: var(--accent); font: 900 24px/25px var(--vp-font-family-mono); }
.masked-operation > p { margin: 0; padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 12px 12px; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); font: 10px/1.5 var(--vp-font-family-base); }
</style>
