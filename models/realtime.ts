export type MissionControlEventType =
  | 'agent.status.changed'
  | 'agent.command.sent'
  | 'agent.command.completed'
  | 'agent.command.failed'
  | 'log.created'
  | 'system.health.changed'

export interface MissionControlEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MissionControlEventType
  payload: TPayload
  createdAt: string
}
