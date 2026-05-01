import type { MissionControlEvent } from '~/models/realtime'

export type RealtimeStatusListener = (connected: boolean) => void
export type RealtimeMessageListener = (event: MissionControlEvent) => void

export interface RealtimeConnection {
  connect(): void
  disconnect(): void
  onStatus(listener: RealtimeStatusListener): () => void
  onMessage(listener: RealtimeMessageListener): () => void
}

export function parseRealtimePayload(raw: string): MissionControlEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (isMissionControlEvent(parsed))
      return parsed
  }
  catch {
    /* invalid JSON */
  }
  return null
}

function isMissionControlEvent(value: unknown): value is MissionControlEvent {
  if (!value || typeof value !== 'object')
    return false
  const o = value as Record<string, unknown>
  return (
    typeof o.id === 'string'
    && typeof o.type === 'string'
    && typeof o.createdAt === 'string'
    && 'payload' in o
  )
}

export function resolveDefaultRealtimeWsUrl(): string {
  if (typeof window === 'undefined')
    return ''
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/realtime`
}

export function createBrowserRealtimeConnection(wsUrl: string): RealtimeConnection {
  let socket: WebSocket | null = null
  const statusListeners = new Set<RealtimeStatusListener>()
  const messageListeners = new Set<RealtimeMessageListener>()

  function emitStatus(connected: boolean) {
    for (const fn of statusListeners)
      fn(connected)
  }

  return {
    connect() {
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
        return

      socket = new WebSocket(wsUrl)
      socket.onopen = () => emitStatus(true)
      socket.onclose = () => {
        emitStatus(false)
        socket = null
      }
      socket.onerror = () => {
        emitStatus(false)
      }
      socket.onmessage = (ev: MessageEvent) => {
        const msg = parseRealtimePayload(String(ev.data))
        if (msg) {
          for (const fn of messageListeners)
            fn(msg)
        }
      }
    },

    disconnect() {
      socket?.close()
      socket = null
      emitStatus(false)
    },

    onStatus(listener: RealtimeStatusListener) {
      statusListeners.add(listener)
      return () => statusListeners.delete(listener)
    },

    onMessage(listener: RealtimeMessageListener) {
      messageListeners.add(listener)
      return () => messageListeners.delete(listener)
    },
  }
}
