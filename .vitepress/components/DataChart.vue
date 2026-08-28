<script setup lang="ts">
import { computed, ref } from 'vue'

interface ChartDatum {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  data: ChartDatum[]
  type?: 'bar' | 'line' | 'pie'
  title?: string
  height?: number
  suffix?: string
  showValues?: boolean
  area?: boolean
  donut?: boolean
}>(), {
  type: 'bar',
  title: 'DATA VISUALIZATION',
  height: 280,
  suffix: '',
  showValues: true,
  area: true,
  donut: false,
})

const active = ref<number | null>(null)
const palette = [
  'var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)',
  'var(--chart-5)', 'var(--chart-6)', 'var(--chart-7)', 'var(--chart-8)',
]
const width = 720
const chartHeight = computed(() => Math.max(220, Math.min(480, props.height)))
const margins = { top: 28, right: 24, bottom: 52, left: 58 }
const plotWidth = width - margins.left - margins.right
const plotHeight = computed(() => chartHeight.value - margins.top - margins.bottom)

const items = computed(() => props.data
  .map((item, index) => ({
    label: String(item.label),
    value: Number(item.value),
    color: item.color || palette[index % palette.length],
  }))
  .filter(item => Number.isFinite(item.value)))

const maximum = computed(() => Math.max(1, ...items.value.map(item => Math.max(0, item.value))))
const ticks = computed(() => Array.from({ length: 5 }, (_, index) => ({
  value: maximum.value * (4 - index) / 4,
  y: margins.top + plotHeight.value * index / 4,
})))
const bars = computed(() => {
  const slot = plotWidth / Math.max(1, items.value.length)
  const barWidth = Math.min(58, slot * .62)
  return items.value.map((item, index) => {
    const height = Math.max(0, item.value) / maximum.value * plotHeight.value
    return {
      ...item,
      x: margins.left + slot * index + (slot - barWidth) / 2,
      y: margins.top + plotHeight.value - height,
      width: barWidth,
      height,
      labelX: margins.left + slot * (index + .5),
    }
  })
})
const points = computed(() => items.value.map((item, index) => ({
  ...item,
  x: margins.left + (items.value.length === 1 ? plotWidth / 2 : index * plotWidth / (items.value.length - 1)),
  y: margins.top + plotHeight.value - Math.max(0, item.value) / maximum.value * plotHeight.value,
})))
const linePoints = computed(() => points.value.map(point => `${point.x},${point.y}`).join(' '))
const areaPoints = computed(() => points.value.length
  ? `${margins.left},${margins.top + plotHeight.value} ${linePoints.value} ${margins.left + plotWidth},${margins.top + plotHeight.value}`
  : '')

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) }
}

function arcPath(startAngle: number, endAngle: number, innerRadius: number) {
  const cx = 150
  const cy = 150
  const radius = 116
  const safeEnd = endAngle - startAngle >= 360 ? endAngle - .001 : endAngle
  const start = polar(cx, cy, radius, startAngle)
  const end = polar(cx, cy, radius, safeEnd)
  const large = safeEnd - startAngle > 180 ? 1 : 0
  if (!innerRadius) return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y} Z`
  const innerEnd = polar(cx, cy, innerRadius, safeEnd)
  const innerStart = polar(cx, cy, innerRadius, startAngle)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`
}

const pieItems = computed(() => {
  const positive = items.value.map(item => ({ ...item, value: Math.max(0, item.value) }))
  const total = positive.reduce((sum, item) => sum + item.value, 0) || 1
  let angle = 0
  return positive.map(item => {
    const start = angle
    const percentage = item.value / total * 100
    angle += item.value / total * 360
    return {
      ...item,
      percentage,
      path: arcPath(start, angle, props.donut ? 62 : 0),
    }
  })
})

function format(value: number) {
  return `${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)}${props.suffix}`
}
</script>

