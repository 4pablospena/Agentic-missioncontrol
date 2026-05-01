<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

defineProps<{
  agent: AgentSummary
}>()
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-highlighted font-semibold">
          {{ agent.name }}
        </p>
        <p class="text-muted font-mono text-xs">
          {{ agent.id }}
        </p>
      </div>
      <AgentStatusBadge :status="agent.status" />
    </div>
    <div class="text-muted grid gap-1 text-xs">
      <p><span class="text-dimmed">Model:</span> {{ agent.model || '—' }}</p>
      <p><span class="text-dimmed">Tokens:</span> {{ agent.tokenUsage }}</p>
      <p v-if="agent.currentAction">
        <span class="text-dimmed">Action:</span> {{ agent.currentAction }}
      </p>
    </div>
  </UCard>
</template>
