<script setup lang="ts">
import { computed, ref, useId } from 'vue'

type InstructionPart = {
  text: string
  label: string
  description?: string
  kind?: string
  separator?: string
  values?: Array<{
    value: string
    description: string
  }>
}

type InstructionReference = {
  href: string
  label?: string
  page: string | number
}

const props = withDefaults(defineProps<{
  parts: InstructionPart[]
  opcode: string
  fullName: string
  reference?: InstructionReference
  instructionSet?: string | string[]
}>(), {})

const activeIndex = ref<number | null>(null)
const componentId = useId()
const normalizedParts = computed(() => props.parts.filter(part => part.text && part.label))
const instructionSets = computed(() => {
  if (!props.instructionSet) return []
  return Array.isArray(props.instructionSet) ? props.instructionSet : [props.instructionSet]
})
const instruction = computed(() => normalizedParts.value
  .map((part, index) => `${part.separator ?? (index === 0 ? '' : ' ')}${part.text}`)
  .join(''))
const isExternalReference = computed(() => /^(?:https?:)?\/\//.test(props.reference?.href || ''))

function slotId(index: number) {
  return `${componentId}-instruction-slot-${index}`
}

function slotStyle(index: number) {
  return { '--slot-color': `var(--slot-color-${index % 6})` }
}
</script>

<template>
  <figure
    v-if="normalizedParts.length"
    class="instruction-slots"
    :aria-label="`${opcode} · ${fullName}: ${instruction}`"
  >
    <figcaption class="instruction-slots__header">
      <dl>
        <div class="instruction-slots__field--opcode">
          <dt>操作码</dt>
          <dd>{{ opcode }}</dd>
        </div>
        <div v-if="instructionSets.length" class="instruction-slots__field--isa">
          <dt>指令集</dt>
          <dd>{{ instructionSets.join(' + ') }}</dd>
        </div>
        <div class="instruction-slots__field--name">
          <dt>英文全称</dt>
          <dd>{{ fullName }}</dd>
        </div>
        <div v-if="reference?.href" class="instruction-slots__field--reference">
          <dt>参考资料</dt>
          <dd>
            <a
              :href="reference.href"
              :target="isExternalReference ? '_blank' : undefined"
              :rel="isExternalReference ? 'noopener noreferrer' : undefined"
            >{{ reference.label || 'REFERENCE' }} <i aria-hidden="true">↗</i></a>
          </dd>
        </div>
        <div v-if="reference?.href" class="instruction-slots__field--page">
          <dt>页码</dt>
          <dd>{{ reference.page }}</dd>
        </div>
      </dl>
    </figcaption>

    <div class="instruction-slots__syntax" aria-label="指令语法">
      <template v-for="(part, index) in normalizedParts" :key="`${part.text}-${index}`">
        <span v-if="part.separator ?? index > 0" class="instruction-slots__separator" aria-hidden="true">{{ part.separator ?? ' ' }}</span>
        <span
          class="instruction-slots__token"
          :class="{ 'is-active': activeIndex === index }"
          :style="slotStyle(index)"
          tabindex="0"
          role="definition"
          :aria-describedby="slotId(index)"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = null"
          @focus="activeIndex = index"
          @blur="activeIndex = null"
        >
          <small>{{ String(index + 1).padStart(2, '0') }}</small>
          <code>{{ part.text }}</code>
        </span>
      </template>
    </div>

    <div class="instruction-slots__legend">
      <article
        v-for="(part, index) in normalizedParts"
        :id="slotId(index)"
        :key="`${part.label}-${index}`"
        class="instruction-slots__item"
        :class="{ 'is-active': activeIndex === index }"
        :style="slotStyle(index)"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = null"
      >
        <i>{{ String(index + 1).padStart(2, '0') }}</i>
        <div>
          <header>
            <strong>{{ part.label }}</strong>
            <code>{{ part.text }}</code>
            <small v-if="part.kind">{{ part.kind }}</small>
          </header>
          <p v-if="part.description">{{ part.description }}</p>
          <table v-if="part.values?.length" class="instruction-slots__values">
            <thead>
              <tr><th>取值</th><th>含义</th></tr>
            </thead>
            <tbody>
              <tr v-for="option in part.values" :key="option.value">
                <td><code>{{ option.value }}</code></td>
                <td>{{ option.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </figure>
</template>

<style scoped>
.instruction-slots {
  --slot-color-0: var(--operator-accent, var(--c-signal));
  --slot-color-1: var(--operator-secondary, var(--c-cyan));
  --slot-color-2: #a97817;
  --slot-color-3: #7b61b2;
  --slot-color-4: #2c7a52;
  --slot-color-5: #b44f78;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 42%);
  overflow: hidden;
  width: 100%;
  margin: 30px 0;
  border: 1px solid color-mix(in srgb, var(--operator-accent, var(--c-signal)) 18%, var(--vp-c-divider));
  border-radius: 14px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--operator-accent, var(--c-signal)) 6%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--operator-accent, var(--c-signal)) 6%, transparent) 1px, transparent 1px),
    color-mix(in srgb, var(--vp-c-bg-elv) 88%, transparent);
  background-size: 24px 24px;
  box-shadow: var(--panel-shadow);
  font-family: var(--vp-font-family-mono);
}
.instruction-slots__header {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 3px;
  padding: 8px 14px;
  border: 0;
  border-radius: 0;
  background: none;
  background-color: transparent;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-base);
  font-size: 9px;
  letter-spacing: .04em;
}
.instruction-slots__header dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; width: 100%; margin: 0; }
.instruction-slots__header dl > div { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 6px; align-items: baseline; min-width: 0; }
.instruction-slots__field--opcode,
.instruction-slots__field--reference { grid-column: 1; }
.instruction-slots__field--isa,
.instruction-slots__field--page { grid-column: 2; }
.instruction-slots__field--name { grid-column: 1 / -1; }
.instruction-slots__header dt { color: var(--vp-c-text-2); font-size: 12px; font-weight: 700; line-height: 1.35; white-space: nowrap; }
.instruction-slots__header dd { min-width: 0; margin: 0; color: var(--operator-accent, var(--c-signal)); font-size: 14px; font-weight: 750; line-height: 1.35; overflow-wrap: anywhere; }
.instruction-slots__header a { color: inherit; font: inherit; letter-spacing: inherit; text-decoration: none; }
.instruction-slots__header a:hover { text-decoration: underline; text-underline-offset: 3px; }
.instruction-slots__header i { font-style: normal; }
.instruction-slots__syntax {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  padding: 18px;
  border: 0;
  border-radius: 0;
  background: none;
  background-color: transparent;
  box-shadow: none;
  white-space: pre;
  scrollbar-width: thin;
  scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
}
.instruction-slots__separator {
  display: grid;
  place-items: end center;
  padding-bottom: 10px;
  color: var(--vp-c-text-3);
  font-size: clamp(15px, 2.5vw, 23px);
  font-weight: 700;
}
.instruction-slots__token {
  --slot-color: var(--slot-color-0);
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  gap: 5px;
  min-width: 44px;
  padding: 7px 8px 9px;
  border: 0;
  color: var(--slot-color);
  text-align: center;
  outline: none;
  transition: background-color .18s ease, transform .18s ease;
}
.instruction-slots__token small { color: var(--vp-c-text-3); font-size: 8px; letter-spacing: .08em; }
.instruction-slots__token code {
  padding: 0;
  border: 0;
  color: inherit;
  background: none;
  font: 700 clamp(15px, 2.5vw, 23px)/1.2 var(--vp-font-family-mono);
}
.instruction-slots__token:hover,
.instruction-slots__token:focus-visible,
.instruction-slots__token.is-active {
  background: color-mix(in srgb, var(--slot-color) 10%, transparent);
  transform: translateY(-2px);
}
.instruction-slots__legend {
  grid-column: 1 / -1;
  grid-row: 2;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: color-mix(in srgb, var(--vp-c-bg-elv) 82%, transparent);
}
.instruction-slots__item {
  --slot-color: var(--slot-color-0);
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding: 14px;
  transition: background-color .18s ease;
}
.instruction-slots__item:hover,
.instruction-slots__item.is-active { background: color-mix(in srgb, var(--slot-color) 7%, transparent); }
.instruction-slots__item > i {
  display: grid;
  place-items: center;
  align-self: start;
  width: 28px;
  height: 28px;
  border: 1px solid var(--slot-color);
  border-radius: 50%;
  color: var(--slot-color);
  font-size: 9px;
  font-style: normal;
}
.instruction-slots__item header { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; min-height: 28px; }
.instruction-slots__item strong { color: var(--vp-c-text-1); font: 650 12px/1.4 var(--vp-font-family-base); }
.instruction-slots__item header code { color: var(--slot-color); font-size: 11px; }
.instruction-slots__item header small {
  padding: 2px 5px;
  border: 1px solid color-mix(in srgb, var(--slot-color) 32%, var(--vp-c-divider));
  color: var(--vp-c-text-3);
  font-size: 8px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.instruction-slots__item p { margin: 4px 0 0; color: var(--vp-c-text-2); font: 12px/1.65 var(--vp-font-family-base); }
.instruction-slots__values {
  display: table;
  width: 100%;
  margin: 10px 0 0;
  border-collapse: collapse;
  font: 11px/1.5 var(--vp-font-family-base);
}
.instruction-slots__values th,
.instruction-slots__values td { padding: 5px 7px; border: 1px solid var(--vp-c-divider); text-align: left; }
.instruction-slots__values th {
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--slot-color) 8%, var(--vp-c-bg-soft));
  font-size: 9px;
  letter-spacing: .08em;
}
.instruction-slots__values td { color: var(--vp-c-text-2); }
.instruction-slots__values td:first-child { width: 1%; white-space: nowrap; }
.instruction-slots__values code { color: var(--slot-color); font-size: 10px; }
@media (max-width: 640px) {
  .instruction-slots { grid-template-columns: minmax(0, 1fr); }
  .instruction-slots__header { grid-column: 1; grid-row: 2; padding: 10px 12px; }
  .instruction-slots__syntax { padding: 14px 12px; }
  .instruction-slots__legend { grid-row: 3; grid-template-columns: 1fr; }
}
</style>
