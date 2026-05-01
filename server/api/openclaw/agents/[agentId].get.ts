import { getOpenClawBridge } from '../../../services/get-openclaw-bridge'

export default defineEventHandler(async (event) => {
  const agentId = getRouterParam(event, 'agentId')
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing agentId' })
  }
  const bridge = await getOpenClawBridge()
  const agent = await bridge.getAgent(agentId)
  if (!agent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent not found' })
  }
  return agent
})
