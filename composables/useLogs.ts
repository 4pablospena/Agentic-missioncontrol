import type { LogFilters } from '~/models/log-filters'
import type { LogEntry } from '~/models/log'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import type { CreateLogPayload } from '~/services/log.service'
import { createLogService, type LogService } from '~/services/log.service'

export interface UseLogsOptions {
  logService?: LogService
  /** Defaults to `useRealtimeEvents().events` when omitted. */
  events?: Ref<MissionControlEvent[]>
  initialFilters?: LogFilters
  /** Passed to each list request (default 200). */
  listLimit?: number
}

export function useLogs(options: UseLogsOptions = {}) {
  const { apiBase } = useMcConfig()
  const filters = ref<LogFilters>({ ...options.initialFilters })
  const logs = ref<LogEntry[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): LogService {
    if (options.logService)
      return options.logService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createLogService(client)
  }

  async function refresh() {
    pending.value = true
    errorMsg.value = ''
    try {
      const limit = options.listLimit ?? 200
      logs.value = await resolveService().list({ ...filters.value, limit })
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  function setFilters(patch: Partial<LogFilters>) {
    filters.value = { ...filters.value, ...patch }
    void refresh()
  }

  function resetFilters() {
    filters.value = { ...options.initialFilters }
    void refresh()
  }

  async function create(payload: CreateLogPayload) {
    errorMsg.value = ''
    try {
      await resolveService().create(payload)
      await refresh()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last?.type === 'log.created')
        void refresh()
    },
    { deep: true },
  )

  return {
    logs: readonly(logs),
    filters,
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    refresh,
    setFilters,
    resetFilters,
    create,
  }
}
