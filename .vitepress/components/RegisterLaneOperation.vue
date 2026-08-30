<script setup lang="ts">
import { computed, ref } from 'vue'

type LaneValue = number | string

const props = withDefaults(defineProps<{
  left?: LaneValue[]
  right?: LaneValue[]
  leftLabel?: string
  rightLabel?: string
  resultLabel?: string
  laneWidth?: number
  bitsPerDot?: number
}>(), {
  left: () => [1.5, 10],
  right: () => [2.25, -4],
  leftLabel: 'xmm0（原值）',
  rightLabel: 'xmm1（源）',
  resultLabel: 'xmm0（结果）',
  laneWidth: 64,
  bitsPerDot: 8,
})

const leftInputs = ref(props.left.map(String))
const rightInputs = ref(props.right.map(String))

const laneCount = computed(() => Math.max(leftInputs.value.length, rightInputs.value.length))
const normalizedBitsPerDot = computed(() => Math.min(64, Math.max(1, Math.round(props.bitsPerDot))))
const lanes = computed(() => Array.from({ length: laneCount.value }, (_, displayIndex) => {
  const index = laneCount.value - displayIndex - 1
  const left = parseValue(leftInputs.value[index])
  const right = parseValue(rightInputs.value[index])
  const result = left + right

  return {
    index,
    range: `[${(index + 1) * props.laneWidth - 1}:${index * props.laneWidth}]`,
    left,
    right,
    result,
  }
}))

const registers = computed(() => [
  { label: props.leftLabel, values: lanes.value.map(lane => ({ ...lane, value: lane.left })) },
  { label: props.rightLabel, values: lanes.value.map(lane => ({ ...lane, value: lane.right })) },
  { label: props.resultLabel, values: lanes.value.map(lane => ({ ...lane, value: lane.result })), result: true },
])

function parseValue(value: string | undefined) {
  const normalized = (value ?? '').trim().toLowerCase()
  if (normalized === 'nan') return Number.NaN
  if (normalized === 'infinity' || normalized === '+infinity' || normalized === 'inf' || normalized === '+inf') return Number.POSITIVE_INFINITY
  if (normalized === '-infinity' || normalized === '-inf') return Number.NEGATIVE_INFINITY
  return normalized === '' ? 0 : Number(normalized)
}

function formatValue(value: number) {
  if (Number.isNaN(value)) return 'NaN'
  if (value === Number.POSITIVE_INFINITY) return '+∞'
  if (value === Number.NEGATIVE_INFINITY) return '−∞'
  if (Object.is(value, -0)) return '−0'
  return Number.isFinite(value) ? String(Number(value.toPrecision(12))) : String(value)
}

function float64Chunks(value: number) {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setFloat64(0, value, false)
  const bits = view.getBigUint64(0, false).toString(2).padStart(64, '0')
  const chunks: string[] = []
  for (let offset = 0; offset < bits.length; offset += normalizedBitsPerDot.value) {
    chunks.push(bits.slice(offset, offset + normalizedBitsPerDot.value))
  }
  return chunks
}

function chunkRange(laneIndex: number, chunkIndex: number, chunkLength: number) {
  const high = laneIndex * props.laneWidth + props.laneWidth - 1 - chunkIndex * normalizedBitsPerDot.value
  return `[${high}:${high - chunkLength + 1}]`
}

function chunkHex(chunk: string) {
  return `0x${BigInt(`0b${chunk}`).toString(16).toUpperCase().padStart(Math.ceil(chunk.length / 4), '0')}`
}

function chunkStyle(chunk: string) {
  const ones = [...chunk].filter(bit => bit === '1').length
  return { opacity: String(.42 + .58 * ones / chunk.length) }
}
</script>

<template>
  <figure class="register-operation">
    <figcaption class="register-operation__header">PACKED REGISTER OPERATION · 128 BITS</figcaption>

    <div class="register-operation__inputs">
      <fieldset v-for="source in [{ label: leftLabel, model: leftInputs }, { label: rightLabel, model: rightInputs }]" :key="source.label">
        <legend>{{ source.label }}</legend>
        <label v-for="lane in lanes" :key="lane.index">
          <code>{{ lane.range }}</code>
          <input
            v-model="source.model[lane.index]"
            :aria-label="`${source.label} ${lane.range}`"
            inputmode="decimal"
            spellcheck="false"
          >
        </label>
      </fieldset>
    </div>

    <div class="register-operation__diagram">
      <template v-for="(register, registerIndex) in registers" :key="register.label">
        <section class="register-operation__register" :class="{ 'is-result': register.result }">
          <header>
            <strong>{{ register.label }}</strong>
          </header>
          <div class="register-operation__lanes">
            <div v-for="lane in register.values" :key="lane.index" class="register-operation__lane">
              <div v-if="registerIndex === 1" class="register-operation__operator" aria-label="加">＋</div>
              <div class="register-operation__bits">
                <i
                  v-for="(chunk, chunkIndex) in float64Chunks(lane.value)"
                  :key="chunkIndex"
                  :class="{ 'is-active': chunk.includes('1') }"
                  :style="chunkStyle(chunk)"
                  :title="`${chunkRange(lane.index, chunkIndex, chunk.length)}: ${chunk} (${chunkHex(chunk)})`"
                  :aria-label="`${chunkRange(lane.index, chunkIndex, chunk.length)} 为 ${chunk}`"
                />
              </div>
              <svg class="register-operation__brace" viewBox="0 0 100 11" preserveAspectRatio="none" aria-hidden="true">
                <path d="M1 1 C1 4 3 5 8 5 H42 C47 5 47 10 50 10 C53 10 53 5 58 5 H92 C97 5 99 4 99 1" />
              </svg>
              <div class="register-operation__underbrace">
                <div class="register-operation__lane-label">
                  <code>{{ lane.range }}</code>
                  <b>{{ formatValue(lane.value) }}</b>
                </div>
              </div>
              <div v-if="registerIndex < 2" class="register-operation__flow" aria-hidden="true">↓</div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <div class="register-operation__legend" aria-label="位分组图例">
      <span><i class="is-active" />每个圆点代表 {{ normalizedBitsPerDot }} bits</span>
      <small>圆点越亮，分组中的 1 越多；悬停可查看位范围与数值</small>
    </div>
  </figure>
