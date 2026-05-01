export default defineWebSocketHandler({
  open(peer) {
    peer.send(JSON.stringify({
      type: 'system.health.changed',
      payload: { ok: true, channel: 'mission-control' },
      ts: new Date().toISOString(),
    }))
  },
  message(peer, message) {
    peer.send(typeof message === 'string' ? message : String(message))
  },
})
