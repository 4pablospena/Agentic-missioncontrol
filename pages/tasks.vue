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
const guidedModalOpen = useState('guidedModalOpen', () => false)

const {
  task: detailTask,
  taskEvents,
  relatedLogs,
  pending: detailPending,
  refresh: refreshDetail,
} = useTaskDetail(selectedTaskId, { events })

const activeCount = computed(
  () => (grouped.value.running?.length ?? 0) + (grouped.value.queued?.length ?? 0),
)

onMounted(async () => {
  await Promise.all([refreshAgents(), loadTasks()])
})

async function onCreate(payload: CreateTaskPayload) {
  await createTask(payload)
}

function onSelect(id: string) { selectedTaskId.value = id }
async function onRetry(id: string) { await retryTask(id); await refreshDetail() }
async function onCancel(id: string) { await cancelTask(id); await refreshDetail() }
function onCloseDetail() { selectedTaskId.value = null }

const detailOpen = computed({
  get: () => selectedTaskId.value !== null,
  set: (open: boolean) => { if (!open) onCloseDetail() },
})
</script>

<template>
  <div class="rs-canvas rs-scanlines flex flex-col h-full min-h-0 overflow-hidden">
    <DashboardPageShell
      title="Misiones"
      subtitle="Cola de tareas activa"
      icon="i-lucide-list-checks"
      accent-color="cyan"
      :scroll-body="false"
      body-class="tasks-page-body"
    >
      <template #actions>
        <RetroBadge
          v-if="activeCount > 0"
          color="yellow"
          size="sm"
          pulse
          class="hidden sm:inline-flex"
        >
          {{ activeCount }} activas
        </RetroBadge>
        <RetroBadge
          :color="connected ? 'green' : 'neutral'"
          size="sm"
          class="hidden md:inline-flex"
        >
          {{ connected ? 'EN VIVO' : 'OFFLINE' }}
        </RetroBadge>
        <RetroButton
          color="cyan"
          variant="outline"
          size="sm"
          icon="i-lucide-rotate-ccw"
          :loading="pending"
          @click="loadTasks"
        >
          <span class="hidden sm:inline">Recargar</span>
        </RetroButton>
        <RetroButton
          color="pink"
          variant="solid"
          size="sm"
          icon="i-lucide-plus"
          @click="guidedModalOpen = true"
        >
          <span class="hidden sm:inline">Nueva orden</span>
        </RetroButton>
      </template>

      <RetroCard v-if="errorMsg" color="red" static class="px-4 py-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-triangle-alert" class="size-5 shrink-0 rs-glow-red" />
          <p class="rs-body rs-glow-red" style="font-size: 0.95rem;">{{ errorMsg }}</p>
        </div>
      </RetroCard>

      <TasksTaskBoard
        :grouped="grouped"
        :tasks-pending="pending"
        @select="onSelect"
        @retry="onRetry"
        @cancel="onCancel"
      />
    </DashboardPageShell>

    <USlideover
      v-model:open="detailOpen"
      side="right"
      :title="detailTask?.title ?? 'MISIÓN'"
      :ui="{
        content: 'sm:max-w-xl max-w-lg w-[calc(100%-2rem)]',
        overlay: 'bg-black/70',
      }"
    >
      <template #body>
        <div style="background:var(--rs-surface); min-height:100%;">
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
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
:deep(.tasks-page-body) {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
