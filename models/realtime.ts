export type MissionControlEventType =
  | 'agent.status.changed'
  | 'agent.tokens.changed'
  | 'agent.command.sent'
  | 'agent.command.completed'
  | 'agent.command.failed'
  | 'log.created'
  | 'task.created'
  | 'task.updated'
  | 'task.status.changed'
  | 'task.progress.changed'
  | 'task.completed'
  | 'task.failed'
  | 'alert.created'
  | 'metric.updated'
  | 'session.event.created'
  | 'system.health.changed'
  | 'memory.created'
  | 'memory.deleted'
  | 'memory.snapshot.exported'
  | 'memory.snapshot.imported'
  | 'chat.conversation.created'
  | 'chat.message.created'

export interface MissionControlEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MissionControlEventType
  payload: TPayload
  createdAt: string
}
