<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}>(), {
  tone: 'default',
})

const toneClassMap: Record<string, string> = {
  default: 'hud-chip',
  success: 'hud-chip hud-chip--success',
  warning: 'hud-chip hud-chip--warning',
  danger: 'hud-chip hud-chip--danger',
}
</script>

<template>
  <span :class="toneClassMap[tone]">
    {{ label }}
  </span>
</template>
