import { describe, expect, it } from 'vitest'
import { logsQuerySchema } from '../server/utils/logs-query-schema'

describe('logsQuerySchema', () => {
  it('accepts empty query', () => {
    const r = logsQuerySchema.safeParse({})
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data).toEqual({})
  })

  it('coerces limit and accepts boundaries', () => {
    expect(logsQuerySchema.safeParse({ limit: '200' }).success).toBe(true)
    expect(logsQuerySchema.safeParse({ limit: 1 }).success).toBe(true)
    expect(logsQuerySchema.safeParse({ limit: 500 }).success).toBe(true)
  })

  it('rejects limit below 1 or above 500', () => {
    expect(logsQuerySchema.safeParse({ limit: 0 }).success).toBe(false)
    expect(logsQuerySchema.safeParse({ limit: 501 }).success).toBe(false)
  })

  it('accepts optional filters', () => {
    const r = logsQuerySchema.safeParse({
      agentId: 'ag-1',
      level: 'warn',
      query: 'needle',
      from: '2026-01-01',
      to: '2026-01-02',
      sessionId: 'sess',
      taskId: 'task-1',
      limit: 50,
    })
    expect(r.success).toBe(true)
  })

  it('rejects invalid level', () => {
    expect(logsQuerySchema.safeParse({ level: 'verbose' }).success).toBe(false)
  })
})
