import { describe, expect, it, vi } from 'vitest'
import { withApiEnvelope } from '../server/utils/api-envelope'

describe('api-envelope.server', () => {
  it('builds envelope with metadata', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-07T00:00:00.000Z'))
    const envelope = withApiEnvelope('metrics', { total: 42 })
    expect(envelope).toEqual({
      data: { total: 42 },
      meta: {
        domain: 'metrics',
        generatedAt: '2026-05-07T00:00:00.000Z',
      },
    })
    vi.useRealTimers()
  })
})
