import type { AgentSummary } from '~/models/agent'
import { agentToSummary } from '~/models/agent'
import type { SendAgentCommandPayload } from '~/models/openclaw'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import {
  createOpenClawAgentService,
  type OpenClawAgentService,
} from '~/services/openclaw-agent.service'

export interface UseAgentsOptions {
  agentService?: OpenClawAgentService
  /** Defaults to `useRealtimeEvents().events` when omitted. */
  events?: Ref<MissionControlEvent[]>
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { apiBase } = useMcConfig()
  const agents = ref<AgentSummary[]>([])
  const health = ref<unknown>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function resolveService(): OpenClawAgentService {
    if (options.agentService)
      return options.agentService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createOpenClawAgentService(client)
  }

  async function refresh() {
    isLoading.value = true
    error.value = null
    try {
      const service = resolveService()
      const list = await service.listAgents()
      agents.value = list.map(agentToSummary)
      health.value = await service.getHealth()
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
    finally {
      isLoading.value = false
    }
  }

  async function sendCommand(agentId: string, payload: SendAgentCommandPayload) {
    return resolveService().sendCommand(agentId, payload)
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (!last)
        return
      if (
        last.type === 'agent.status.changed'
        || last.type === 'agent.tokens.changed'
      ) {
        void refresh()
      }
    },
    { deep: true },
  )

  return {
    agents: readonly(agents),
    health: readonly(health),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh,
    sendCommand,
  }
}
