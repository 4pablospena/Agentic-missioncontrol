import { sendChatMessageBodySchema } from '../../../utils/chat-body-schema'
import { orchestrateAgentChatMessage } from '../../../services/chat-orchestrator.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const agentId = getRouterParam(event, 'agentId')
  if (!agentId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Missing agentId' })
  }
  const parsed = sendChatMessageBodySchema.safeParse((await readBody(event)) ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body',
      data: { issues: parsed.error.flatten() },
    })
  }
  return orchestrateAgentChatMessage(agentId.trim(), parsed.data)
})
