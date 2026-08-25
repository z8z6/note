<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

type Edge = 'left' | 'right'

const route = useRoute()
const hasSidebar = ref(false)
const hasOutline = ref(false)
const hideTimers: Partial<Record<Edge, ReturnType<typeof setTimeout>>> = {}
let detachPanels = () => {}

function className(edge: Edge) {
  return edge === 'left' ? 'edge-nav-left-open' : 'edge-nav-right-open'
}

function reveal(edge: Edge) {
  if (hideTimers[edge]) clearTimeout(hideTimers[edge])
  document.documentElement.classList.add(className(edge))
}

function conceal(edge: Edge) {
  document.documentElement.classList.remove(className(edge))
}

function scheduleConceal(edge: Edge) {
  if (hideTimers[edge]) clearTimeout(hideTimers[edge])
  hideTimers[edge] = setTimeout(() => conceal(edge), 220)
}

function bindPanel(panel: HTMLElement | null, edge: Edge) {
  if (!panel) return () => {}
  const enter = () => reveal(edge)
  const leave = () => scheduleConceal(edge)
  panel.addEventListener('pointerenter', enter)
  panel.addEventListener('pointerleave', leave)
  return () => {
    panel.removeEventListener('pointerenter', enter)
    panel.removeEventListener('pointerleave', leave)
  }
}

async function detectNavigation() {
  await nextTick()
  detachPanels()
  const sidebar = document.querySelector<HTMLElement>('.VPSidebar')
  const outline = document.querySelector<HTMLElement>('.VPDoc .aside')
  hasSidebar.value = Boolean(sidebar)
  hasOutline.value = Boolean(outline)
  const detachLeft = bindPanel(sidebar, 'left')
  const detachRight = bindPanel(outline, 'right')
  detachPanels = () => {
    detachLeft()
    detachRight()
  }
  conceal('left')
  conceal('right')
}

onMounted(detectNavigation)
watch(() => route.path, detectNavigation)

onBeforeUnmount(() => {
  Object.values(hideTimers).forEach((timer) => clearTimeout(timer))
  detachPanels()
  conceal('left')
  conceal('right')
})
</script>

<template>
  <div
    v-if="hasSidebar"
    class="edge-nav-sensor edge-nav-sensor--left"
    aria-hidden="true"
    @pointerenter="reveal('left')"
    @pointerleave="scheduleConceal('left')"
  ><span>目录</span><i /></div>
  <div
    v-if="hasOutline"
    class="edge-nav-sensor edge-nav-sensor--right"
    aria-hidden="true"
    @pointerenter="reveal('right')"
    @pointerleave="scheduleConceal('right')"
  ><span>本页</span><i /></div>
</template>
