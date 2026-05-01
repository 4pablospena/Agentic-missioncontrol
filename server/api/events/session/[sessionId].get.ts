import { sortEventsByDateAsc } from '~/utils/sortEventsByDate'
import { mapLogsToTimelineEvents } from '../../../utils/mapLogsToTimelineEvents'
import { listLogs } from '../../../services/logger.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sessionId' })
  }

  const rows = await listLogs({ sessionId: sessionId.trim(), limit: 500 })
  return sortEventsByDateAsc(mapLogsToTimelineEvents(rows))
})
