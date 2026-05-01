<script setup lang="ts">
import type { ScheduledTask } from '~/models/scheduler'

defineProps<{
  schedules: ScheduledTask[]
  pending?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  enable: [id: string]
  disable: [id: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="pending" class="text-muted text-sm">
      Loading schedules…
    </div>
    <UCard
      v-for="s in schedules"
      :key="s.id"
      :ui="{ body: 'p-4' }"
    >
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div class="text-highlighted font-medium">
              {{ s.taskTemplate.title }}
            </div>
            <div class="text-muted font-mono text-xs">
              {{ s.cronExpression }}
            </div>
          </div>
          <UBadge :color="s.enabled ? 'success' : 'neutral'" variant="subtle">
            {{ s.enabled ? 'enabled' : 'disabled' }}
          </UBadge>
        </div>
        <div class="text-muted text-xs">
          <span v-if="s.nextRunAt">Next: {{ s.nextRunAt }}</span>
          <span v-if="s.lastRunAt" class="ml-2">Last: {{ s.lastRunAt }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="!s.enabled"
            size="xs"
            label="Enable"
            color="neutral"
            variant="outline"
            @click="emit('enable', s.id)"
          />
          <UButton
            v-else
            size="xs"
            label="Disable"
            color="neutral"
            variant="ghost"
            @click="emit('disable', s.id)"
          />
          <UButton
            size="xs"
            label="Delete"
            color="error"
            variant="soft"
            @click="emit('remove', s.id)"
          />
        </div>
      </div>
    </UCard>
    <p v-if="!pending && !schedules.length" class="text-muted text-sm">
      No schedules yet.
    </p>
  </div>
</template>
