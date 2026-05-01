import type { MissionControlEvent } from '~/models/realtime'

export type RealtimePeer = {
  send: (data: string) => void
}

const peers = new Set<RealtimePeer>()

export function registerRealtimePeer(peer: RealtimePeer): void {
  peers.add(peer)
}

export function unregisterRealtimePeer(peer: RealtimePeer): void {
  peers.delete(peer)
}

export function broadcastMissionControlEvent(event: MissionControlEvent): void {
  const raw = JSON.stringify(event)
  for (const p of [...peers]) {
    try {
      p.send(raw)
    }
    catch {
      peers.delete(p)
    }
  }
}