<template>
  <section class="data-chart" :class="[`is-${type}`, { 'has-active': active !== null }]" :aria-label="title">
    <header class="data-chart__header">
      <span>{{ title }}</span>
      <b>{{ type.toUpperCase() }} / {{ items.length }} POINTS</b>
    </header>

    <div v-if="!items.length" class="data-chart__empty">NO DATA / 暂无数据</div>

    <svg
      v-else-if="type === 'bar' || type === 'line'"
      class="data-chart__plot"
      :viewBox="`0 0 ${width} ${chartHeight}`"
      role="img"
      :aria-label="title"
    >
      <g class="chart-grid">
        <g v-for="tick in ticks" :key="tick.y">
          <line :x1="margins.left" :x2="width - margins.right" :y1="tick.y" :y2="tick.y" />
          <text :x="margins.left - 10" :y="tick.y + 4">{{ format(tick.value) }}</text>
        </g>
      </g>

      <g v-if="type === 'bar'" class="chart-bars">
        <g
          v-for="(bar, index) in bars"
          :key="bar.label"
          class="chart-mark"
          :class="{ active: active === index, muted: active !== null && active !== index }"
          tabindex="0"
          @mouseenter="active = index"
          @mouseleave="active = null"
          @focus="active = index"
          @blur="active = null"
        >
          <title>{{ bar.label }}: {{ format(bar.value) }}</title>
          <rect :x="bar.x" :y="bar.y" :width="bar.width" :height="bar.height" :fill="bar.color" rx="3" />
          <text v-if="showValues" class="chart-value" :x="bar.labelX" :y="Math.max(18, bar.y - 8)">{{ format(bar.value) }}</text>
          <text class="chart-label" :x="bar.labelX" :y="chartHeight - 20">{{ bar.label.slice(0, 12) }}</text>
        </g>
      </g>

      <g v-else class="chart-line">
        <polygon v-if="area" class="chart-area" :points="areaPoints" />
        <polyline class="chart-stroke" :points="linePoints" />
        <g
          v-for="(point, index) in points"
          :key="point.label"
          class="chart-mark"
          :class="{ active: active === index, muted: active !== null && active !== index }"
          tabindex="0"
          @mouseenter="active = index"
          @mouseleave="active = null"
          @focus="active = index"
          @blur="active = null"
        >
          <title>{{ point.label }}: {{ format(point.value) }}</title>
          <circle :cx="point.x" :cy="point.y" r="6" :fill="point.color" />
          <text v-if="showValues" class="chart-value" :x="point.x" :y="point.y - 13">{{ format(point.value) }}</text>
          <text class="chart-label" :x="point.x" :y="chartHeight - 20">{{ point.label.slice(0, 12) }}</text>
        </g>
      </g>
    </svg>

    <div v-else class="data-chart__pie">
      <svg viewBox="0 0 300 300" role="img" :aria-label="title">
        <path
          v-for="(slice, index) in pieItems"
          :key="slice.label"
          class="chart-slice"
          :class="{ active: active === index, muted: active !== null && active !== index }"
          :d="slice.path"
          :fill="slice.color"
          tabindex="0"
          @mouseenter="active = index"
          @mouseleave="active = null"
          @focus="active = index"
          @blur="active = null"
        >
          <title>{{ slice.label }}: {{ format(slice.value) }} ({{ slice.percentage.toFixed(1) }}%)</title>
        </path>
      </svg>
      <div class="data-chart__legend">
        <button
          v-for="(slice, index) in pieItems"
          :key="slice.label"
          type="button"
          :class="{ active: active === index }"
          @mouseenter="active = index"
          @mouseleave="active = null"
          @focus="active = index"
          @blur="active = null"
        >
          <i :style="{ background: slice.color }" />
          <span>{{ slice.label }}</span>
          <b>{{ format(slice.value) }}</b>
          <small>{{ slice.percentage.toFixed(1) }}%</small>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.data-chart {
  --chart-1: var(--operator-accent, #e5483f);
  --chart-2: var(--operator-secondary, #178c94);
  --chart-3: #d6a132;
  --chart-4: #6c83c7;
  --chart-5: #8ea954;
  --chart-6: #ae6eaa;
  --chart-7: #de7f44;
  --chart-8: #6e9da7;
  overflow: hidden;
  width: 100%;
  margin: 28px 0;
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 14px;
  background: rgba(255, 255, 255, .72);
  box-shadow: 0 14px 38px rgba(20, 23, 25, .07);
  backdrop-filter: blur(18px) saturate(140%);
  font-family: var(--vp-font-family-mono);
}
.data-chart__header { display: flex; justify-content: space-between; padding: 11px 14px; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-3); font-size: 9px; letter-spacing: .11em; }
.data-chart__header span { color: var(--operator-accent, var(--c-signal)); }
.data-chart__plot { display: block; width: 100%; height: auto; max-height: 480px; }
.chart-grid line { stroke: var(--vp-c-divider); stroke-dasharray: 3 5; }
.chart-grid text { fill: var(--vp-c-text-3); font-size: 10px; text-anchor: end; }
.chart-label { fill: var(--vp-c-text-2); font-size: 10px; text-anchor: middle; }
.chart-value { fill: var(--vp-c-text-1); font-size: 10px; font-weight: 700; text-anchor: middle; }
.chart-mark, .chart-slice { outline: none; transition: opacity .2s, filter .2s, transform .2s; }
.chart-mark.muted, .chart-slice.muted { opacity: .28; }
.chart-mark.active, .chart-slice.active { filter: brightness(1.08) drop-shadow(0 5px 7px rgba(0,0,0,.18)); }
.chart-mark:focus-visible, .chart-slice:focus-visible { outline: 2px solid var(--operator-accent, var(--c-signal)); outline-offset: 2px; }
.chart-area { fill: color-mix(in srgb, var(--operator-accent, var(--c-signal)) 15%, transparent); }
.chart-stroke { fill: none; stroke: var(--operator-accent, var(--c-signal)); stroke-linecap: round; stroke-linejoin: round; stroke-width: 4; }
.chart-line circle { stroke: var(--vp-c-bg-elv); stroke-width: 3; }
.data-chart__pie { display: grid; grid-template-columns: minmax(240px, .9fr) minmax(260px, 1.1fr); gap: 24px; align-items: center; min-height: 300px; padding: 18px 28px; }
.data-chart__pie svg { justify-self: center; width: min(100%, 300px); }
.data-chart__legend { display: grid; gap: 5px; }
.data-chart__legend button { display: grid; grid-template-columns: 9px minmax(0, 1fr) auto 46px; gap: 10px; align-items: center; padding: 8px 10px; border: 1px solid transparent; color: var(--vp-c-text-2); background: transparent; font: 10px var(--vp-font-family-mono); text-align: left; cursor: pointer; }
.data-chart__legend button:hover, .data-chart__legend button.active, .data-chart__legend button:focus-visible { border-color: var(--vp-c-divider); color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); outline: none; }
.data-chart__legend i { width: 8px; height: 8px; }
.data-chart__legend b { color: var(--vp-c-text-1); }
.data-chart__legend small { color: var(--operator-accent, var(--c-signal)); text-align: right; }
.data-chart__empty { display: grid; place-items: center; min-height: 180px; color: var(--vp-c-text-3); font-size: 10px; letter-spacing: .12em; }
:global(.dark .data-chart) { border-color: rgba(255, 255, 255, .09); background: rgba(17, 22, 24, .76); box-shadow: 0 18px 46px rgba(0, 0, 0, .22); }
@media (max-width: 640px) {
  .data-chart__header b { display: none; }
  .data-chart__pie { grid-template-columns: 1fr; padding: 12px; }
  .data-chart__legend button { grid-template-columns: 9px minmax(0, 1fr) auto 42px; }
}
</style>
