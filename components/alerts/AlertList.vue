<script setup lang="ts">
import type { Alert } from '~/models/alert'

defineProps<{
  alerts: Alert[]
  loading?: boolean
  acknowledgePendingId?: string | null
}>()

const emit = defineEmits<{
  acknowledge: [id: string]
}>()

function severityColor(s: Alert['severity']): 'neutral' | 'warning' | 'error' {
  if (s === 'critical')
    return 'error'
  if (s === 'warning')
    return 'warning'
  return 'neutral'
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="a in alerts"
      :key="a.id"
      class="border-default flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="severityColor(a.severity)" variant="subtle">
            {{ a.severity }}
          </UBadge>
          <span v-if="a.acknowledged" class="text-muted text-xs">Acknowledged</span>
        </div>
        <p class="text-highlighted font-medium">
          {{ a.title }}
        </p>
        <p class="text-muted text-sm">
          {{ a.message }}
        </p>
        <p class="text-dimmed text-xs">
          {{ new Date(a.createdAt).toLocaleString() }}
          <span v-if="a.agentId" class="ms-2 font-mono">{{ a.agentId }}</span>
        </p>
      </div>
      <UButton
        v-if="!a.acknowledged"
        label="Acknowledge"
        color="neutral"
        variant="outline"
        size="sm"
        class="shrink-0"
        :loading="acknowledgePendingId === a.id"
        @click="emit('acknowledge', a.id)"
      />
    </div>
    <p v-if="!alerts.length && !loading" class="text-muted text-sm">
      No alerts.
    </p>
    <p v-if="loading && !alerts.length" class="text-muted text-sm">
      Loading alerts…
    </p>
  </div>
</template>
