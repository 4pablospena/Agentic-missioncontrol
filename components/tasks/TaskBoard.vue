<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

const COLUMN_META: { status: TaskStatus, title: string }[] = [
  { status: 'scheduled', title: 'Scheduled' },
  { status: 'queued', title: 'Queued' },
  { status: 'running', title: 'Running' },
  { status: 'completed', title: 'Completed' },
  { status: 'failed', title: 'Failed' },
  { status: 'cancelled', title: 'Cancelled' },
]

defineProps<{
  grouped: Record<TaskStatus, AgentTask[]>
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-2">
    <TasksTaskColumn
      v-for="col in COLUMN_META"
      :key="col.status"
      :title="col.title"
      :status="col.status"
      :tasks="grouped[col.status] ?? []"
      @select="emit('select', $event)"
      @retry="emit('retry', $event)"
      @cancel="emit('cancel', $event)"
    />
  </div>
</template>
