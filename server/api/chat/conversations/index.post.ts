import { createConversationBodySchema } from '../../../utils/chat-body-schema'
import { createConversation } from '../../../services/chat.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const parsed = createConversationBodySchema.safeParse((await readBody(event)) ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
      data: { issues: parsed.error.flatten() },
    })
  }
  return createConversation(parsed.data)
})
