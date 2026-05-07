import { readAgentsFromOpenclawDir } from '../../../utils/openclaw-config-fs'
import { getOpenClawBridge } from '../../../services/get-openclaw-bridge'
import { withApiEnvelope } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  const agentId = getRouterParam(event, 'agentId')
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing agentId' })
  }
  const id = agentId.trim()
  const config = useRuntimeConfig()
  const openclawDir = String(config.openclawDir ?? process.env.OPENCLAW_DIR ?? '').trim()

  try {
    const bridge = await getOpenClawBridge()
    const agent = await bridge.getAgent(id)
    if (agent)
      return withApiEnvelope('openclaw', agent)
  }
  catch {
    /* try filesystem discovery */
  }

  if (openclawDir) {
    try {
      const agents = await readAgentsFromOpenclawDir(openclawDir)
      const hit = agents.find(a => a.id === id)
      if (hit)
        return withApiEnvelope('openclaw', hit, { degraded: true })
    }
    catch {
      /* fall through 404 */
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Agent not found' })
})
