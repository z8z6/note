<script setup lang="ts">
import ComponentGroup from './ComponentGroup.vue'

const props = withDefaults(defineProps<{
  title?: string
  columns?: number
  minWidth?: number
  compact?: boolean
}>(), {
  title: 'PARALLEL TABLES',
  columns: 2,
  minWidth: 260,
  compact: false,
})

</script>

<template>
  <section
    class="parallel-tables"
    :class="{ 'is-compact': compact }"
    :aria-label="title"
  >
    <header class="parallel-tables__header">
      <span>{{ title }}</span>
      <b>{{ columns }} CHANNELS</b>
    </header>
    <ComponentGroup
      class="parallel-tables__layout"
      :slots="columns"
      layout="row"
      :min-width="minWidth"
      :gap="12"
      mobile="stack"
      bare
    >
      <slot />
    </ComponentGroup>
  </section>
</template>

<style scoped>
.parallel-tables {
  width: 100%;
  margin: 28px 0;
  font-family: var(--vp-font-family-mono);
}
.parallel-tables__header {
  display: flex;
  justify-content: space-between;
  padding: 0 4px 9px;
  color: var(--vp-c-text-3);
  font-size: 9px;
  letter-spacing: .12em;
}
.parallel-tables__header span { color: var(--operator-accent, var(--c-signal)); }
:deep(.parallel-tables__layout .component-group__items > *) {
  min-width: 0;
  margin: 0;
}
:deep(.parallel-tables__layout .component-group__items > :not(table)) {
  overflow: auto;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 12px;
  background: rgba(255, 255, 255, .72);
  box-shadow: 0 12px 30px rgba(20, 23, 25, .06);
  backdrop-filter: blur(16px) saturate(140%);
}
:deep(.parallel-tables__layout .component-group__items > :not(table) > :first-child) { margin-top: 0; }
:deep(.parallel-tables__layout .component-group__items > :not(table) > :last-child) { margin-bottom: 0; }
:deep(.parallel-tables__layout h2),
:deep(.parallel-tables__layout h3),
:deep(.parallel-tables__layout h4) {
  margin: 0 0 12px;
  padding: 0 0 9px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 13px;
  letter-spacing: .02em;
}
:deep(.parallel-tables__layout table) {
  display: table;
  width: 100%;
  min-width: max-content;
  margin: 0;
  font-family: var(--vp-font-family-base);
  font-size: 12px;
}
:deep(.parallel-tables__layout .component-group__items > table) {
  overflow: hidden;
  min-width: var(--component-min-width);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-elv);
}
:deep(.parallel-tables__layout th) {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--operator-accent, var(--c-signal)) 9%, var(--vp-c-bg-soft));
}
:deep(.parallel-tables__layout th),
:deep(.parallel-tables__layout td) { padding: 8px 10px; }
.parallel-tables.is-compact :deep(.parallel-tables__layout .component-group__items > :not(table)) { padding: 9px; }
.parallel-tables.is-compact :deep(.parallel-tables__layout th),
.parallel-tables.is-compact :deep(.parallel-tables__layout td) { padding: 5px 8px; }
:global(.dark .parallel-tables__layout .component-group__items > :not(table)) {
  border-color: rgba(255, 255, 255, .09);
  background: rgba(17, 22, 24, .76);
  box-shadow: 0 16px 40px rgba(0, 0, 0, .18);
}
@media (max-width: 700px) {
  .parallel-tables__header b { display: none; }
}
</style>
