<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

const props = defineProps<{
  agent: AgentSummary
  x: number
  z: number
}>()

const statusColor = computed(() => {
  if (props.agent.status === 'running')
    return '#00ff41'
  if (props.agent.status === 'idle')
    return '#22d3ee'
  if (props.agent.status === 'error')
    return '#f43f5e'
  return '#64748b'
})
</script>

<template>
  <div
    class="office-avatar absolute h-5 w-5 rounded-full border-2 shadow-md"
    :style="{
      transform: `translate3d(${x}px, -8px, ${z}px)`,
      backgroundColor: statusColor,
    }"
  />
</template>
