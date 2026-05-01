<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
}>()
</script>

<template>
  <UCard>
    <p class="text-muted text-xs font-medium uppercase tracking-wide">
      {{ title }}
    </p>
    <p class="text-highlighted mt-1 text-2xl font-semibold tabular-nums">
      {{ value }}
    </p>
    <p v-if="description" class="text-muted mt-1 text-xs">
      {{ description }}
    </p>
  </UCard>
</template>
