<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'

defineProps<{
  agents: AgentSummary[]
  loading?: boolean
  error?: string | null
}>()
</script>

<template>
  <div>
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Agents"
      :description="error"
      class="mb-4"
    />

    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr class="border-default text-muted border-b">
            <th class="pb-2 pe-3 font-medium">
              Name
            </th>
            <th class="pb-2 pe-3 font-medium">
              Status
            </th>
            <th class="pb-2 pe-3 font-medium">
              Model
            </th>
            <th class="pb-2 pe-3 font-medium">
              Action
            </th>
            <th class="pb-2 pe-3 font-medium">
              Task
            </th>
            <th class="pb-2 pe-3 font-medium">
              Tokens
            </th>
            <th class="pb-2 font-medium">
              Last seen
            </th>
          </tr>
        </thead>
        <tbody class="divide-default divide-y">
          <tr v-for="a in agents" :key="a.id">
            <td class="text-highlighted py-2 pe-3 font-medium">
              {{ a.name }}
            </td>
            <td class="py-2 pe-3">
              <AgentStatusBadge :status="a.status" />
            </td>
            <td class="text-muted py-2 pe-3 font-mono text-xs">
              {{ a.model || '—' }}
            </td>
            <td class="text-muted py-2 pe-3">
              {{ a.currentAction ?? '—' }}
            </td>
            <td class="text-muted py-2 pe-3 font-mono text-xs">
              {{ a.currentTaskId ?? '—' }}
            </td>
            <td class="text-muted py-2 pe-3">
              {{ a.tokenUsage }}
            </td>
            <td class="text-dimmed py-2 text-xs whitespace-nowrap">
              {{ a.lastSeenAt ? new Date(a.lastSeenAt).toLocaleString() : '—' }}
            </td>
          </tr>
          <tr v-if="!agents.length && !loading">
            <td colspan="7" class="text-muted py-6 text-center">
              No agents loaded.
            </td>
          </tr>
          <tr v-if="loading && !agents.length">
            <td colspan="7" class="text-muted py-6 text-center">
              Loading…
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
