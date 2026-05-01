<script setup lang="ts">
import type { AgentStatus } from '~/models/agent'

defineProps<{
  status: AgentStatus
}>()

function color(
  status: AgentStatus,
): 'neutral' | 'primary' | 'error' | 'warning' {
  if (status === 'error')
    return 'error'
  if (status === 'running')
    return 'primary'
  if (status === 'offline')
    return 'warning'
  return 'neutral'
}
</script>

<template>
  <UBadge :color="color(status)" variant="subtle">
    {{ status }}
  </UBadge>
</template>
