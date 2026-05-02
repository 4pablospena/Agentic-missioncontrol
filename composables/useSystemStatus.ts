import type { Ref } from 'vue'
import type { OpenClawHealth } from '~/models/openclaw'

/**
 * Single source of truth for "system" status (realtime websocket + OpenClaw bridge health).
 * Avoids duplicate fetches across the dock, navbar and diagnostics views.
 *
 * Behaviour:
 * - First call performs the fetch and starts the polling interval.
 * - Subsequent calls reuse the same refs and counter; only the last unmount stops the poller.
 * - SSR-safe: data is initialised lazily and the fetch is browser-only.
 */

interface SystemStatusBridgeLabel {
  color: 'success' | 'neutral' | 'error'
  text: string
}

interface SystemStatusReturn {
  realtimeConnected: Ref<boolean>
  bridge: Readonly<Ref<OpenClawHealth | null>>
  bridgeLabel: ComputedRef<SystemStatusBridgeLabel>
  refresh: () => Promise<void>
}

const STATE_KEY = '__missionControlSystemStatus__'
const POLL_INTERVAL_MS = 45_000

interface InternalState {
  bridge: Ref<OpenClawHealth | null>
  refresh: () => Promise<void>
  refCount: number
  pollTimer: ReturnType<typeof setInterval> | undefined
}

function getOrCreateState(): InternalState {
  const nuxt = useNuxtApp() as unknown as Record<string, unknown>
  const existing = nuxt[STATE_KEY] as InternalState | undefined
  if (existing)
    return existing

  const bridge = ref<OpenClawHealth | null>(null)

  async function refresh() {
    if (import.meta.server)
      return
    try {
      const data = await $fetch<OpenClawHealth>('/api/openclaw/health')
      bridge.value = data
    }
    catch {
      bridge.value = null
    }
  }

  const state: InternalState = {
    bridge,
    refresh,
    refCount: 0,
    pollTimer: undefined,
  }
  nuxt[STATE_KEY] = state
  return state
}

export function useSystemStatus(): SystemStatusReturn {
  const { connected } = useRealtimeEvents()
  const state = getOrCreateState()

  onMounted(() => {
    state.refCount += 1
    if (state.refCount === 1) {
      void state.refresh()
      state.pollTimer = setInterval(() => {
        void state.refresh()
      }, POLL_INTERVAL_MS)
    }
  })

  onUnmounted(() => {
    state.refCount = Math.max(0, state.refCount - 1)
    if (state.refCount === 0 && state.pollTimer != null) {
      clearInterval(state.pollTimer)
      state.pollTimer = undefined
    }
  })

  const bridgeLabel = computed<SystemStatusBridgeLabel>(() => {
    const h = state.bridge.value
    if (h == null)
      return { color: 'neutral', text: '…' }
    if (h.bridgeMode === 'mock')
      return { color: 'neutral', text: 'mock' }
    if (h.gatewayReachable === true)
      return { color: 'success', text: 'gateway' }
    return { color: 'error', text: 'gateway' }
  })

  return {
    realtimeConnected: connected,
    bridge: state.bridge,
    bridgeLabel,
    refresh: state.refresh,
  }
}
