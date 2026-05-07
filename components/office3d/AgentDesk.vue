<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

defineProps<{
  agent: AgentSummary
  x: number
  z: number
}>()
</script>

<template>
  <div
    class="office-desk absolute rounded-md border px-2 py-1 text-xs"
    :style="{
      transform: `translate3d(${x}px, 0px, ${z}px)`,
    }"
  >
    <p class="text-highlighted truncate font-semibold">
      {{ agent.name }}
    </p>
    <p class="text-muted truncate">
      {{ agent.model || 'unknown' }}
    </p>
  </div>
</template>
