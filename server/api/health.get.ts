export default defineEventHandler(() => {
  return {
    ok: true,
    service: 'openclaw-mission-control',
    ts: new Date().toISOString(),
  }
})
