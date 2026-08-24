<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  code: string
  title?: string
  timeout?: number
}>(), {
  title: 'JavaScript / Browser Worker',
  timeout: 3000,
})

type OutputLine = { type: 'log' | 'warn' | 'error' | 'result'; text: string }

const source = ref(props.code.trim())
const output = ref<OutputLine[]>([])
const state = ref<'idle' | 'running' | 'success' | 'error'>('idle')
let worker: Worker | undefined
let timer: ReturnType<typeof setTimeout> | undefined

const stateLabel = computed(() => ({
  idle: 'READY',
  running: 'RUNNING',
  success: 'COMPLETE',
  error: 'FAILED',
})[state.value])

function stopWorker() {
  worker?.terminate()
  worker = undefined
  if (timer) clearTimeout(timer)
  timer = undefined
}

function run() {
  stopWorker()
  output.value = []
  state.value = 'running'

  const harness = `
self.onmessage = async ({ data: source }) => {
  const lines = []
  const format = (value) => {
    if (typeof value === 'string') return value
    try { return JSON.stringify(value, null, 2) } catch { return String(value) }
  }
  const push = (type, values) => lines.push({ type, text: values.map(format).join(' ') })
  const console = {
    log: (...values) => push('log', values),
    warn: (...values) => push('warn', values),
    error: (...values) => push('error', values),
  }
  try {
    const execute = new Function('console', '"use strict"; return (async () => {\\n' + source + '\\n})()')
    const value = await execute(console)
    if (value !== undefined) lines.push({ type: 'result', text: format(value) })
    self.postMessage({ ok: true, lines })
  } catch (error) {
    self.postMessage({ ok: false, lines, error: error?.stack || String(error) })
  }
}`

  const url = URL.createObjectURL(new Blob([harness], { type: 'text/javascript' }))
  worker = new Worker(url)
  URL.revokeObjectURL(url)

  worker.onmessage = ({ data }) => {
    output.value = data.lines
    if (!data.ok) output.value.push({ type: 'error', text: data.error })
    state.value = data.ok ? 'success' : 'error'
    stopWorker()
  }

  worker.onerror = ({ message }) => {
    output.value = [{ type: 'error', text: message }]
    state.value = 'error'
    stopWorker()
  }

  worker.postMessage(source.value)
  timer = setTimeout(() => {
    output.value.push({ type: 'error', text: `执行超过 ${props.timeout}ms，已终止 Worker。` })
    state.value = 'error'
    stopWorker()
  }, props.timeout)
}

function reset() {
  stopWorker()
  source.value = props.code.trim()
  output.value = []
  state.value = 'idle'
}

async function copy() {
  await navigator.clipboard.writeText(source.value)
}

onBeforeUnmount(stopWorker)
</script>

<template>
  <section class="playground">
    <header class="playground__header">
      <div><span class="playground__light" :class="`is-${state}`" /><strong>{{ title }}</strong></div>
      <span class="playground__state">{{ stateLabel }}</span>
    </header>

    <div class="playground__workspace">
      <div class="playground__editor">
        <span class="playground__label">INPUT / SOURCE</span>
        <textarea v-model="source" aria-label="可编辑的 JavaScript 源码" spellcheck="false" />
      </div>
      <div class="playground__console" aria-live="polite">
        <span class="playground__label">OUTPUT / CONSOLE</span>
        <div class="playground__output">
          <p v-if="!output.length" class="is-placeholder">等待执行信号……</p>
          <p v-for="(line, index) in output" :key="index" :class="`is-${line.type}`">
            <span>{{ line.type === 'error' ? '!' : line.type === 'warn' ? '?' : '›' }}</span>{{ line.text }}
          </p>
        </div>
      </div>
    </div>

    <footer class="playground__actions">
      <button class="run" :disabled="state === 'running'" @click="run">▶ 运行</button>
      <button @click="reset">↺ 重置</button>
      <button @click="copy">复制源码</button>
      <small>隔离环境 · {{ timeout }}ms TIMEOUT</small>
    </footer>
  </section>
</template>

<style scoped>
.playground { margin: 28px 0; overflow: hidden; border: 1px solid var(--vp-c-border); background: var(--vp-c-bg-elv); box-shadow: var(--panel-shadow); }
.playground__header, .playground__actions { display: flex; align-items: center; justify-content: space-between; min-height: 45px; padding: 0 14px; background: var(--vp-c-bg-alt); font: 10px var(--vp-font-family-mono); letter-spacing: .08em; }
.playground__header { border-bottom: 1px solid var(--vp-c-divider); }.playground__header > div { display: flex; gap: 9px; align-items: center; }.playground__header strong { font-size: 11px; }
.playground__light { width: 7px; height: 7px; border-radius: 50%; background: var(--vp-c-text-3); }.playground__light.is-running { background: var(--c-amber); box-shadow: 0 0 10px var(--c-amber); }.playground__light.is-success { background: var(--c-cyan); box-shadow: 0 0 10px var(--c-cyan); }.playground__light.is-error { background: var(--c-signal); box-shadow: 0 0 10px var(--c-signal); }.playground__state { color: var(--vp-c-text-3); }
.playground__workspace { display: grid; grid-template-columns: 1fr 1fr; min-height: 310px; }.playground__editor, .playground__console { position: relative; padding-top: 34px; }.playground__editor { border-right: 1px solid var(--vp-c-divider); }.playground__label { position: absolute; top: 10px; left: 13px; color: var(--vp-c-text-3); font: 9px var(--vp-font-family-mono); letter-spacing: .12em; }
textarea { box-sizing: border-box; width: 100%; height: 100%; min-height: 276px; padding: 14px; resize: vertical; border: 0; outline: 0; color: var(--vp-c-text-1); background: transparent; font: 13px/1.75 var(--vp-font-family-mono); tab-size: 2; }.playground__output { overflow: auto; height: 276px; padding: 14px; font: 12px/1.65 var(--vp-font-family-mono); }.playground__output p { display: flex; gap: 9px; margin: 0 0 7px; white-space: pre-wrap; }.playground__output p > span { flex: 0 0 auto; color: var(--c-cyan); }.playground__output .is-placeholder { color: var(--vp-c-text-3); }.playground__output .is-error, .playground__output .is-error span { color: var(--c-signal); }.playground__output .is-warn, .playground__output .is-warn span { color: var(--c-amber); }.playground__output .is-result, .playground__output .is-result span { color: var(--c-cyan); }
.playground__actions { justify-content: flex-start; gap: 8px; border-top: 1px solid var(--vp-c-divider); }.playground__actions button { padding: 6px 11px; border: 1px solid var(--vp-c-border); color: var(--vp-c-text-2); background: transparent; font: inherit; cursor: pointer; }.playground__actions button:hover { border-color: var(--c-signal); color: var(--c-signal); }.playground__actions button.run { border-color: var(--c-signal); color: #fff; background: var(--c-signal); }.playground__actions button:disabled { opacity: .55; cursor: wait; }.playground__actions small { margin-left: auto; color: var(--vp-c-text-3); }
@media (max-width: 700px) { .playground__workspace { grid-template-columns: 1fr; }.playground__editor { border-right: 0; border-bottom: 1px solid var(--vp-c-divider); }.playground__actions small { display: none; } }
</style>
