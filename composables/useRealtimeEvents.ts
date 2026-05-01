import type { MissionControlEvent } from '~/models/realtime'
import {
  createBrowserRealtimeConnection,
  resolveDefaultRealtimeWsUrl,
  type RealtimeConnection,
} from '~/services/realtime.service'

const MAX_EVENTS = 100

export interface UseRealtimeEventsOptions {
  /** Inject for tests; defaults to browser WebSocket client. */
  connection?: RealtimeConnection
  wsUrl?: string
}

export function useRealtimeEvents(options?: UseRealtimeEventsOptions) {
  const events = ref<MissionControlEvent[]>([])
  const connected = ref(false)

  const connection = options?.connection ?? createBrowserRealtimeConnection(
    options?.wsUrl ?? resolveDefaultRealtimeWsUrl(),
  )

  let unsubStatus: (() => void) | undefined
  let unsubMessage: (() => void) | undefined

  onMounted(() => {
    unsubStatus = connection.onStatus((c) => {
      connected.value = c
    })
    unsubMessage = connection.onMessage((ev) => {
      events.value = [...events.value.slice(-(MAX_EVENTS - 1)), ev]
    })
    connection.connect()
  })

  onUnmounted(() => {
    unsubStatus?.()
    unsubMessage?.()
    connection.disconnect()
  })

  return {
    events,
    connected,
    connection,
  }
}
