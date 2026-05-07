import { getOpenClawBridge } from '../../services/get-openclaw-bridge'
import { withApiEnvelope } from '../../utils/api-envelope'

export default defineEventHandler(async () => {
  const bridge = await getOpenClawBridge()
  return withApiEnvelope('openclaw', await bridge.health())
})
