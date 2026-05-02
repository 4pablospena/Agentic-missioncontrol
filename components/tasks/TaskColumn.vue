<script setup lang="ts">
import type { AgentTask, TaskStatus } from '~/models/task'

const props = withDefaults(
  defineProps<{
    title: string
    status: TaskStatus
    tasks: AgentTask[]
    emphasis?: 'primary' | 'muted'
  }>(),
  { emphasis: 'primary' },
)

const emit = defineEmits<{
  select: [id: string]
  retry: [id: string]
  cancel: [id: string]
}>()

const rootUi = computed(() =>
  props.emphasis === 'muted'
    ? 'border-default/60 bg-elevated/25'
    : 'border-default bg-elevated/40',
)
</script>

<template>
  <div
    class="flex min-h-0 w-full min-w-0 max-h-[min(70vh,40rem)] flex-col rounded-lg border"
    :class="rootUi"
  >
    <div class="border-default flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
      <span class="text-highlighted text-sm font-semibold">{{ title }}</span>
      <UBadge color="neutral" variant="subtle">
        {{ tasks.length }}
      </UBadge>
    </div>
    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
      <TasksTaskCard
        v-for="t in tasks"
        :key="t.id"
        :task="t"
        @select="emit('select', $event)"
        @retry="emit('retry', $event)"
        @cancel="emit('cancel', $event)"
      />
      <CommonEmptyState
        v-if="!tasks.length"
        :title="`No ${title.toLowerCase()} tasks`"
        icon="i-lucide-square-kanban"
        variant="compact"
      />
    </div>
  </div>
</template>
