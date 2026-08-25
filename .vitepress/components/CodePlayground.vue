<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    code: string;
    title?: string;
    timeout?: number;
  }>(),
  {
    title: "JavaScript / Browser Worker",
    timeout: 3000,
  },
);

type OutputLine = { type: "log" | "warn" | "error" | "result"; text: string };

const source = ref(props.code.trim());
const output = ref<OutputLine[]>([]);
const state = ref<"idle" | "running" | "success" | "error">("idle");
const highlightLayer = ref<HTMLElement>();
let worker: Worker | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

const stateLabel = computed(
  () =>
    ({
      idle: "READY",
      running: "RUNNING",
      success: "COMPLETE",
      error: "FAILED",
    })[state.value],
);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const keywords = new Set([
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "of",
  "return",
  "set",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);
const literals = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity",
]);
const builtins = new Set([
  "Array",
  "BigInt",
  "Boolean",
  "Date",
  "Error",
  "JSON",
  "Map",
  "Math",
  "Number",
  "Object",
  "Promise",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "WeakMap",
  "WeakSet",
  "console",
  "document",
  "globalThis",
  "window",
]);

function highlightJavaScript(value: string) {
  const token =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\.|[^`\\])*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)n?\b|[A-Za-z_$][\w$]*|=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||\?\?|\?\.|\*\*|[{}()[\].,;:+\-*/%<>=!?&|])/g;
  let result = "";
  let cursor = 0;
  for (const match of value.matchAll(token)) {
    const index = match.index ?? 0;
    result += escapeHtml(value.slice(cursor, index));
    const raw = match[0];
    const before = value.slice(0, index);
    const after = value.slice(index + raw.length);
    let kind = "punctuation";
    if (raw.startsWith("//") || raw.startsWith("/*")) kind = "comment";
    else if (/^['"`]/.test(raw)) kind = "string";
    else if (/^(?:\d|0[xX]|0[bB])/.test(raw)) kind = "number";
    else if (/^[A-Za-z_$]/.test(raw)) {
      const declaration = /\b(?:const|let|var)\s+$/.test(before);
      const property = /\.\s*$/.test(before);
      const parameter =
        /\bfunction\s+[\w$]+\([^)]*$/.test(before) ||
        (/\([^)]*$/.test(before) && /^[^)]*\)\s*=>/.test(after));
      if (keywords.has(raw)) kind = "keyword";
      else if (literals.has(raw)) kind = "constant";
      else if (builtins.has(raw)) kind = "builtin";
      else if (/^\s*\(/.test(after)) kind = "function";
      else if (property) kind = "property";
      else if (parameter) kind = "parameter";
      else if (/^[A-Z]/.test(raw)) kind = "type";
      else kind = declaration ? "declaration" : "variable";
    } else if (!/^[{}()[\].,;]$/.test(raw)) kind = "operator";
    result += `<span class="token-${kind}">${escapeHtml(raw)}</span>`;
    cursor = index + raw.length;
  }
  return `${result}${escapeHtml(value.slice(cursor))}\n`;
}

const highlightedSource = computed(() => highlightJavaScript(source.value));

function syncEditorScroll(event: Event) {
  const input = event.currentTarget as HTMLTextAreaElement;
  if (!highlightLayer.value) return;
  highlightLayer.value.scrollTop = input.scrollTop;
  highlightLayer.value.scrollLeft = input.scrollLeft;
}

function stopWorker() {
  worker?.terminate();
  worker = undefined;
  if (timer) clearTimeout(timer);
  timer = undefined;
}

