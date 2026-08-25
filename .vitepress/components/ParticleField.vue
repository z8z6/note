<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  accent?: string
  secondary?: string
}>(), {
  accent: '#ef4d4f',
  secondary: '#20aeb6',
})

const canvas = ref<HTMLCanvasElement>()
let frame = 0
let resizeObserver: ResizeObserver | undefined
let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; depth: number }> = []
let pointerX = 0
let pointerY = 0

function setup() {
  const target = canvas.value
  if (!target) return
  const rect = target.getBoundingClientRect()
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  target.width = Math.max(1, Math.round(rect.width * ratio))
  target.height = Math.max(1, Math.round(rect.height * ratio))
  const count = Math.min(76, Math.max(30, Math.round(rect.width / 24)))
  particles = Array.from({ length: count }, (_, index) => ({
    x: (index * 97.3 % 100) / 100 * rect.width,
    y: (index * 53.7 % 100) / 100 * rect.height,
    vx: .045 + (index % 5) * .012,
    vy: -.035 - (index % 7) * .009,
    size: index % 11 === 0 ? 4 : index % 4 === 0 ? 2 : 1,
    depth: .25 + (index % 6) * .13,
  }))
}

function draw() {
  const target = canvas.value
  const context = target?.getContext('2d')
  if (!target || !context) return
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const width = target.width / ratio
  const height = target.height / ratio
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  for (const particle of particles) {
    particle.x += particle.vx * particle.depth
    particle.y += particle.vy * particle.depth
    if (particle.x > width + 12) particle.x = -12
    if (particle.y < -12) particle.y = height + 12
  }

  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i]
    const x = particle.x + pointerX * particle.depth * 9
    const y = particle.y + pointerY * particle.depth * 7
    const color = i % 5 === 0 ? props.accent : i % 3 === 0 ? props.secondary : '#ffffff'
    context.globalAlpha = .12 + particle.depth * .22
    context.fillStyle = color
    context.fillRect(x, y, particle.size, particle.size)

    if (i % 4 !== 0) continue
    const next = particles[(i + 9) % particles.length]
    const distance = Math.hypot(next.x - particle.x, next.y - particle.y)
    if (distance > 145) continue
    context.globalAlpha = (1 - distance / 145) * .12
    context.strokeStyle = i % 8 === 0 ? props.accent : props.secondary
    context.lineWidth = .6
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(next.x + pointerX * next.depth * 9, next.y + pointerY * next.depth * 7)
    context.stroke()
  }

  context.globalAlpha = 1
  frame = requestAnimationFrame(draw)
}

function onPointerMove(event: PointerEvent) {
  pointerX = event.clientX / window.innerWidth - .5
  pointerY = event.clientY / window.innerHeight - .5
}

onMounted(() => {
  setup()
  resizeObserver = new ResizeObserver(setup)
  if (canvas.value) resizeObserver.observe(canvas.value)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw()
  else draw(), cancelAnimationFrame(frame)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
})
</script>

<template>
  <canvas ref="canvas" class="particle-field" aria-hidden="true" />
</template>

<style scoped>
.particle-field {
  position: fixed;
  inset: 64px 0 0;
  z-index: 0;
  width: 100%;
  height: calc(100svh - 64px);
  pointer-events: none;
}
</style>
