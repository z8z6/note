<script setup lang="ts">
import DataChart from './DataChart.vue'
defineOptions({ inheritAttrs: false })
</script>
<template><DataChart type="bar" v-bind="$attrs" /></template>
