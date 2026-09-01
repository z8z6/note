<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

type Edge = 'left' | 'right'

const route = useRoute()
const hasSidebar = ref(false)
const hasOutline = ref(false)
const hideTimers: Partial<Record<Edge, ReturnType<typeof setTimeout>>> = {}
let detachPanels = () => {}
let scrollFrame = 0

function className(edge: Edge) {
  return edge === 'left' ? 'edge-nav-left-open' : 'edge-nav-right-open'
}

function scrollToActiveSidebarItem() {
  scrollFrame = 0
  const sidebar = document.querySelector<HTMLElement>('.VPSidebar')
  const activeItem = sidebar?.querySelector<HTMLElement>([
    '.VPSidebarItem.is-active > .item .link',
    '.VPSidebarItem.is-active > .item',
    'a.VPLink.link.active',
  ].join(','))
  if (!sidebar || !activeItem) return

  const sidebarRect = sidebar.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()
  const centeredTop = sidebar.scrollTop
    + itemRect.top
    - sidebarRect.top
    - (sidebar.clientHeight - itemRect.height) / 2

  sidebar.scrollTo({
    top: Math.max(0, centeredTop),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}

function scheduleActiveItemScroll() {
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(scrollToActiveSidebarItem)
}

function reveal(edge: Edge) {
  if (hideTimers[edge]) clearTimeout(hideTimers[edge])
  const wasOpen = document.documentElement.classList.contains(className(edge))
  document.documentElement.classList.add(className(edge))
  if (edge === 'left' && !wasOpen) scheduleActiveItemScroll()
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
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
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
