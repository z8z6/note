<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  colSpan?: number
  rowSpan?: number
  align?: 'stretch' | 'start' | 'center' | 'end'
}>(), {
  colSpan: 1,
  rowSpan: 1,
  align: 'stretch',
})

const slotStyle = computed(() => ({
  '--slot-col-span': String(Math.max(1, Math.min(12, Math.floor(props.colSpan)))),
  '--slot-row-span': String(Math.max(1, Math.min(12, Math.floor(props.rowSpan)))),
  '--slot-align': props.align,
}))
</script>

<template>
  <div class="component-slot" :style="slotStyle"><slot /></div>
</template>

<style scoped>
.component-slot { display: flex; flex-direction: column; grid-column: span var(--slot-col-span); grid-row: span var(--slot-row-span); align-self: var(--slot-align); min-width: 0; }
.component-slot :deep(> *) { width: 100%; margin-top: 0; margin-bottom: 0; }
@media (max-width: 700px) { .component-slot { grid-column: auto; grid-row: auto; } }
</style>
