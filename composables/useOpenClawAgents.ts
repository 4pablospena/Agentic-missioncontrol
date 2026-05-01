import type { Agent } from '~/models/agent'
import type { SendAgentCommandPayload } from '~/models/openclaw'
import { createApiClient } from '~/services/api-client.service'
import {
  createOpenClawAgentService,
  type OpenClawAgentService,
} from '~/services/openclaw-agent.service'

export interface UseOpenClawAgentsOptions {
  agentService?: OpenClawAgentService
}

export function useOpenClawAgents(options: UseOpenClawAgentsOptions = {}) {
  const { apiBase } = useMcConfig()
  const agents = ref<Agent[]>([])
  const health = ref<unknown>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function resolveService(): OpenClawAgentService {
    if (options.agentService) {
      return options.agentService
    }
    const reqFetch = useRequestFetch()
    const client = createApiClient(reqFetch, apiBase.value)
    return createOpenClawAgentService(client)
  }

  async function refresh() {
    isLoading.value = true
    error.value = null
    try {
      const service = resolveService()
      agents.value = await service.listAgents()
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

  return {
    agents: readonly(agents),
    health: readonly(health),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh,
    sendCommand,
  }
}
