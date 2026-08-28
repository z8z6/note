<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import ComponentGroup from './ComponentGroup.vue'

type CodeCompareItem = {
  title?: string
  language?: string
  code: string
}

const props = withDefaults(defineProps<{
  items: CodeCompareItem[]
  minWidth?: number
  title?: string
  mergeHeaders?: boolean
}>(), {
  minWidth: 320,
  title: 'CODE COMPARISON',
  mergeHeaders: true,
})

const copied = ref<number | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const keywords = new Set([
  'alignas', 'async', 'await', 'auto', 'break', 'case', 'catch', 'class', 'const',
  'constexpr', 'continue', 'def', 'default', 'delete', 'do', 'else', 'enum', 'export',
  'extends', 'false', 'finally', 'fn', 'for', 'from', 'function', 'if', 'impl', 'import',
  'in', 'interface', 'let', 'match', 'namespace', 'new', 'nullptr', 'of', 'override',
  'private', 'protected', 'public', 'return', 'sizeof', 'static', 'struct', 'super',
  'switch', 'template', 'this', 'throw', 'true', 'try', 'type', 'typename', 'typeof',
  'use', 'using', 'var', 'virtual', 'void', 'while', 'with', 'yield',
])

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function highlight(value: string) {
  const pattern = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+(?:\.\d+)?)\b|[A-Za-z_$][\w$]*|=>|===|!==|==|!=|<=|>=|::|->|&&|\|\||\?\?|[{}()[\].,;:+\-*/%<>=!?&|])/g
  let result = ''
  let cursor = 0
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0
    result += escapeHtml(value.slice(cursor, index))
    const raw = match[0]
    const before = value.slice(0, index)
    const after = value.slice(index + raw.length)
    let kind = 'punctuation'
    if (raw.startsWith('//') || raw.startsWith('/*') || raw.startsWith('#')) kind = 'comment'
    else if (/^['"`]/.test(raw)) kind = 'string'
    else if (/^(?:\d|0[xX]|0[bB])/.test(raw)) kind = 'number'
    else if (/^[A-Za-z_$]/.test(raw)) {
      if (keywords.has(raw)) kind = 'keyword'
      else if (/^\s*\(/.test(after)) kind = 'function'
      else if (/\b(?:class|struct|enum|typename|type|new)\s+$/.test(before) || /^[A-Z]/.test(raw)) kind = 'type'
      else kind = 'variable'
    } else if (!/^[{}()[\].,;]$/.test(raw)) kind = 'operator'
    result += `<span class="token-${kind}">${escapeHtml(raw)}</span>`
    cursor = index + raw.length
  }
  return `${result}${escapeHtml(value.slice(cursor))}\n`
}

const columns = computed(() => props.items.map((item) => ({
  ...item,
  language: item.language || 'text',
  highlighted: highlight(item.code.trim()),
})))

async function copy(index: number, code: string) {
  await navigator.clipboard.writeText(code)
  copied.value = index
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copied.value = null }, 1200)
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <section class="code-compare" :class="{ 'is-merged': mergeHeaders }">
    <header class="code-compare__title"><span>{{ title }}</span><b>{{ columns.length }} CHANNELS</b></header>
    <ComponentGroup
      class="code-compare__track"
      :slots="columns.length"
      layout="row"
      :min-width="minWidth"
      :gap="mergeHeaders ? 0 : 12"
      mobile="scroll"
      bare
    >
      <article v-for="(item, index) in columns" :key="`${item.title}-${index}`" class="code-compare__item">
        <header>
          <span><i />{{ item.title || `VERSION ${index + 1}` }}</span>
          <small>{{ item.language.toUpperCase() }}</small>
          <button type="button" @click="copy(index, item.code)">{{ copied === index ? 'COPIED' : 'COPY' }}</button>
        </header>
        <pre><code v-html="item.highlighted" /></pre>
      </article>
    </ComponentGroup>
  </section>
</template>

