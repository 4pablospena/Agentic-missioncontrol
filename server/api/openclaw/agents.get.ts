import { readAgentsFromOpenclawDir } from '../../utils/openclaw-config-fs'
import { getOpenClawBridge } from '../../services/get-openclaw-bridge'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const openclawDir = String(config.openclawDir ?? process.env.OPENCLAW_DIR ?? '').trim()

  try {
    const bridge = await getOpenClawBridge()
    const agents = await bridge.listAgents()
    return withApiEnvelope('openclaw', agents)
  }
  catch (e) {
    if (!openclawDir)
      throw e
    try {
      const agents = await readAgentsFromOpenclawDir(openclawDir)
      return withApiEnvelope('openclaw', agents, { degraded: true })
    }
    catch {
      throw e
    }
  }
})
