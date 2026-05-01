import { describe, expect, it } from 'vitest'
import { tasksQuerySchema } from '../server/utils/tasks-query-schema'

describe('tasksQuerySchema', () => {
  it('accepts empty query', () => {
    const r = tasksQuerySchema.safeParse({})
    expect(r.success).toBe(true)
  })

  it('accepts known filters', () => {
    const r = tasksQuerySchema.safeParse({
      status: 'queued',
      assignedAgentId: 'a1',
      priority: 'high',
    })
    expect(r.success).toBe(true)
  })

  it('rejects unknown status', () => {
    expect(tasksQuerySchema.safeParse({ status: 'pending' }).success).toBe(false)
  })
})
