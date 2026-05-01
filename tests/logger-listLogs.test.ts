import { beforeEach, describe, expect, it, vi } from 'vitest'

const allFn = vi.hoisted(() => vi.fn())
const whereFn = vi.hoisted(() => vi.fn(() => ({ all: allFn })))

vi.mock('../server/db/client', () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        orderBy: () => ({
          limit: () => ({
            where: whereFn,
            all: allFn,
          }),
        }),
      }),
    }),
  })),
}))

import { listLogs } from '../server/services/logger.server'

const sampleRow = {
  id: 'log-1',
  agentId: 'agent-a',
  level: 'info',
  message: 'hello world',
  metadataJson: null,
  createdAt: '2026-05-01T12:00:00.000Z',
}

describe('listLogs', () => {
  beforeEach(() => {
    allFn.mockReset()
    whereFn.mockClear()
    allFn.mockReturnValue([sampleRow])
  })

  it('calls qb.all() when no filters', async () => {
    const rows = await listLogs({})
    expect(whereFn).not.toHaveBeenCalled()
    expect(allFn).toHaveBeenCalledTimes(1)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.id).toBe('log-1')
  })

  it('uses where when agentId is set', async () => {
    await listLogs({ agentId: 'agent-a' })
    expect(whereFn).toHaveBeenCalledTimes(1)
    expect(allFn).toHaveBeenCalledTimes(1)
  })

  it('uses where when level is set', async () => {
    await listLogs({ level: 'error' })
    expect(whereFn).toHaveBeenCalledTimes(1)
  })

  it('uses where when query text is set', async () => {
    await listLogs({ query: 'needle' })
    expect(whereFn).toHaveBeenCalledTimes(1)
  })

  it('uses where when sessionId is set', async () => {
    await listLogs({ sessionId: 'demo-session' })
    expect(whereFn).toHaveBeenCalledTimes(1)
  })

  it('uses where when from/to bounds are set', async () => {
    await listLogs({ from: '2026-01-01', to: '2026-12-31' })
    expect(whereFn).toHaveBeenCalledTimes(1)
  })
})
