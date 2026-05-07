export default defineEventHandler(() => {
  const runtime = useRuntimeConfig()
  return {
    ok: true,
    service: 'openclaw-mission-control',
    ts: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    bridgeMode: String(runtime.openclawBridgeMode || 'mock'),
  }
})
