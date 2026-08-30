<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useData } from 'vitepress'
import { data as notes } from '../archive.data'

const { lang } = useData()
const activeTopic = ref('全部')
let revealObserver: IntersectionObserver | undefined
const isEnglish = computed(() => lang.value.startsWith('en'))
const localizedNotes = computed(() => notes.filter(note => note.locale === (isEnglish.value ? 'en' : 'zh')))
const topics = computed(() => ['全部', ...new Set(localizedNotes.value.map(note => note.topic))])
const visibleNotes = computed(() => activeTopic.value === '全部'
  ? localizedNotes.value
  : localizedNotes.value.filter(note => note.topic === activeTopic.value))
const timelineGroups = computed(() => {
  const groups = new Map<string, typeof notes>()
  for (const note of visibleNotes.value) {
    const group = groups.get(note.date) || []
    group.push(note)
    groups.set(note.date, group)
  }
  return [...groups].map(([date, groupNotes]) => ({ date, notes: groupNotes }))
})

function topicLabel(topic: string) {
  return isEnglish.value && topic === '全部' ? 'All' : topic
}

function formatDate(date: string) {
  if (!date) return isEnglish.value ? 'Undated' : '日期未标注'
  const value = new Date(`${date}T00:00:00`)
  if (Number.isNaN(value.getTime())) return date
  return new Intl.DateTimeFormat(isEnglish.value ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: isEnglish.value ? 'short' : 'long',
    day: 'numeric',
  }).format(value)
}

function noteNumber(url: string) {
  return String(visibleNotes.value.findIndex(note => note.url === url) + 1).padStart(2, '0')
}

function observeReveal(element: HTMLElement) {
  if (!('IntersectionObserver' in window)) return
  element.classList.add('is-reveal-pending')
  revealObserver ||= new IntersectionObserver((entries) => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
      const card = entry.target as HTMLElement
      card.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`)
      card.classList.add('is-revealed')
      card.addEventListener('animationend', () => {
        card.classList.remove('is-reveal-pending', 'is-revealed')
        card.style.removeProperty('--reveal-delay')
      }, { once: true })
      revealObserver?.unobserve(card)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' })
  revealObserver.observe(element)
}

const vReveal = {
  mounted: observeReveal,
  unmounted(element: HTMLElement) {
    revealObserver?.unobserve(element)
  },
}

onBeforeUnmount(() => revealObserver?.disconnect())
</script>

<template>
  <div class="archive-index">
    <header class="archive-index__header">
      <p>FIELD ARCHIVE / {{ String(localizedNotes.length).padStart(2, '0') }} RECORDS</p>
      <h1>{{ isEnglish ? 'Archive' : '笔记归档' }}</h1>
      <span>{{ isEnglish ? 'Browse field notes by topic.' : '按主题浏览 Markdown 驱动的技术记录。' }}</span>
    </header>

    <nav class="archive-index__filters" :aria-label="isEnglish ? 'Filter by topic' : '按主题筛选'">
      <button
        v-for="topic in topics"
        :key="topic"
        type="button"
        :class="{ active: activeTopic === topic }"
        @click="activeTopic = topic"
      >
        {{ topicLabel(topic) }}
        <small>{{ topic === '全部' ? localizedNotes.length : localizedNotes.filter(note => note.topic === topic).length }}</small>
      </button>
    </nav>

    <TransitionGroup name="archive-date" tag="div" class="archive-index__timeline">
      <section v-for="group in timelineGroups" :key="group.date || 'undated'" class="archive-timeline__group">
        <time :datetime="group.date">{{ formatDate(group.date) }}</time>
        <i class="archive-timeline__marker" aria-hidden="true" />
        <TransitionGroup name="archive-card" tag="div" class="archive-timeline__cards">
        <article v-for="note in group.notes" :key="note.url" v-reveal class="note-card">
          <a
            class="note-card__cover"
            :class="{
              'is-language-icon': note.cover.startsWith('/note-covers/'),
              'is-c-family': note.cover.endsWith('/c-family.png'),
              'is-riscv': note.cover.endsWith('/risc-v-logo.svg'),
            }"
            :href="note.url"
            :aria-label="note.title"
          >
            <img :src="note.cover" alt="" loading="lazy">
            <span>{{ note.language }}</span>
            <i>{{ noteNumber(note.url) }}</i>
          </a>
          <div class="note-card__body">
            <p><span>{{ note.topic }}</span><small>{{ note.language }}</small></p>
            <h2><a :href="note.url">{{ note.title }}</a></h2>
            <div class="note-card__description" v-html="note.descriptionHtml" />
            <footer><a :href="note.url">{{ isEnglish ? 'OPEN RECORD' : '读取记录' }} <b>↗</b></a></footer>
          </div>
        </article>
        </TransitionGroup>
      </section>
    </TransitionGroup>
  </div>
</template>
