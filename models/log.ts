export interface LogEntry {
  id: string
  agentId?: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, unknown>
  createdAt: string
}
