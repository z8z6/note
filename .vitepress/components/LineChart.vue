<script setup lang="ts">
import DataChart from './DataChart.vue'
defineOptions({ inheritAttrs: false })
</script>
<template><DataChart type="line" v-bind="$attrs" /></template>