</template>

<style scoped>
.register-operation {
  --register-accent: var(--operator-accent, var(--c-signal, #cf5b3e));
  margin: 28px 0;
  font-family: var(--vp-font-family-mono);
}
.register-operation__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 9px;
  color: var(--register-accent);
  font-size: 9px;
  letter-spacing: .12em;
}
.register-operation__diagram {
  overflow-x: auto;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--register-accent) 22%, var(--vp-c-divider));
  border-radius: 14px 14px 0 0;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--register-accent) 5%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--register-accent) 5%, transparent) 1px, transparent 1px),
    color-mix(in srgb, var(--vp-c-bg-elv) 90%, transparent);
  background-size: 24px 24px;
  box-shadow: var(--panel-shadow);
}
@media (max-width: 640px) {
  .register-operation__diagram { padding: 12px; }
}

/* Bit-level register view. Each lane contains 64 circles, grouped by a brace. */
.register-operation__inputs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 10px; }
.register-operation__inputs fieldset { min-width: 0; padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: color-mix(in srgb, var(--vp-c-bg-soft) 78%, transparent); }
.register-operation__inputs legend { padding: 0 5px; color: var(--vp-c-text-2); font: 650 10px/1.4 var(--vp-font-family-base); }
.register-operation__inputs label { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 7px; align-items: center; margin-top: 6px; }
.register-operation__inputs code { color: var(--vp-c-text-3); font-size: 9px; white-space: nowrap; }
.register-operation__inputs input { min-width: 0; width: 100%; padding: 6px 8px; border: 1px solid transparent; border-radius: 4px; outline: none; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: 650 12px/1.3 var(--vp-font-family-mono); }
.register-operation__inputs input:focus { border-color: var(--register-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--register-accent) 14%, transparent); }
.register-operation__register { display: grid; grid-template-columns: 116px minmax(364px, 1fr); align-items: center; min-width: 510px; padding: 10px 0; }
.register-operation__register header { display: flex; align-items: center; gap: 8px; color: var(--vp-c-text-2); font: 650 11px/1.4 var(--vp-font-family-base); }
.register-operation__lanes { display: grid; grid-template-columns: repeat(2, minmax(174px, 1fr)); gap: 10px; }
.register-operation__lane { min-width: 0; }
.register-operation__bits { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; min-height: 31px; padding: 11px 8px; border: 1px solid var(--vp-c-divider); border-radius: 7px; color: var(--register-accent); background: color-mix(in srgb, var(--vp-c-bg-soft) 80%, transparent); }
.register-operation__bits i,
.register-operation__legend i { display: block; width: 7px; height: 7px; box-sizing: border-box; border: 1px solid currentColor; border-radius: 50%; opacity: .45; }
.register-operation__bits i { width: 9px; height: 9px; background: currentColor; box-shadow: 0 0 6px color-mix(in srgb, currentColor 65%, transparent); }
.register-operation__brace { display: block; width: calc(100% - 8px); height: 11px; margin: 2px 4px 0; overflow: visible; }
.register-operation__brace path { fill: none; stroke: var(--register-accent); stroke-width: 1.1; vector-effect: non-scaling-stroke; }
.register-operation__underbrace { display: flex; justify-content: center; gap: 7px; align-items: center; min-height: 20px; }
.register-operation__lane-label { display: flex; justify-content: center; gap: 8px; align-items: baseline; }
.register-operation__lane-label code { color: var(--vp-c-text-2); background: none; font-size: 12px; font-weight: 650; }
.register-operation__lane-label b { color: var(--vp-c-text-1); font-size: 15px; }
.register-operation__operator { height: 30px; color: var(--register-accent); font: 900 28px/30px var(--vp-font-family-mono); text-align: center; }
.register-operation__flow { height: 18px; color: var(--register-accent); font: 700 18px/18px var(--vp-font-family-mono); text-align: center; }
.register-operation__register.is-result { border-top: 1px solid color-mix(in srgb, var(--register-accent) 32%, var(--vp-c-divider)); }
.register-operation__register.is-result .register-operation__bits { border-color: color-mix(in srgb, var(--register-accent) 38%, var(--vp-c-divider)); background: color-mix(in srgb, var(--register-accent) 7%, var(--vp-c-bg-soft)); }
.register-operation__register.is-result .register-operation__lane-label b { color: var(--register-accent); }
.register-operation__legend { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; padding: 10px 14px; border: 1px solid var(--vp-c-divider); border-top: 0; border-radius: 0 0 14px 14px; color: var(--vp-c-text-2); background: var(--vp-c-bg-soft); font: 10px/1.4 var(--vp-font-family-base); }
.register-operation__legend span { display: flex; gap: 5px; align-items: center; }
.register-operation__legend i { width: 8px; height: 8px; color: var(--register-accent); opacity: 1; background: currentColor; }
.register-operation__legend small { margin-left: auto; color: var(--vp-c-text-3); font-size: 9px; }
@media (max-width: 640px) { .register-operation__inputs { grid-template-columns: 1fr; } }
</style>
