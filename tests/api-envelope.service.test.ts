import { describe, expect, it } from 'vitest'
import { unwrapApiEnvelope } from '../services/api-envelope.service'

describe('api-envelope.service', () => {
  it('unwraps data from envelope payloads', () => {
    const payload = {
      data: [{ id: 'a1' }],
      meta: { domain: 'openclaw' as const, generatedAt: '2026-01-01T00:00:00.000Z' },
    }
    expect(unwrapApiEnvelope(payload)).toEqual([{ id: 'a1' }])
  })

  it('returns raw payload when envelope is not used', () => {
    const payload = [{ id: 'a1' }]
    expect(unwrapApiEnvelope(payload)).toEqual(payload)
  })
})
