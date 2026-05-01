import { getOpenClawBridge } from '../../services/get-openclaw-bridge'
import { buildSessionStatuses } from '../../services/metrics.server'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const bridge = await getOpenClawBridge()
  const agents = await bridge.listAgents()
  return buildSessionStatuses(agents)
})
