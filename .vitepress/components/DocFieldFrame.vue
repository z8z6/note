<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter, lang } = useData()

const path = computed(() => page.value.relativePath.replace(/\.md$/, ''))
const record = computed(() => {
  let value = 2166136261
  for (const char of path.value) {
    value ^= char.charCodeAt(0)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, 8)
})

const division = computed(() => {
  if (path.value.includes('/cxx/')) return 'ENGINEERING / CXX'
  if (path.value.includes('/asm/')) return 'SYSTEMS / ASSEMBLY'
  if (path.value.includes('/bash')) return 'OPERATIONS / SHELL'
  if (path.value.includes('/git/')) return 'LOGISTICS / GIT'
  if (path.value.includes('/gcc/')) return 'ENGINEERING / TOOLCHAIN'
  if (path.value.includes('/lab/')) return 'R&D / SANDBOX'
  return 'RHODES ISLAND / ARCHIVE'
})

const clearance = computed(() => {
  const level = (Number.parseInt(record.value.slice(-2), 16) % 3) + 2
  return `LV-${level}`
})

const writtenDateIso = computed(() => {
  const raw = frontmatter.value.date
  if (!raw) return ''
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  return String(raw).match(/^\d{4}-\d{2}-\d{2}/)?.[0] || String(raw)
})

const writtenDate = computed(() => {
  if (!writtenDateIso.value) return ''
  const value = new Date(`${writtenDateIso.value}T00:00:00`)
  if (Number.isNaN(value.getTime())) return writtenDateIso.value
  return new Intl.DateTimeFormat(lang.value.startsWith('en') ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: lang.value.startsWith('en') ? 'short' : 'long',
    day: 'numeric',
  }).format(value)
})
</script>

<template>
  <aside class="doc-field-frame" aria-label="文档档案信息">
    <div class="doc-field-frame__brand" aria-hidden="true">
      <img src="/prts-icon-hd.png" alt="">
    </div>
    <div class="doc-field-frame__main">
      <span class="doc-field-frame__eyebrow">RHODES ISLAND · PRTS KNOWLEDGE TERMINAL</span>
      <strong>{{ division }}</strong>
      <span class="doc-field-frame__route">/{{ path }}</span>
      <time v-if="writtenDate" class="doc-field-frame__date" :datetime="writtenDateIso">
        <i aria-hidden="true" />{{ lang.startsWith('en') ? 'WRITTEN' : '撰写于' }} · {{ writtenDate }}
      </time>
    </div>
    <dl class="doc-field-frame__meta">
      <div><dt>RECORD</dt><dd>{{ record }}</dd></div>
      <div><dt>CLEARANCE</dt><dd>{{ clearance }}</dd></div>
      <div><dt>STATUS</dt><dd class="is-online"><i /> ONLINE</dd></div>
    </dl>
    <span class="doc-field-frame__barcode" aria-hidden="true" />
  </aside>
</template>
