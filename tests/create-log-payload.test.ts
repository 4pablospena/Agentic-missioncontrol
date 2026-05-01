import { describe, expect, it } from 'vitest'
import { createLogBodySchema, parseCreateLogBody } from '../server/utils/create-log-payload'

describe('parseCreateLogBody', () => {
  it('accepts minimal valid payload', () => {
    const input = { level: 'info', message: 'hello' }
    expect(parseCreateLogBody(input)).toEqual({ ok: true, data: input })
  })

  it('accepts optional agentId and metadata', () => {
    const input = {
      level: 'warn',
      message: 'check',
      agentId: 'agent-1',
      metadata: { key: 'value' },
    }
    expect(parseCreateLogBody(input)).toEqual({ ok: true, data: input })
  })

  it('rejects invalid level', () => {
    const result = parseCreateLogBody({ level: 'critical', message: 'x' })
    expect(result.ok).toBe(false)
    if (!result.ok)
      expect(result.issues.length).toBeGreaterThan(0)
  })

  it('rejects empty message', () => {
    const result = parseCreateLogBody({ level: 'info', message: '' })
    expect(result.ok).toBe(false)
  })
})

describe('createLogBodySchema', () => {
  it('parses known levels', () => {
    for (const level of ['debug', 'info', 'warn', 'error'] as const) {
      expect(createLogBodySchema.safeParse({ level, message: 'ok' }).success).toBe(true)
    }
  })
})
