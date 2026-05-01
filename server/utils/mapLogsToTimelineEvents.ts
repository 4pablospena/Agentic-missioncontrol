import type { LogEntry } from '~/models/log'
import type { TimelineEvent } from '~/models/timeline'

export function mapLogsToTimelineEvents(rows: LogEntry[]): TimelineEvent[] {
  return rows.map(log => ({
    id: log.id,
    type: `log.${log.level}`,
    agentId: log.agentId,
    message: log.message,
    summary:
      log.message.length > 140 ? `${log.message.slice(0, 137)}…` : log.message,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }))
}
