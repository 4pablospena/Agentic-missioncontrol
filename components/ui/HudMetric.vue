<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
}>()
</script>

<template>
  <div class="hud-metric panel-shell-nested rounded-lg px-3 py-2">
    <p class="text-muted text-[11px] uppercase tracking-wider">
      {{ label }}
    </p>
    <p class="text-highlighted font-metric text-lg font-semibold">
      {{ value }}
    </p>
    <p v-if="hint" class="text-muted text-xs">
      {{ hint }}
    </p>
  </div>
</template>
