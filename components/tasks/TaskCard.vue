<script setup lang="ts">
import type { AgentTask } from '~/models/task'

defineProps<{
  task: AgentTask
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()
</script>

<template>
  <UCard
    class="cursor-pointer ring-default hover:ring-2"
    :ui="{ body: 'p-3 sm:p-4' }"
    @click="emit('select', task.id)"
  >
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <span class="text-highlighted font-medium leading-snug">{{ task.title }}</span>
        <TasksTaskStatusBadge :status="task.status" />
      </div>
      <p v-if="task.description" class="text-muted line-clamp-2 text-xs">
        {{ task.description }}
      </p>
      <TasksTaskProgressBar :progress="task.progress" />
      <div class="text-muted flex flex-wrap gap-2 text-xs">
        <span v-if="task.assignedAgentId">
          Agent: {{ task.assignedAgentId }}
        </span>
        <span class="capitalize">
          {{ task.priority }}
        </span>
      </div>
      <div v-if="task.error" class="text-error text-xs">
        {{ task.error }}
      </div>
      <div class="flex flex-wrap gap-2" @click.stop>
        <UButton
          v-if="task.status === 'failed'"
          data-testid="task-retry"
          size="xs"
          color="neutral"
          variant="outline"
          label="Retry"
          @click="emit('retry', task.id)"
        />
        <UButton
          v-if="task.status === 'queued' || task.status === 'running' || task.status === 'scheduled'"
          data-testid="task-cancel"
          size="xs"
          color="neutral"
          variant="ghost"
          label="Cancel"
          @click="emit('cancel', task.id)"
        />
      </div>
    </div>
  </UCard>
</template>
