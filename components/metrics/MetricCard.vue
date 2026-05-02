<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0' }">
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
