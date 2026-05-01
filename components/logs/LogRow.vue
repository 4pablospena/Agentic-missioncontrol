<script setup lang="ts">
import type { LogEntry } from '~/models/log'
import { formatIso } from '~/utils/formatDate'

defineProps<{
  row: LogEntry
}>()

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
  <tr class="border-default border-b last:border-b-0">
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
</template>
