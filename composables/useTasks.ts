import type { Ref } from 'vue'
import { computed, readonly, ref, watch } from 'vue'
import type { AgentTask, CreateTaskPayload, TaskFilters, UpdateTaskPayload } from '~/models/task'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createTaskService, type TaskService } from '~/services/task.service'
import { groupTasksByStatus } from '~/utils/groupTasksByStatus'

export interface UseTasksOptions {
  taskService?: TaskService
  events?: Ref<MissionControlEvent[]>
  initialFilters?: TaskFilters
}

const TASK_EVENT_PREFIX = 'task.'

function isTaskRealtimeType(type: string): boolean {
  return type.startsWith(TASK_EVENT_PREFIX)
}

export function useTasks(options: UseTasksOptions = {}) {
  const { apiBase } = useMcConfig()
  const tasks = ref<AgentTask[]>([])
  const filters = ref<TaskFilters>({ ...options.initialFilters })
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): TaskService {
    if (options.taskService)
      return options.taskService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createTaskService(client)
  }

  async function loadTasks() {
    pending.value = true
    errorMsg.value = ''
    try {
      tasks.value = await resolveService().list({ ...filters.value })
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function createTask(payload: CreateTaskPayload) {
    errorMsg.value = ''
    try {
      await resolveService().create(payload)
      await loadTasks()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function updateTask(taskId: string, payload: UpdateTaskPayload) {
    errorMsg.value = ''
    try {
      await resolveService().update(taskId, payload)
      await loadTasks()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function startTask(taskId: string) {
    errorMsg.value = ''
    try {
      await resolveService().start(taskId)
      await loadTasks()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function cancelTask(taskId: string) {
    errorMsg.value = ''
    try {
      await resolveService().cancel(taskId)
      await loadTasks()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function retryTask(taskId: string) {
    errorMsg.value = ''
    try {
      await resolveService().retry(taskId)
      await loadTasks()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  function setFilters(patch: Partial<TaskFilters>) {
    filters.value = { ...filters.value, ...patch }
    void loadTasks()
  }

  const grouped = computed(() => groupTasksByStatus(tasks.value))

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last && isTaskRealtimeType(last.type))
        void loadTasks()
    },
    { deep: true },
  )

  return {
    tasks: readonly(tasks),
    filters,
    grouped,
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    loadTasks,
    setFilters,
    createTask,
    updateTask,
    startTask,
    cancelTask,
    retryTask,
  }
}
