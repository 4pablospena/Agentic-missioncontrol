import { getOpenClawBridge } from '../../services/get-openclaw-bridge'

export default defineEventHandler(async () => {
  const bridge = await getOpenClawBridge()
  return bridge.health()
})
