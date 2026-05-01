<script setup lang="ts">
import type { TimelineEvent } from '~/models/timeline'

defineProps<{
  events: TimelineEvent[]
}>()

function truncateMeta(meta: Record<string, unknown> | undefined): string {
  if (!meta || Object.keys(meta).length === 0)
    return ''
  try {
    const s = JSON.stringify(meta)
    return s.length > 120 ? `${s.slice(0, 117)}…` : s
  }
  catch {
    return ''
  }
}
</script>

<template>
  <ul class="border-default divide-default divide-y rounded-lg border">
    <li
      v-for="ev in events"
      :key="ev.id"
      class="flex flex-col gap-1 px-3 py-3 sm:flex-row sm:gap-4"
    >
      <span class="text-dimmed w-44 shrink-0 text-xs whitespace-nowrap">
        {{ new Date(ev.createdAt).toLocaleString() }}
      </span>
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="subtle" size="xs">
            {{ ev.type }}
          </UBadge>
          <span v-if="ev.agentId" class="text-muted font-mono text-xs">{{ ev.agentId }}</span>
        </div>
        <p class="text-highlighted text-sm">
          {{ ev.summary ?? ev.message }}
        </p>
        <p v-if="truncateMeta(ev.metadata)" class="text-muted font-mono text-xs wrap-break-word">
          {{ truncateMeta(ev.metadata) }}
        </p>
      </div>
    </li>
  </ul>
  <p v-if="!events.length" class="text-muted mt-3 text-sm">
    No events for this session.
  </p>
</template>
