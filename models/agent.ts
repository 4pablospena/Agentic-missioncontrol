export type AgentStatus = 'idle' | 'running' | 'error' | 'offline'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  model?: string
  currentAction?: string
  tokenUsage?: number
  lastSeenAt?: string
}
