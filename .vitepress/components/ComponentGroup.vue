<script setup lang="ts">
import { computed } from 'vue'

type GroupLayout = 'grid' | 'row' | 'column' | 'featured-left' | 'featured-right'
type MobileLayout = 'stack' | 'scroll'

const props = withDefaults(defineProps<{
  slots: number
  layout?: GroupLayout
  columns?: number
  minWidth?: number
  gap?: number
  title?: string
  mobile?: MobileLayout
  bare?: boolean
}>(), {
  layout: 'grid',
  minWidth: 260,
  gap: 12,
  title: '',
  mobile: 'stack',
  bare: false,
})

const slotCount = computed(() => Math.max(1, Math.min(12, Math.floor(props.slots))))
const columnCount = computed(() => {
  if (props.layout === 'column') return 1
  if (props.layout === 'row') return slotCount.value
  if (props.layout.startsWith('featured')) return 2
  return Math.max(1, Math.min(slotCount.value, Math.floor(props.columns || Math.min(slotCount.value, 3))))
})
const groupStyle = computed(() => ({
  '--component-slots': String(slotCount.value),
  '--component-columns': String(columnCount.value),
  '--component-min-width': `${Math.max(160, props.minWidth)}px`,
  '--component-gap': `${Math.max(0, props.gap)}px`,
  '--component-secondary-slots': String(Math.max(1, slotCount.value - 1)),
}))
</script>

<template>
  <section
    class="component-group"
    :class="[`layout-${layout}`, `mobile-${mobile}`, { 'is-bare': bare }]"
    :style="groupStyle"
    :aria-label="title || `${slotCount} component slots`"
  >
    <header v-if="title" class="component-group__header">
      <span>{{ title }}</span>
      <b>{{ slotCount }} SLOTS / {{ layout.toUpperCase() }}</b>
    </header>
    <div class="component-group__items">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.component-group { width: 100%; margin: 28px 0; font-family: var(--vp-font-family-mono); }
.component-group.is-bare { margin: 0; }
.component-group__header { display: flex; justify-content: space-between; padding: 0 4px 9px; color: var(--vp-c-text-3); font-size: 9px; letter-spacing: .12em; }
.component-group__header span { color: var(--operator-accent, var(--c-signal)); }
.component-group__items { display: grid; gap: var(--component-gap); align-items: stretch; min-width: 0; }
.layout-grid .component-group__items { grid-template-columns: repeat(var(--component-columns), minmax(var(--component-min-width), 1fr)); overflow-x: auto; padding: 2px 2px 12px; }
.layout-row .component-group__items { grid-auto-columns: minmax(var(--component-min-width), 1fr); grid-auto-flow: column; overflow-x: auto; padding: 2px 2px 12px; }
.layout-column .component-group__items { grid-template-columns: 1fr; }
.layout-featured-left .component-group__items,
.layout-featured-right .component-group__items { grid-template-columns: minmax(var(--component-min-width), 1.4fr) minmax(var(--component-min-width), 1fr); }
.layout-featured-left :deep(.component-group__items > :first-child) { grid-row: span var(--component-secondary-slots); }
.layout-featured-right :deep(.component-group__items > :last-child) { grid-row: 1 / span var(--component-secondary-slots); grid-column: 2; }
:deep(.component-group__items > *) { box-sizing: border-box; min-width: 0; margin-top: 0; margin-bottom: 0; }
.component-group__items { scrollbar-width: thin; scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track); }
@media (max-width: 700px) {
  .component-group__header b { display: none; }
  .mobile-stack .component-group__items { grid-template-columns: 1fr; grid-auto-flow: row; overflow-x: visible; }
  .mobile-stack :deep(.component-group__items > *) { grid-row: auto; grid-column: auto; }
  .mobile-scroll.layout-row .component-group__items,
  .mobile-scroll.layout-grid .component-group__items { grid-auto-columns: minmax(min(86vw, var(--component-min-width)), 1fr); grid-auto-flow: column; grid-template-columns: none; }
}
</style>
