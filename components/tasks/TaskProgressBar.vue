<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
}>()

const pct = computed(() => Math.min(100, Math.max(0, props.progress)))
</script>

<template>
  <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
    <div
      class="bg-primary h-full rounded-full transition-[width]"
      :style="{ width: `${pct}%` }"
    />
  </div>
</template>
