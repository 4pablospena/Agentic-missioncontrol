<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

const PIPELINE_META: { status: TaskStatus, title: string }[] = [
  { status: 'scheduled', title: 'Scheduled' },
  { status: 'queued', title: 'Queued' },
  { status: 'running', title: 'Running' },
]

const ARCHIVE_META: { status: TaskStatus, title: string }[] = [
  { status: 'completed', title: 'Completed' },
  { status: 'failed', title: 'Failed' },
  { status: 'cancelled', title: 'Cancelled' },
]

const props = defineProps<{
  grouped: Record<TaskStatus, AgentTask[]>
  tasksPending?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()

const archiveTotal = computed(() => {
  const g = props.grouped
  return (g.completed?.length ?? 0)
    + (g.failed?.length ?? 0)
    + (g.cancelled?.length ?? 0)
})

const archiveOpen = ref(false)

let archiveSeeded = false

watch(
  () => props.tasksPending,
  (pending, prevPending) => {
    if (archiveSeeded)
      return
    if (pending !== false || prevPending !== true)
      return
    archiveSeeded = true
    archiveOpen.value = archiveTotal.value > 0
  },
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h2 class="text-muted mb-3 text-sm font-semibold">
        Pipeline
      </h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TasksTaskColumn
          v-for="col in PIPELINE_META"
          :key="col.status"
          emphasis="primary"
          :title="col.title"
          :status="col.status"
          :tasks="grouped[col.status] ?? []"
          @select="emit('select', $event)"
          @retry="emit('retry', $event)"
          @cancel="emit('cancel', $event)"
        />
      </div>
    </div>

    <div>
      <h2 class="text-muted mb-3 text-sm font-semibold">
        Archive
      </h2>
      <UCollapsible v-model:open="archiveOpen" class="flex flex-col gap-3">
        <UButton
          class="group w-full justify-between"
          color="neutral"
          variant="outline"
          block
          :label="`Completed · failed · cancelled (${archiveTotal})`"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon:
              'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
        />

        <template #content>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TasksTaskColumn
              v-for="col in ARCHIVE_META"
              :key="col.status"
              emphasis="muted"
              :title="col.title"
              :status="col.status"
              :tasks="grouped[col.status] ?? []"
              @select="emit('select', $event)"
              @retry="emit('retry', $event)"
              @cancel="emit('cancel', $event)"
            />
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>
