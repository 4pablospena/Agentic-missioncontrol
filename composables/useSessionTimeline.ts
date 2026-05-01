import type { TimelineEvent } from '~/models/timeline'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import {
  createTimelineService,
  type TimelineService,
} from '~/services/timeline.service'

export interface UseSessionTimelineOptions {
  timelineService?: TimelineService
}

export function useSessionTimeline(
  sessionId: MaybeRefOrGetter<string>,
  options: UseSessionTimelineOptions = {},
) {
  const { apiBase } = useMcConfig()
  const events = ref<TimelineEvent[]>([])
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): TimelineService {
    if (options.timelineService)
      return options.timelineService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createTimelineService(client)
  }

  async function refresh() {
    const id = toValue(sessionId).trim()
    if (!id) {
      events.value = []
      return
    }
    pending.value = true
    errorMsg.value = ''
    try {
      events.value = await resolveService().listSession(id)
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      events.value = []
    }
    finally {
      pending.value = false
    }
  }

  watch(
    () => toValue(sessionId),
    () => {
      void refresh()
    },
    { immediate: true },
  )

  return {
    events: readonly(events),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    refresh,
  }
}
