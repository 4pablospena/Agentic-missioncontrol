import type { Agent } from '~/models/agent'
import type { AgentCommandResult, SendAgentCommandPayload } from '~/models/openclaw'
import type { ApiClient } from './api-client.service'

export interface OpenClawAgentService {
  listAgents(): Promise<Agent[]>
  getHealth(): Promise<unknown>
  sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult>
}

export function createOpenClawAgentService(client: ApiClient): OpenClawAgentService {
  return {
    listAgents() {
      return client.get<Agent[]>('/api/openclaw/agents')
    },
    getHealth() {
      return client.get('/api/openclaw/health')
    },
    sendCommand(agentId: string, payload: SendAgentCommandPayload) {
      return client.post<SendAgentCommandPayload, AgentCommandResult>(
        `/api/openclaw/agents/${encodeURIComponent(agentId)}/commands`,
        payload,
      )
    },
  }
}
