<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

withDefaults(defineProps<{
  agent: AgentSummary
  /** Dense grid tiles (Agents control room). */
  dense?: boolean
}>(), {
  dense: false,
})
</script>

<template>
  <UCard
    class="panel-shell-nested hover:bg-elevated/45 transition-colors"
    :ui="{ body: dense ? 'p-3' : 'p-4 sm:p-4' }"
  >
    <div class="flex items-start justify-between gap-2" :class="{ 'gap-1.5': dense }">
      <div class="min-w-0">
        <p class="text-highlighted font-semibold" :class="dense ? 'text-sm leading-snug' : ''">
          {{ agent.name }}
        </p>
        <p class="text-muted truncate font-mono text-[11px] leading-tight" :title="agent.id">
          {{ agent.id }}
        </p>
      </div>
      <AgentStatusBadge :status="agent.status" />
    </div>
    <div class="text-muted grid gap-0.5" :class="dense ? 'mt-2 text-[11px]' : 'gap-1 text-xs'">
      <p class="flex flex-wrap items-baseline gap-x-1 gap-y-0">
        <span class="text-dimmed shrink-0">Model</span>
        <span class="font-metric min-w-0 truncate">{{ agent.model || '—' }}</span>
      </p>
      <p>
        <span class="text-dimmed">Tokens</span>
        {{ agent.tokenUsage }}
      </p>
      <p v-if="agent.currentAction" class="truncate" :title="agent.currentAction">
        <span class="text-dimmed">Action</span>
        {{ agent.currentAction }}
      </p>
    </div>
  </UCard>
</template>
