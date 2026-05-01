import type { SendAgentCommandPayload } from '~/models/openclaw'
import { getOpenClawBridge } from '../../../../services/get-openclaw-bridge'

export default defineEventHandler(async (event) => {
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