function run() {
  stopWorker();
  output.value = [];
  state.value = "running";

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
}`;

  const url = URL.createObjectURL(
    new Blob([harness], { type: "text/javascript" }),
  );
  worker = new Worker(url);
  URL.revokeObjectURL(url);

  worker.onmessage = ({ data }) => {
    output.value = data.lines;
    if (!data.ok) output.value.push({ type: "error", text: data.error });
    state.value = data.ok ? "success" : "error";
    stopWorker();
  };

  worker.onerror = ({ message }) => {
    output.value = [{ type: "error", text: message }];
    state.value = "error";
    stopWorker();
  };

  worker.postMessage(source.value);
  timer = setTimeout(() => {
    output.value.push({
      type: "error",
      text: `执行超过 ${props.timeout}ms，已终止 Worker。`,
    });
    state.value = "error";
    stopWorker();
  }, props.timeout);
}

function reset() {
  stopWorker();
  source.value = props.code.trim();
  output.value = [];
  state.value = "idle";
}

async function copy() {
  await navigator.clipboard.writeText(source.value);
}

onBeforeUnmount(stopWorker);
</script>

<template>
  <section class="playground">
    <header class="playground__header">
      <div>
        <span class="playground__light" :class="`is-${state}`" /><strong>{{
          title
        }}</strong>
      </div>
      <span class="playground__state">{{ stateLabel }}</span>
    </header>

    <div class="playground__workspace">
      <div class="playground__editor">
        <span class="playground__label">INPUT / SOURCE</span>
        <div class="playground__editor-stack">
          <pre
            ref="highlightLayer"
            aria-hidden="true"
          ><code v-html="highlightedSource" /></pre>
          <textarea
            v-model="source"
            aria-label="可编辑的 JavaScript 源码"
            spellcheck="false"
            @scroll="syncEditorScroll"
          />
        </div>
      </div>
      <div class="playground__console" aria-live="polite">
        <span class="playground__label">OUTPUT / CONSOLE</span>
        <div class="playground__output">
          <p v-if="!output.length" class="is-placeholder">等待执行信号……</p>
          <p
            v-for="(line, index) in output"
            :key="index"
            :class="`is-${line.type}`"
          >
            <span>{{
              line.type === "error" ? "!" : line.type === "warn" ? "?" : "›"
            }}</span
            >{{ line.text }}
          </p>
        </div>
      </div>
    </div>

    <footer class="playground__actions">
      <button class="run" :disabled="state === 'running'" @click="run">
        ▶ 运行
      </button>
      <button @click="reset">↺ 重置</button>
      <button @click="copy">复制源码</button>
      <small>隔离环境 · {{ timeout }}ms TIMEOUT</small>
    </footer>
  </section>
</template>

<style scoped>
.playground {
  margin: 28px 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  background: color-mix(in srgb, #fff 76%, transparent);
  box-shadow:
    inset 0 1px 0 #fff,
    0 2px 0 color-mix(in srgb, var(--operator-accent, var(--c-cyan)) 32%, #aeb7be),
    0 16px 40px rgba(29, 38, 45, 0.15),
    0 32px 72px rgba(29, 38, 45, 0.08);
  backdrop-filter: blur(18px) saturate(145%);
  transform: perspective(1000px) translateY(var(--code-lift, 0))
    rotateX(var(--code-rotate-x, 0.25deg))
    rotateY(var(--code-rotate-y, 0deg));
  transform-origin: center;
  transform-style: preserve-3d;
  transition: transform 0.2s ease-out, box-shadow 0.25s;
}
.playground:hover {
  --code-lift: -2px;
  box-shadow:
    inset 0 1px 0 #fff,
    0 3px 0 color-mix(in srgb, var(--operator-accent, var(--c-cyan)) 48%, #aeb7be),
    0 20px 48px rgba(29, 38, 45, 0.18);
}
.playground.code-screen-tilt {
  transition: transform 0.1s ease-out, box-shadow 0.2s;
  will-change: transform;
}
.playground__header,
.playground__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 45px;
  padding: 0 14px;
  background: var(--vp-c-bg-alt);
  font: 10px var(--vp-font-family-mono);
  letter-spacing: 0.08em;
}
.playground__header {
  border-bottom: 1px solid var(--vp-c-divider);
}
.playground__header > div {
  display: flex;
  gap: 9px;
  align-items: center;
}
.playground__header strong {
  font-size: 11px;
}
.playground__light {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
}
.playground__light.is-running {
  background: var(--c-amber);
  box-shadow: 0 0 10px var(--c-amber);
}
.playground__light.is-success {
  background: var(--c-cyan);
  box-shadow: 0 0 10px var(--c-cyan);
}
.playground__light.is-error {
  background: var(--c-signal);
  box-shadow: 0 0 10px var(--c-signal);
}
.playground__state {
  color: var(--vp-c-text-3);
}
.playground__workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 310px;
}
.playground__editor,
.playground__console {
  position: relative;
  padding-top: 34px;
}
.playground__editor {
  border-right: 1px solid var(--vp-c-divider);
}
.playground__label {
  position: absolute;
  top: 10px;
  left: 13px;
  color: var(--vp-c-text-3);
  font: 9px var(--vp-font-family-mono);
  letter-spacing: 0.12em;
}
.playground__editor-stack {
  position: relative;
  height: 276px;
  background: #fff;
}
.playground__editor-stack pre,
textarea {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 276px;
  margin: 0;
  padding: 14px;
  border: 0;
  font: 13px/1.75 var(--vp-font-family-mono);
  tab-size: 2;
  white-space: pre;
}
.playground__editor-stack pre {
  z-index: 0;
  overflow: hidden;
  color: #24292f;
  background: transparent;
  pointer-events: none;
}
.playground__editor-stack pre code {
  font: inherit;
}
.playground__editor-stack :deep(.token-comment) {
  color: #768390;
  font-style: italic;
}
.playground__editor-stack :deep(.token-string) {
  color: #0a7a39;
}
.playground__editor-stack :deep(.token-number),
.playground__editor-stack :deep(.token-constant) {
  color: #9a6700;
}
.playground__editor-stack :deep(.token-keyword) {
  color: #cf222e;
  font-weight: 650;
}
.playground__editor-stack :deep(.token-function) {
  color: #8250df;
  font-weight: 600;
}
.playground__editor-stack :deep(.token-type),
.playground__editor-stack :deep(.token-builtin) {
  color: #0550ae;
}
.playground__editor-stack :deep(.token-declaration) {
  color: #953800;
  font-weight: 600;
}
.playground__editor-stack :deep(.token-variable) {
  color: #24292f;
}
.playground__editor-stack :deep(.token-parameter) {
  color: #116329;
}
.playground__editor-stack :deep(.token-property) {
  color: #0a6e75;
}
.playground__editor-stack :deep(.token-operator) {
  color: #cf222e;
}
.playground__editor-stack :deep(.token-punctuation) {
  color: #57606a;
}
textarea {
  z-index: 1;
  resize: none;
  outline: 0;
  color: transparent;
  caret-color: #1f2328;
  background: transparent;
  -webkit-text-fill-color: transparent;
  overflow: auto;
}
textarea::selection {
  color: transparent;
  background: rgba(9, 105, 218, 0.17);
  -webkit-text-fill-color: transparent;
}
.playground__output {
  overflow: auto;
  height: 276px;
  padding: 14px;
  color: #24292f;
  background: #f6f8fa;
  font: 12px/1.65 var(--vp-font-family-mono);
}
.playground__output p {
  display: flex;
  gap: 9px;
  margin: 0 0 7px;
  white-space: pre-wrap;
}
.playground__output p > span {
  flex: 0 0 auto;
  color: var(--c-cyan);
}
.playground__output .is-placeholder {
  color: #6e7781;
}
.playground__output .is-error,
.playground__output .is-error span {
  color: #cf222e;
}
.playground__output .is-warn,
.playground__output .is-warn span {
  color: #9a6700;
}
.playground__output .is-result,
.playground__output .is-result span {
  color: #0969da;
}
textarea,
.playground__output {
  scrollbar-width: thin;
  scrollbar-color: var(--ui-scroll-thumb) var(--ui-scroll-track);
}
textarea::-webkit-scrollbar,
.playground__output::-webkit-scrollbar {
  width: 9px;
  height: 9px;
}
textarea::-webkit-scrollbar-track,
.playground__output::-webkit-scrollbar-track {
  background: var(--ui-scroll-track);
}
textarea::-webkit-scrollbar-thumb,
.playground__output::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 6px;
  background: var(--ui-scroll-thumb);
  background-clip: padding-box;
}
textarea::-webkit-scrollbar-thumb:hover,
.playground__output::-webkit-scrollbar-thumb:hover {
  background: var(--ui-scroll-hover);
  background-clip: padding-box;
}
textarea::-webkit-scrollbar-corner,
.playground__output::-webkit-scrollbar-corner {
  background: transparent;
}
.playground__actions {
  justify-content: flex-start;
  gap: 8px;
  border-top: 1px solid var(--vp-c-divider);
}
.playground__actions button {
  padding: 6px 11px;
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-2);
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.playground__actions button:hover {
  border-color: var(--c-signal);
  color: var(--c-signal);
}
.playground__actions button.run {
  border-color: var(--c-signal);
  color: #fff;
  background: var(--c-signal);
}
.playground__actions button:disabled {
  opacity: 0.55;
  cursor: wait;
}
.playground__actions small {
  margin-left: auto;
  color: var(--vp-c-text-3);
}
:global(.dark .playground) {
  border-color: rgba(255, 255, 255, 0.09);
  background: rgba(17, 22, 24, 0.78);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 0 color-mix(in srgb, var(--operator-accent, var(--c-cyan)) 38%, #293136), 0 20px 48px rgba(0, 0, 0, 0.38);
}
:global(.dark .playground__header),
:global(.dark .playground__actions) { background: rgba(20, 26, 29, 0.9); }
:global(.dark .playground__editor-stack) { background: #151a1d; }
:global(.dark .playground__editor-stack pre) { color: #dce5e8; }
:global(.dark .playground__output) { color: #dce5e8; background: #111619; }
:global(.dark .playground textarea) { caret-color: #eef6f7; }
:global(.dark .playground textarea::selection) { background: color-mix(in srgb, var(--operator-accent, var(--c-cyan)) 28%, transparent); }
:global(.dark .playground__editor-stack .token-comment) { color: #87969c; }
:global(.dark .playground__editor-stack .token-string) { color: #7ed9a5; }
:global(.dark .playground__editor-stack .token-number),
:global(.dark .playground__editor-stack .token-constant) { color: #e0bb6c; }
:global(.dark .playground__editor-stack .token-keyword),
:global(.dark .playground__editor-stack .token-operator) { color: #ff7f88; }
:global(.dark .playground__editor-stack .token-function) { color: #c39cff; }
:global(.dark .playground__editor-stack .token-type),
:global(.dark .playground__editor-stack .token-builtin) { color: #76b7ff; }
:global(.dark .playground__editor-stack .token-declaration) { color: #ffad70; }
:global(.dark .playground__editor-stack .token-variable) { color: #dce5e8; }
:global(.dark .playground__editor-stack .token-parameter) { color: #8ed5aa; }
:global(.dark .playground__editor-stack .token-property) { color: #79d7db; }
:global(.dark .playground__editor-stack .token-punctuation) { color: #a8b3b8; }
@media (max-width: 700px) {
  .playground__workspace {
    grid-template-columns: 1fr;
  }
  .playground__editor {
    border-right: 0;
    border-bottom: 1px solid var(--vp-c-divider);
  }
  .playground__actions small {
    display: none;
  }
}
</style>
