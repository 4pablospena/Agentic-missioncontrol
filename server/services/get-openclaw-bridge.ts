import { createError } from 'h3'
import type { OpenClawBridge } from '~/models/openclaw'
import { parseGatewayConnectScopes, resolveGatewayEndpoints } from '../utils/openclaw-gateway-ws'

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
    const scopesFromConfig = String(config.openclawGatewayScopes ?? '').trim()
    const scopesFromEnv = String(process.env.OPENCLAW_GATEWAY_SCOPES ?? '').trim()
    const connectScopes = parseGatewayConnectScopes(scopesFromConfig || scopesFromEnv)
    const connectRole = String(config.openclawGatewayRole ?? '').trim()
      || String(process.env.OPENCLAW_GATEWAY_ROLE ?? '').trim()
    const omitConnectScopes
      = String(config.openclawGatewayOmitConnectScopes ?? '').toLowerCase() === 'true'
      || process.env.OPENCLAW_GATEWAY_OMIT_CONNECT_SCOPES === 'true'
    const wsBearerOnUpgrade
      = String(config.openclawGatewayWsBearer ?? '').toLowerCase() === 'true'
      || process.env.OPENCLAW_GATEWAY_WS_BEARER === 'true'
    return createGatewayOpenClawBridge({
      wsUrl: resolved.wsUrl,
      httpBase: resolved.httpBase,
      token: String(config.openclawGatewayToken || '').trim(),
      clientId: String(config.openclawGatewayClientId || '').trim(),
      clientMode: String(config.openclawGatewayClientMode || '').trim(),
      ...(connectRole ? { connectRole } : {}),
      ...(connectScopes?.length ? { connectScopes } : {}),
      ...(omitConnectScopes ? { omitConnectScopes: true } : {}),
      ...(wsBearerOnUpgrade ? { wsBearerOnUpgrade: true } : {}),
    })
  }

  const { createMockOpenClawBridge } = await import('./openclaw-bridge.mock')
  return createMockOpenClawBridge()
}
