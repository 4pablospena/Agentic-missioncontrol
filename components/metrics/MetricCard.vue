<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
    <p class="text-muted font-metric text-xs font-medium uppercase tracking-wide">
      {{ title }}
    </p>
    <p class="text-highlighted font-metric mt-1 text-2xl font-semibold tabular-nums tracking-tight">
      {{ value }}
    </p>
    <p v-if="description" class="text-muted mt-1 text-xs">
      {{ description }}
    </p>
  </UCard>
</template>
