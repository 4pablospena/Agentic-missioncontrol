import { describe, expect, it } from 'vitest'
import { isValidCronExpression, nextCronRunIso } from '~/utils/isValidCronExpression'

describe('isValidCronExpression', () => {
  it('accepts standard five-field cron', () => {
    expect(isValidCronExpression('*/5 * * * *')).toBe(true)
  })

  it('rejects empty', () => {
    expect(isValidCronExpression('')).toBe(false)
  })

  it('nextCronRunIso returns ISO string', () => {
    const next = nextCronRunIso('*/5 * * * *', new Date('2026-05-01T12:00:00.000Z'))
    expect(next).toMatch(/^\d{4}-/)
  })
})