<style scoped>
.code-compare { width: 100%; margin: 30px 0; font-family: var(--vp-font-family-mono); }
.code-compare__title { display: flex; justify-content: space-between; padding: 0 4px 9px; color: var(--vp-c-text-3); font-size: 9px; letter-spacing: .12em; }
.code-compare__title span { color: var(--operator-accent, var(--c-signal)); }
:deep(.code-compare__track .component-group__items) { padding: 2px 2px 14px; }
.code-compare__item {
  overflow: hidden;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 14px;
  background: rgba(255, 255, 255, .74);
  backdrop-filter: blur(18px) saturate(145%);
}
.code-compare__item > header { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; min-height: 40px; padding: 0 11px; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); font-size: 9px; letter-spacing: .08em; }
.code-compare__item > header span { display: flex; gap: 7px; align-items: center; font-weight: 700; }
.code-compare__item > header i { width: 5px; height: 5px; background: var(--operator-accent, var(--c-signal)); }
.code-compare__item > header small { color: var(--vp-c-text-3); }
.code-compare__item button { min-width: 42px; height: 24px; padding: 0 6px; border: 1px solid #d0d7de; border-radius: 4px; color: var(--vp-c-text-2); background: #f6f8fa; font: inherit; cursor: pointer; }
.code-compare__item button:hover { border-color: var(--operator-accent, var(--c-signal)); color: var(--operator-accent, var(--c-signal)); }
.code-compare__item pre {
  overflow: auto;
  min-height: 180px;
  max-height: 520px;
  margin: 0;
  padding: 20px 24px;
  color: #24292f;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, .92), transparent 34%),
    linear-gradient(115deg, rgba(255, 255, 255, .95), rgba(248, 251, 252, .78)),
    repeating-linear-gradient(0deg, transparent 0 3px, rgba(20, 45, 55, .018) 3px 4px);
  font: var(--vp-code-font-size)/var(--vp-code-line-height) var(--vp-font-family-mono);
  scrollbar-width: thin;
  scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
}
.code-compare__item code { font: inherit; white-space: pre; }
:deep(.token-comment) { color: #768390; font-style: italic; }
:deep(.token-string) { color: #0a7a39; }
:deep(.token-number) { color: #9a6700; }
:deep(.token-keyword) { color: #cf222e; font-weight: 650; }
:deep(.token-function) { color: #8250df; font-weight: 600; }
:deep(.token-type) { color: #0550ae; }
:deep(.token-variable) { color: #24292f; }
:deep(.token-operator) { color: #cf222e; }
:deep(.token-punctuation) { color: #57606a; }
.code-compare.is-merged .code-compare__track {
  border: 1px solid rgba(255, 255, 255, .9);
  border-radius: 14px;
  background: rgba(255, 255, 255, .74);
}
.code-compare.is-merged :deep(.code-compare__track .component-group__items) { padding: 0; }
.code-compare.is-merged .code-compare__item { border: 0; border-right: 1px solid var(--vp-c-divider); border-radius: 0; background: transparent; backdrop-filter: none; }
.code-compare.is-merged .code-compare__item:last-child { border-right: 0; }
:global(.dark .code-compare__item) { border-color: rgba(255, 255, 255, .09); background: rgba(17, 22, 24, .76); }
:global(.dark .code-compare.is-merged .code-compare__track) { border-color: rgba(255, 255, 255, .09); background: rgba(17, 22, 24, .76); }
:global(.dark .code-compare.is-merged .code-compare__item) { background: transparent; }
:global(.dark .code-compare__item button) { border-color: #3b464c; background: #20272b; }
:global(.dark .code-compare__item pre) { color: #dce5e8; background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--operator-accent, var(--c-cyan)) 13%, transparent), transparent 38%), linear-gradient(120deg, rgba(29, 36, 40, .96), rgba(18, 23, 26, .9)); }
:global(.dark .code-compare__item .token-comment) { color: #87969c; }
:global(.dark .code-compare__item .token-string) { color: #7ed9a5; }
:global(.dark .code-compare__item .token-number) { color: #e0bb6c; }
:global(.dark .code-compare__item .token-keyword),
:global(.dark .code-compare__item .token-operator) { color: #ff7f88; }
:global(.dark .code-compare__item .token-function) { color: #c39cff; }
:global(.dark .code-compare__item .token-type) { color: #76b7ff; }
:global(.dark .code-compare__item .token-variable) { color: #dce5e8; }
@media (max-width: 640px) {
  .code-compare__title b { display: none; }
}
</style>
