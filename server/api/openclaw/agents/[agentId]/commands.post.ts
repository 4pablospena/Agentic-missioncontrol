import type { SendAgentCommandPayload } from '~/models/openclaw'
import { getOpenClawBridge } from '../../../../services/get-openclaw-bridge'
import { assertRateLimit } from '../../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  assertRateLimit(event, { key: 'openclaw.command', limit: 30, windowMs: 60_000 })
  const agentId = getRouterParam(event, 'agentId')
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing agentId' })
  }
  const body = await readBody<SendAgentCommandPayload>(event)
  if (!body?.command) {
    throw createError({ statusCode: 400, statusMessage: 'Missing command' })
  }
  const bridge = await getOpenClawBridge()
  return bridge.sendCommand(agentId, body)
})
