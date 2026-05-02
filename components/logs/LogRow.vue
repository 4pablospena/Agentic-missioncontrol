<script setup lang="ts">
import type { LogEntry } from '~/models/log'
import { formatIso } from '~/utils/formatDate'

withDefaults(defineProps<{
  row: LogEntry
  /** Table row (`<tr>`) vs timeline card (`<div>`). */
  variant?: 'table' | 'feed'
}>(), {
  variant: 'table',
})

function levelColor(level: LogEntry['level']): 'neutral' | 'info' | 'warning' | 'error' {
  if (level === 'error')
    return 'error'
  if (level === 'warn')
    return 'warning'
  if (level === 'debug')
    return 'neutral'
  return 'info'
}
</script>

<template>
  <tr v-if="variant === 'table'" class="border-default border-b last:border-b-0">
    <td class="text-dimmed py-2 pe-4 whitespace-nowrap">
      {{ formatIso(row.createdAt) }}
    </td>
    <td class="py-2 pe-4">
      <UBadge :color="levelColor(row.level)" variant="subtle">
        {{ row.level }}
      </UBadge>
    </td>
    <td class="text-muted py-2 pe-4 font-mono text-xs">
      {{ row.agentId ?? '—' }}
    </td>
    <td class="text-highlighted py-2 wrap-break-word">
      {{ row.message }}
    </td>
  </tr>
  <div
    v-else
    class="log-feed-row--feed panel-shell flex flex-wrap items-start gap-3 p-3"
  >
    <div class="flex min-w-28 flex-col gap-1 sm:items-start">
      <UBadge :color="levelColor(row.level)" variant="subtle" size="xs">
        {{ row.level }}
      </UBadge>
      <time class="text-dimmed font-metric text-[11px] whitespace-nowrap sm:text-xs">{{ formatIso(row.createdAt) }}</time>
    </div>
    <div class="min-w-0 flex-1 space-y-1">
      <p class="text-muted font-metric text-[11px] tracking-tight truncate sm:text-xs">
        {{ row.agentId ?? '—' }}
      </p>
      <p class="text-highlighted wrap-break-word text-sm leading-snug">
        {{ row.message }}
      </p>
    </div>
  </div>
</template>
