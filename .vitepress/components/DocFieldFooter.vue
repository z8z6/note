<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const code = computed(() => page.value.relativePath.replace(/[^a-z0-9]/gi, '').slice(-12).toUpperCase() || 'ROOT')
</script>

<template>
  <div class="doc-field-footer" aria-hidden="true">
    <span>PRTS // RECORD COMPLETE</span>
    <i />
    <span>{{ code }} · 罗德岛工程部归档</span>
  </div>
</template>
