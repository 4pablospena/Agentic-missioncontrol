import { readonly, ref } from 'vue'
import type { ScheduledTask, ScheduleTaskPayload } from '~/models/scheduler'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createSchedulerService, type SchedulerService } from '~/services/scheduler.service'

export interface UseSchedulerOptions {
  schedulerService?: SchedulerService
}

export function useScheduler(options: UseSchedulerOptions = {}) {
  const { apiBase } = useMcConfig()
  const schedules = ref<ScheduledTask[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): SchedulerService {
    if (options.schedulerService)
      return options.schedulerService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createSchedulerService(client)
  }

  async function loadSchedules() {
    pending.value = true
    errorMsg.value = ''
    try {
      schedules.value = await resolveService().list()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  async function createSchedule(payload: ScheduleTaskPayload) {
    errorMsg.value = ''
    try {
      await resolveService().create(payload)
      await loadSchedules()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function removeSchedule(id: string) {
    errorMsg.value = ''
    try {
      await resolveService().delete(id)
      await loadSchedules()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function enableSchedule(id: string) {
    errorMsg.value = ''
    try {
      await resolveService().enable(id)
      await loadSchedules()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function disableSchedule(id: string) {
    errorMsg.value = ''
    try {
      await resolveService().disable(id)
      await loadSchedules()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function runScheduleNow(id: string) {
    errorMsg.value = ''
    try {
      await resolveService().runNow(id)
      await loadSchedules()
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  return {
    schedules: readonly(schedules),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    loadSchedules,
    createSchedule,
    removeSchedule,
    enableSchedule,
    disableSchedule,
    runScheduleNow,
  }
}
