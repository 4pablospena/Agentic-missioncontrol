import { createError } from 'h3'
import type { OpenClawBridge } from '~/models/openclaw'
import { resolveGatewayEndpoints } from '../utils/openclaw-gateway-ws'

export async function getOpenClawBridge(): Promise<OpenClawBridge> {
  const config = useRuntimeConfig()
  const mode = String(config.openclawBridgeMode || 'mock').toLowerCase()

  if (mode === 'gateway') {
    const resolved = resolveGatewayEndpoints({
      gatewayWs: String(config.openclawGatewayWs || '').trim(),
      gatewayHttp: String(config.openclawGatewayUrl || '').trim(),
    })
    if (!resolved) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'Set OPENCLAW_GATEWAY_WS and/or OPENCLAW_GATEWAY_URL when OPENCLAW_BRIDGE_MODE=gateway',
      })
    }
    const { createGatewayOpenClawBridge } = await import('./openclaw-bridge.gateway')
    return createGatewayOpenClawBridge({
      wsUrl: resolved.wsUrl,
      httpBase: resolved.httpBase,
      token: String(config.openclawGatewayToken || '').trim(),
    })
  }

  const { createMockOpenClawBridge } = await import('./openclaw-bridge.mock')
  return createMockOpenClawBridge()
}
