import { conversationsQuerySchema } from '../../../utils/chat-query-schema'
import { listConversations } from '../../../services/chat.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = conversationsQuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query',
      data: { issues: parsed.error.flatten() },
    })
  }
  return listConversations({ agentId: parsed.data.agentId })
})
