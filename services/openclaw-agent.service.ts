import type { Agent } from '~/models/agent'
import type {
  AgentCommandResult,
  OpenClawHealth,
  SendAgentCommandPayload,
} from '~/models/openclaw'
import type { ApiClient } from './api-client.service'
import { unwrapApiEnvelope } from './api-envelope.service'

export interface OpenClawAgentService {
  listAgents(): Promise<Agent[]>
  getAgent(agentId: string): Promise<Agent | null>
  getHealth(): Promise<OpenClawHealth>
  sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult>
}

export function createOpenClawAgentService(client: ApiClient): OpenClawAgentService {
  return {
    listAgents() {
      return client
        .get<Agent[]>('/api/openclaw/agents')
        .then(unwrapApiEnvelope)
    },
    async getAgent(agentId: string) {
      try {
        return await client
          .get<Agent>(`/api/openclaw/agents/${encodeURIComponent(agentId)}`)
          .then(unwrapApiEnvelope)
      }
      catch (e: unknown) {
        const status
          = typeof e === 'object' && e !== null && 'statusCode' in e
            ? (e as { statusCode?: number }).statusCode
            : typeof e === 'object' && e !== null && 'status' in e
              ? (e as { status?: number }).status
              : undefined
        if (status === 404)
          return null
        throw e
      }
    },
    getHealth() {
      return client
        .get<OpenClawHealth>('/api/openclaw/health')
        .then(unwrapApiEnvelope)
    },
    sendCommand(agentId: string, payload: SendAgentCommandPayload) {
      return client.post<SendAgentCommandPayload, AgentCommandResult>(
        `/api/openclaw/agents/${encodeURIComponent(agentId)}/commands`,
        payload,
      )
    },
  }
}
