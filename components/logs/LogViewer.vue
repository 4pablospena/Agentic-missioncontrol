<script setup lang="ts">
import type { LogEntry } from '~/models/log'

withDefaults(defineProps<{
  logs: LogEntry[]
  pending?: boolean
  /** Dense rows for dashboard widgets. */
  compact?: boolean
  /** Legacy table vs timeline feed (TenacitOS-style observability strip). */
  layout?: 'table' | 'timeline'
}>(), {
  layout: 'timeline',
})
</script>

<template>
  <div class="relative">
    <div
      v-if="layout === 'timeline'"
      class="log-feed log-feed--timeline max-h-[min(72vh,540px)] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin]"
      :class="{ 'log-feed--compact gap-2': compact }"
    >
      <LogsLogRow v-for="row in logs" :key="row.id" variant="feed" :row="row" />
      <p v-if="!logs.length && !pending" class="text-muted px-2 py-8 text-center text-sm">
        No log entries match.
      </p>
      <p v-if="pending && !logs.length" class="text-muted px-2 py-8 text-center text-sm">
        Loading…
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr class="border-default text-muted border-b">
            <th class="pb-2 pe-4 font-medium">
              Time
            </th>
            <th class="pb-2 pe-4 font-medium">
              Level
            </th>
            <th class="pb-2 pe-4 font-medium">
              Agent
            </th>
            <th class="pb-2 font-medium">
              Message
            </th>
          </tr>
        </thead>
        <tbody class="divide-default divide-y">
          <LogsLogRow v-for="row in logs" :key="row.id" variant="table" :row="row" />
          <tr v-if="!logs.length && !pending">
            <td colspan="4" class="text-muted py-6 text-center">
              No log entries match.
            </td>
          </tr>
          <tr v-if="pending && !logs.length">
            <td colspan="4" class="text-muted py-6 text-center">
              Loading…
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
