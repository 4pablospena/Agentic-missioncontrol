import { describe, expect, it } from 'vitest'
import type { MissionControlEvent } from '../models/realtime'
import { parseRealtimePayload } from '../services/realtime.service'

describe('parseRealtimePayload', () => {
  it('parses MissionControlEvent JSON', () => {
    const ev: MissionControlEvent = {
      id: 'e1',
      type: 'system.health.changed',
      payload: { ok: true },
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    expect(parseRealtimePayload(JSON.stringify(ev))).toEqual(ev)
  })

  it('returns null for invalid shapes', () => {
    expect(parseRealtimePayload('{}')).toBeNull()
    expect(parseRealtimePayload('not-json')).toBeNull()
    expect(parseRealtimePayload(JSON.stringify({ id: 'x', type: 'y' }))).toBeNull()
  })
})
