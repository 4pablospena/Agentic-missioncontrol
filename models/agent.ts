export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  model?: string
  currentAction?: string
  currentTaskId?: string
  tokenUsage?: number
  lastSeenAt?: string
}

/** Observability-facing agent row (Fase 2); mapped from bridge `Agent`. */
export interface AgentSummary {
  id: string
  name: string
  status: AgentStatus
  model: string
  currentAction?: string
  currentTaskId?: string
  tokenUsage: number
  lastSeenAt: string
}

export function agentToSummary(agent: Agent): AgentSummary {
  return {
    id: agent.id,
    name: agent.name,
    status: agent.status,
    model: agent.model ?? '',
    currentAction: agent.currentAction,
    currentTaskId: agent.currentTaskId,
    tokenUsage: agent.tokenUsage ?? 0,
    lastSeenAt: agent.lastSeenAt ?? '',
  }
}
