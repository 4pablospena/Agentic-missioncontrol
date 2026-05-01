import { getOpenClawBridge } from '../../services/get-openclaw-bridge'
import { buildTokenMetrics } from '../../services/metrics.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const bridge = await getOpenClawBridge()
  const agents = await bridge.listAgents()
  return buildTokenMetrics(agents)
})
