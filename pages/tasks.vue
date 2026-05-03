<script setup lang="ts">
import type { CreateTaskPayload } from '~/models/task'

definePageMeta({ layout: 'dashboard' })

const { events, connected } = useRealtimeEvents()
const {
  grouped,
  pending,
  errorMsg,
  loadTasks,
  createTask,
  cancelTask,
  retryTask,
} = useTasks({ events })

const { agents, refresh: refreshAgents } = useAgents({ events })

const selectedTaskId = ref<string | null>(null)

const {
  task: detailTask,
  taskEvents,
  relatedLogs,
  pending: detailPending,
  refresh: refreshDetail,
} = useTaskDetail(selectedTaskId, { events })

const agentOptions = computed(() =>
  agents.value.map(a => ({ label: a.name, value: a.id })),
)

onMounted(async () => {
  await refreshAgents()
  await loadTasks()
})

async function onCreate(payload: CreateTaskPayload) {
  await createTask(payload)
}

function onSelect(id: string) {
  selectedTaskId.value = id
}

async function onRetry(id: string) {
  await retryTask(id)
  await refreshDetail()
}

async function onCancel(id: string) {
  await cancelTask(id)
  await refreshDetail()
}

function onCloseDetail() {
  selectedTaskId.value = null
}

const detailOpen = computed({
  get: () => selectedTaskId.value !== null,
  set: (open: boolean) => {
    if (!open)
      onCloseDetail()
  },
})

const detailSlideTitle = computed(() => {
  if (detailTask.value?.title)
    return detailTask.value.title
  if (detailPending.value)
    return 'Loading…'
  return 'Task'
})

const detailSlideDescription = computed(() =>
  detailTask.value?.description ?? '',
)
</script>

<template>
  <UDashboardPanel id="tasks">
    <template #header>
      <UDashboardNavbar title="Tasks" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="pending"
            @click="loadTasks"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-8">
        <section class="page-toolbar flex flex-wrap items-center justify-between gap-3 pb-2">
          <p class="text-muted text-sm leading-snug">
            Operations queue. Select a row for drill-down; compose new work below.
          </p>
          <UTooltip text="Kanban groups tasks by status. Realtime updates push from the gateway.">
            <UButton
              icon="i-lucide-info"
              color="neutral"
              variant="ghost"
              size="xs"
              square
              aria-label="How tasks board works"
            />
          </UTooltip>
        </section>

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Task board
              </h2>
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Realtime {{ connected ? 'connected' : 'disconnected' }}
              </UBadge>
            </div>
          </template>

          <UAlert
            v-if="errorMsg"
            color="error"
            variant="soft"
            title="Could not load tasks"
            :description="errorMsg"
            class="mb-4"
          />

          <TasksTaskBoard
            :grouped="grouped"
            :tasks-pending="pending"
            class="min-h-[320px]"
            @select="onSelect"
            @retry="onRetry"
            @cancel="onCancel"
          />
        </UCard>

        <USlideover
          v-model:open="detailOpen"
          side="right"
          inset
          :title="detailSlideTitle"
          :description="detailSlideDescription || undefined"
          :aria-label="detailSlideTitle"
          :ui="{ content: 'sm:max-w-xl max-w-lg w-[calc(100%-2rem)]' }"
        >
          <template #body>
            <TasksTaskDetailPanel
              variant="drawer"
              :task="detailTask"
              :events="taskEvents"
              :logs="relatedLogs"
              :pending="detailPending"
              @close="onCloseDetail"
              @retry="onRetry"
              @cancel="onCancel"
            />
          </template>
        </USlideover>

        <TasksCreateTaskForm :agent-options="agentOptions" @submit="onCreate" />
      </div>
    </template>
  </UDashboardPanel>
</template>
