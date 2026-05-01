import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type { AgentTask, TaskEventRecord } from '~/models/task'
import type { LogEntry } from '~/models/log'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createLogService, type LogService } from '~/services/log.service'
import { createTaskService, type TaskService } from '~/services/task.service'

export interface UseTaskDetailOptions {
  taskService?: TaskService
  logService?: LogService
  events?: Ref<MissionControlEvent[]>
}

export function useTaskDetail(taskId: Ref<string | null>, options: UseTaskDetailOptions = {}) {
  const { apiBase } = useMcConfig()
  const task = ref<AgentTask | null>(null)
  const taskEvents = ref<TaskEventRecord[]>([])
  const relatedLogs = ref<LogEntry[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveTaskService(): TaskService {
    if (options.taskService)
      return options.taskService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createTaskService(client)
  }

  function resolveLogService(): LogService {
    if (options.logService)
      return options.logService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createLogService(client)
  }

  async function refresh() {
    const id = taskId.value?.trim()
    if (!id) {
      task.value = null
      taskEvents.value = []
      relatedLogs.value = []
      return
    }
    pending.value = true
    errorMsg.value = ''
    try {
      const [t, evs, logsList] = await Promise.all([
        resolveTaskService().get(id),
        resolveTaskService().events(id),
        resolveLogService().list({ taskId: id, limit: 100 }),
      ])
      task.value = t
      taskEvents.value = evs
      relatedLogs.value = logsList
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      task.value = null
      taskEvents.value = []
      relatedLogs.value = []
    }
    finally {
      pending.value = false
    }
  }

  watch(taskId, () => {
    void refresh()
  }, { immediate: true })

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      const id = taskId.value?.trim()
      if (!last || !id || !last.type.startsWith('task.'))
        return
      const payload = last.payload as { taskId?: string }
      if (payload.taskId === id)
        void refresh()
    },
    { deep: true },
  )

  return {
    task: readonly(task),
    taskEvents: readonly(taskEvents),
    relatedLogs: readonly(relatedLogs),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    refresh,
  }
}
