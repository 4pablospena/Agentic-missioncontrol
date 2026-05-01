import type { Agent } from './agent'

export type AgentCommandType =
  | 'status.refresh'
  | 'action.start'
  | 'action.cancel'
  | 'health.check'
  /** Phase 4: conversational turn; gateway may return 501 until wired. */
  | 'chat.message'

export interface SendAgentCommandPayload {
  command: AgentCommandType
  input?: Record<string, unknown>
}

export interface AgentCommandResult {
  commandId: string
  agentId: string
  command: AgentCommandType
  ok: boolean
  message?: string
  detail?: Record<string, unknown>
}

export interface OpenClawHealth {
  bridgeMode: 'mock' | 'gateway'
  gatewayReachable?: boolean
  gatewayStatus?: number
  message?: string
}

export interface OpenClawBridge {
  health(): Promise<OpenClawHealth>
  listAgents(): Promise<Agent[]>
  getAgent(agentId: string): Promise<Agent | null>
  sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult>
}
