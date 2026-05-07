import { getOpenClawBridge } from '../../services/get-openclaw-bridge'
import { buildSessionStatuses } from '../../services/metrics.server'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const bridge = await getOpenClawBridge()
  const agents = await bridge.listAgents()
  return withApiEnvelope('metrics', buildSessionStatuses(agents))
})
