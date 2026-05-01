import { semanticSearchBodySchema } from '../../utils/memory-body-schema'
import { semanticSearchMemory } from '../../services/memory.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = semanticSearchBodySchema.safeParse((await readBody(event)) ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
      data: { issues: parsed.error.flatten() },
    })
  }
  const b = parsed.data
  return semanticSearchMemory({
    query: b.query,
    agentId: b.agentId,
    sessionId: b.sessionId,
    source: b.source,
    from: b.from,
    to: b.to,
    limit: b.limit,
  })
})
