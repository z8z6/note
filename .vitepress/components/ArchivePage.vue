<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { data as notes } from '../archive.data'

const { lang } = useData()
const activeTopic = ref('全部')
const isEnglish = computed(() => lang.value.startsWith('en'))
const localizedNotes = computed(() => notes.filter(note => note.locale === (isEnglish.value ? 'en' : 'zh')))
const topics = computed(() => ['全部', ...new Set(localizedNotes.value.map(note => note.topic))])
const visibleNotes = computed(() => activeTopic.value === '全部'
  ? localizedNotes.value
  : localizedNotes.value.filter(note => note.topic === activeTopic.value))

function topicLabel(topic: string) {
  return isEnglish.value && topic === '全部' ? 'All' : topic
}
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

    <div class="archive-index__grid">
      <a v-for="(note, index) in visibleNotes" :key="note.url" class="note-card" :href="note.url">
        <figure
          class="note-card__cover"
          :class="{
            'is-language-icon': note.cover.startsWith('/note-covers/'),
            'is-c-family': note.cover.endsWith('/c-family.png'),
          }"
        >
          <img :src="note.cover" alt="" loading="lazy">
          <span>{{ note.language }}</span>
          <i>{{ String(index + 1).padStart(2, '0') }}</i>
        </figure>
        <div class="note-card__body">
          <p><span>{{ note.topic }}</span><small>{{ note.language }}</small></p>
          <h2>{{ note.title }}</h2>
          <div>{{ note.description }}</div>
          <footer>{{ isEnglish ? 'OPEN RECORD' : '读取记录' }} <b>↗</b></footer>
        </div>
      </a>
    </div>
  </div>
</template>
