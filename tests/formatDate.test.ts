import { describe, expect, it } from 'vitest'
import { formatIso } from '../utils/formatDate'

describe('formatIso', () => {
  it('formats valid ISO strings', () => {
    const out = formatIso('2026-05-01T12:00:00.000Z')
    expect(out.length).toBeGreaterThan(4)
  })

  it('returns original when invalid', () => {
    expect(formatIso('not-a-date')).toBe('not-a-date')
  })
})
