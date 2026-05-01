<script setup lang="ts">
import type { LogEntry } from '~/models/log'

defineProps<{
  logs: LogEntry[]
  pending?: boolean
}>()
</script>

<template>
  <div class="overflow-x-auto">
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
        <LogRow v-for="row in logs" :key="row.id" :row="row" />
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
</template>
