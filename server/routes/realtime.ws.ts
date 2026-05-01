import { randomUUID } from 'node:crypto'
import type { MissionControlEvent } from '~/models/realtime'
import { registerRealtimePeer, unregisterRealtimePeer } from '../utils/realtime-broadcast'

export default defineWebSocketHandler({
  open(peer) {
    registerRealtimePeer(peer)

    const initial: MissionControlEvent = {
      id: randomUUID(),
      type: 'system.health.changed',
      payload: { ok: true, channel: 'mission-control' },
      createdAt: new Date().toISOString(),
    }
    peer.send(JSON.stringify(initial))
  },

  close(peer) {
    unregisterRealtimePeer(peer)
  },

  message(peer, message) {
    peer.send(typeof message === 'string' ? message : String(message))
  },
})
