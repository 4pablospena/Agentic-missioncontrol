import type { Ref } from 'vue'
import { computed, readonly, ref, watch } from 'vue'
import type { Notification, NotificationStatusFilter } from '~/models/notification'
import type { MissionControlEvent, MissionControlEventType } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createNotificationService, type NotificationService } from '~/services/notification.service'

export interface UseNotificationsOptions {
  notificationService?: NotificationService
  events?: Ref<MissionControlEvent[]>
  /** Initial filter for the inbox. Defaults to `all` so badges + history share the same data. */
  initialStatus?: NotificationStatusFilter
}

/**
 * Realtime types whose server-side broadcast also persists a notification row.
 * Must mirror EVENT_NOTIFICATION_DEFAULTS in `server/utils/realtime-broadcast.ts`.
 */
const PERSISTED_REALTIME_TYPES = new Set<MissionControlEventType>([
  'alert.created',
  'task.failed',
  'task.completed',
  'memory.snapshot.exported',
  'memory.snapshot.imported',
])

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { apiBase } = useMcConfig()
  const items = ref<Notification[]>([])
  const status = ref<NotificationStatusFilter>(options.initialStatus ?? 'unread')
  const loading = ref(false)
  const errorMsg = ref('')

  function resolveService(): NotificationService {
    if (options.notificationService)
      return options.notificationService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createNotificationService(client)
  }

  async function refresh() {
    loading.value = true
    errorMsg.value = ''
    try {
      items.value = await resolveService().list({ status: status.value })
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      loading.value = false
    }
  }

  async function markRead(id: string) {
    errorMsg.value = ''
    try {
      const updated = await resolveService().markRead(id)
      const idx = items.value.findIndex(n => n.id === id)
      if (idx !== -1) {
        if (status.value === 'unread')
          items.value = items.value.filter(n => n.id !== id)
        else
          items.value = items.value.map(n => (n.id === id ? updated : n))
      }
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  async function markAllRead() {
    errorMsg.value = ''
    try {
      await resolveService().markAllRead()
      if (status.value === 'unread')
        items.value = []
      else
        items.value = items.value.map(n => ({ ...n, read: true }))
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
      throw e
    }
  }

  function setStatus(next: NotificationStatusFilter) {
    if (status.value === next)
      return
    status.value = next
    void refresh()
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last && PERSISTED_REALTIME_TYPES.has(last.type))
        void refresh()
    },
    { deep: true },
  )

  const unreadCount = computed(() => items.value.filter(n => !n.read).length)

  return {
    items: readonly(items),
    status,
    setStatus,
    loading: readonly(loading),
    errorMsg: readonly(errorMsg),
    unreadCount,
    refresh,
    markRead,
    markAllRead,
  }
}
