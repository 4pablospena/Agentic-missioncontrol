import type { TimelineEvent } from '~/models/timeline'
import { sortEventsByDateAsc } from '~/utils/sortEventsByDate'
import { listLogs } from '../../../services/logger.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sessionId' })
  }

  const rows = await listLogs({ sessionId: sessionId.trim(), limit: 500 })
  const events: TimelineEvent[] = rows.map(log => ({
    id: log.id,
    type: `log.${log.level}`,
    agentId: log.agentId,
    message: log.message,
    summary:
      log.message.length > 140 ? `${log.message.slice(0, 137)}…` : log.message,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }))

  return sortEventsByDateAsc(events)
})
