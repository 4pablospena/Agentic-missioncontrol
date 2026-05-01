import { describe, expect, it } from 'vitest'
import type { LogEntry } from '~/models/log'
import { mapLogsToTimelineEvents } from '../server/utils/mapLogsToTimelineEvents'

describe('mapLogsToTimelineEvents', () => {
  it('maps level to event type and copies fields', () => {
    const log: LogEntry = {
      id: 'l1',
      agentId: 'a1',
      level: 'info',
      message: 'short',
      metadata: { x: 1 },
      createdAt: 't',
    }
    const [ev] = mapLogsToTimelineEvents([log])
    expect(ev).toMatchObject({
      id: 'l1',
      type: 'log.info',
      agentId: 'a1',
      message: 'short',
      summary: 'short',
      metadata: { x: 1 },
      createdAt: 't',
    })
  })

  it('truncates long messages in summary', () => {
    const msg = 'x'.repeat(141)
    const log: LogEntry = {
      id: 'l2',
      level: 'warn',
      message: msg,
      createdAt: 't',
    }
    const [ev] = mapLogsToTimelineEvents([log])
    expect(ev?.message).toBe(msg)
    expect(ev?.summary?.length).toBe(138)
    expect(ev?.summary?.endsWith('…')).toBe(true)
  })
})
