export interface TimelineEvent {
  id: string
  type: string
  agentId?: string
  message: string
  summary?: string
  metadata?: Record<string, unknown>
  createdAt: string
}
