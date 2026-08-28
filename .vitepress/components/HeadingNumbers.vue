<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const route = useRoute()
const { frontmatter } = useData()
let observer: MutationObserver | undefined
let frame = 0

const excludedContainers = [
  '.parallel-tables',
  '.code-compare',
  '.playground',
  '.custom-block',
  '[data-heading-numbers="false"]',
].join(',')

function clearNumbers() {
  document.querySelectorAll<HTMLElement>('.has-heading-number[data-heading-number]').forEach(element => {
    delete element.dataset.headingNumber
    element.classList.remove('has-heading-number')
  })
}

function applyNumbers() {
  frame = 0
  clearNumbers()
  if (frontmatter.value.headingNumbers === false) return

  const content = document.querySelector('.VPContent .vp-doc')
  if (!content) return

  const counters = [0, 0, 0, 0, 0, 0, 0]
  const numbered = new Map<string, string>()

  content.querySelectorAll<HTMLElement>('h2[id], h3[id], h4[id], h5[id], h6[id]').forEach(heading => {
    if (heading.classList.contains('no-number') || heading.dataset.noNumber !== undefined) return
    if (heading.closest(excludedContainers)) return

    const level = Number(heading.tagName.slice(1))
    counters[level] += 1
    for (let deeper = level + 1; deeper <= 6; deeper += 1) counters[deeper] = 0

    const number = counters
      .slice(2, level + 1)
      .filter(value => value > 0)
      .join('.')

    heading.dataset.headingNumber = number
    heading.classList.add('has-heading-number')
    numbered.set(heading.id, number)
  })

  document.querySelectorAll<HTMLElement>('.VPDocAsideOutline .outline-link, .VPLocalNavOutlineDropdown a').forEach(link => {
    const href = link.getAttribute('href') || ''
    if (!href.startsWith('#')) return
    const id = decodeURIComponent(href.slice(1))
    const number = numbered.get(id)
    if (!number) return
    link.dataset.headingNumber = number
    link.classList.add('has-heading-number')
  })
}

function scheduleNumbers() {
  if (frame) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(applyNumbers)
}

async function refresh() {
  await nextTick()
  scheduleNumbers()
}

onMounted(() => {
  refresh()
  observer = new MutationObserver(scheduleNumbers)
  observer.observe(document.querySelector('.VPContent') || document.body, { childList: true, subtree: true })
})

watch(() => route.path, refresh)
watch(() => frontmatter.value.headingNumbers, refresh)

onBeforeUnmount(() => {
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
  clearNumbers()
})
</script>

<template />
