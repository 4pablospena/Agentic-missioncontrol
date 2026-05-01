<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

defineProps<{
  title: string
  status: TaskStatus
  tasks: AgentTask[]
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()
</script>

<template>
  <div class="border-default bg-elevated/40 flex min-w-[260px] max-w-xs flex-1 flex-col rounded-lg border">
    <div class="border-default flex items-center justify-between gap-2 border-b px-3 py-2">
      <span class="text-highlighted text-sm font-semibold">{{ title }}</span>
      <UBadge color="neutral" variant="subtle">
        {{ tasks.length }}
      </UBadge>
    </div>
    <div class="flex flex-col gap-3 overflow-y-auto p-3">
      <TasksTaskCard
        v-for="t in tasks"
        :key="t.id"
        :task="t"
        @select="emit('select', $event)"
        @retry="emit('retry', $event)"
        @cancel="emit('cancel', $event)"
      />
      <p v-if="!tasks.length" class="text-muted px-1 py-6 text-center text-xs">
        No tasks
      </p>
    </div>
  </div>
</template>
