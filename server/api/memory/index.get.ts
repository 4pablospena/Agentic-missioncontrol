import { memoryListQuerySchema } from '../../utils/memory-query-schema'
import { listMemoryItems } from '../../services/memory.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = memoryListQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }
  const q = parsed.data
  return listMemoryItems({
    agentId: q.agentId,
    sessionId: q.sessionId,
    source: q.source,
    from: q.from,
    to: q.to,
    limit: q.limit,
  })
})
