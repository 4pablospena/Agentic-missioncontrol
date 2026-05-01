import { z } from 'zod'
import { listLogs } from '../services/logger.server'

const logsQuerySchema = z.object({
  agentId: z.string().optional(),
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  query: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sessionId: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
})

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
    limit: q.limit,
  })
})
