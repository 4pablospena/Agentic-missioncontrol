import { logsQuerySchema } from '../utils/logs-query-schema'
import { listLogs } from '../services/logger.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parsed = logsQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }

  const q = parsed.data
  return listLogs({
    agentId: q.agentId,
    level: q.level,
    query: q.query,
    from: q.from,
    to: q.to,
    sessionId: q.sessionId,
    taskId: q.taskId,
    limit: q.limit,
  })
})
