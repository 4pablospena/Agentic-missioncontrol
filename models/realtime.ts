export type MissionControlEventType =
  | 'agent.status.changed'
  | 'agent.tokens.changed'
  | 'agent.command.sent'
  | 'agent.command.completed'
  | 'agent.command.failed'
  | 'log.created'
  | 'task.status.changed'
  | 'alert.created'
  | 'metric.updated'
  | 'session.event.created'
  | 'system.health.changed'

export interface MissionControlEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MissionControlEventType
  payload: TPayload
  createdAt: string
}
