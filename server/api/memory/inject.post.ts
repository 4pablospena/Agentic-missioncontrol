import { injectMemoryBodySchema } from '../../utils/memory-body-schema'
import { injectMemory } from '../../services/memory.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = injectMemoryBodySchema.safeParse((await readBody(event)) ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
      data: { issues: parsed.error.flatten() },
    })
  }
  const b = parsed.data
  return injectMemory({
    agentId: b.agentId,
    sessionId: b.sessionId,
    content: b.content,
    metadata: b.metadata,
  })
})
