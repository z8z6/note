<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'

type OperatorId = 'amiya' | 'w' | 'kaltsit' | 'surtr'

const operators = [
  { id: 'amiya' as const, name: '阿米娅', code: 'AM-01', accent: '#18aeb7', secondary: '#35666b', background: '#e4f2ef', surface: '#f4faf8', grid: 'rgba(24, 142, 148, .10)', avatar: '/operators/amiya.png', art: '/operators/amiya-art.png' },
  { id: 'w' as const, name: 'W', code: 'W-07', accent: '#ee4f52', secondary: '#20aeb6', background: '#f5e8e4', surface: '#fff5f1', grid: 'rgba(184, 58, 64, .09)', avatar: '/operators/w.png', art: '/operators/w-art.png' },
  { id: 'kaltsit' as const, name: '凯尔希', code: 'KS-03', accent: '#91ad54', secondary: '#536b59', background: '#ebf0df', surface: '#f6f8ef', grid: 'rgba(91, 118, 57, .10)', avatar: '/operators/kaltsit.png', art: '/operators/kaltsit-art.png' },
  { id: 'surtr' as const, name: '史尔特尔', code: 'ST-09', accent: '#ef6a32', secondary: '#9d2e29', background: '#f7e7da', surface: '#fff3e8', grid: 'rgba(183, 73, 38, .09)', avatar: '/operators/surtr.png', art: '/operators/surtr-art.png' },
]

const route = useRoute()
const activeId = ref<OperatorId>('w')
const active = computed(() => operators.find((item) => item.id === activeId.value) || operators[1])
const isHome = computed(() => route.path === '/' || route.path === '/en/')
let tiltedScreen: HTMLElement | undefined

function applyTheme(id: OperatorId, persist = false) {
  if (!operators.some((item) => item.id === id)) return
  activeId.value = id
  const operator = operators.find((item) => item.id === id)!
  document.documentElement.dataset.operator = id
  document.documentElement.style.setProperty('--operator-accent', operator.accent)
  document.documentElement.style.setProperty('--operator-secondary', operator.secondary)
  document.documentElement.style.setProperty('--operator-bg', operator.background)
  document.documentElement.style.setProperty('--operator-surface', operator.surface)
  document.documentElement.style.setProperty('--operator-grid', operator.grid)
  if (persist) localStorage.setItem('cxxcxx-operator-theme', id)
}

function cycleTheme() {
  const index = operators.findIndex((item) => item.id === activeId.value)
  const next = operators[(index + 1) % operators.length]
  applyTheme(next.id, true)
  window.dispatchEvent(new CustomEvent('operator-theme-change', { detail: next.id }))
}

function onThemeChange(event: Event) {
  applyTheme((event as CustomEvent<OperatorId>).detail)
}

function onStorage(event: StorageEvent) {
  if (event.key === 'cxxcxx-operator-theme' && event.newValue) applyTheme(event.newValue as OperatorId)
}

function resetTilt(screen?: HTMLElement) {
  if (!screen) return
  screen.style.removeProperty('--code-rotate-x')
  screen.style.removeProperty('--code-rotate-y')
  screen.style.removeProperty('--code-shine-x')
  screen.style.removeProperty('--code-shine-y')
  screen.classList.remove('code-screen-tilt')
  if (tiltedScreen === screen) tiltedScreen = undefined
}

function onCodeMove(event: PointerEvent) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const screen = (event.target as HTMLElement).closest<HTMLElement>('.vp-doc div[class*="language-"], .playground')
  if (!screen) {
    resetTilt(tiltedScreen)
    return
  }
  if (tiltedScreen && tiltedScreen !== screen) resetTilt(tiltedScreen)
  tiltedScreen = screen
  const bounds = screen.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
  const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
  const isPlayground = screen.classList.contains('playground')
  const rotateX = isPlayground ? 1.6 : 5
  const rotateY = isPlayground ? 2.4 : 7
  screen.style.setProperty('--code-rotate-x', `${((.5 - y) * rotateX).toFixed(2)}deg`)
  screen.style.setProperty('--code-rotate-y', `${((x - .5) * rotateY).toFixed(2)}deg`)
  screen.style.setProperty('--code-shine-x', `${(x * 100).toFixed(1)}%`)
  screen.style.setProperty('--code-shine-y', `${(y * 100).toFixed(1)}%`)
  screen.classList.add('code-screen-tilt')
}

function onCodeOut(event: PointerEvent) {
  const screen = (event.target as HTMLElement).closest<HTMLElement>('.vp-doc div[class*="language-"], .playground')
  if (!screen || (event.relatedTarget instanceof Node && screen.contains(event.relatedTarget))) return
  resetTilt(screen)
}

onMounted(() => {
  applyTheme((localStorage.getItem('cxxcxx-operator-theme') as OperatorId | null) || 'w')
  window.addEventListener('operator-theme-change', onThemeChange)
  window.addEventListener('storage', onStorage)
  document.addEventListener('pointermove', onCodeMove)
  document.addEventListener('pointerout', onCodeOut)
})

onBeforeUnmount(() => {
  window.removeEventListener('operator-theme-change', onThemeChange)
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('pointermove', onCodeMove)
  document.removeEventListener('pointerout', onCodeOut)
  resetTilt(tiltedScreen)
})
</script>

<template>
  <div v-if="!isHome" class="operator-page-aura" aria-hidden="true">
    <img :key="active.id" class="operator-page-aura__art" :src="active.art" alt="" />
    <span class="operator-page-aura__scan" />
  </div>
  <button
    v-if="!isHome"
    class="operator-page-badge"
    type="button"
    :title="`当前干员：${active.name}；点击切换`"
    @click="cycleTheme"
  >
    <img :src="active.avatar" alt="" />
    <span><small>OPERATOR LINK</small><b>{{ active.name }}</b><em>{{ active.code }}</em></span>
    <i />
  </button>
</template>
