<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div
    class="text-muted border-muted border-l-primary mt-2 border-l-2 pl-3 text-sm"
    data-testid="memory-context-preview"
  >
    {{ text }}
  </div>
</template>
