import type { OpenClawBridge } from '~/models/openclaw'

export async function getOpenClawBridge(): Promise<OpenClawBridge> {
  const config = useRuntimeConfig()
  const mode = String(config.openclawBridgeMode || 'mock').toLowerCase()

  if (mode === 'gateway') {
    const { createGatewayOpenClawBridge } = await import('./openclaw-bridge.gateway')
    return createGatewayOpenClawBridge({
      baseUrl: String(config.openclawGatewayUrl || '').trim(),
      token: String(config.openclawGatewayToken || '').trim(),
    })
  }

  const { createMockOpenClawBridge } = await import('./openclaw-bridge.mock')
  return createMockOpenClawBridge()
}
