import { describe, expect, it, vi } from 'vitest'
import {
  createLogEntry,
  mapLogRowToLogEntry,
} from '../server/services/logger.server'

const insertRun = vi.hoisted(() => vi.fn())

vi.mock('../server/db/client', () => ({
  getDb: vi.fn(() => ({
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ run: insertRun })),
    })),
  })),
}))

describe('mapLogRowToLogEntry', () => {
  it('maps row without metadata', () => {
    expect(
      mapLogRowToLogEntry({
        id: 'x',
        agentId: null,
        level: 'info',
        message: 'm',
        metadataJson: null,
        createdAt: 't',
      }),
    ).toEqual({
      id: 'x',
      level: 'info',
      message: 'm',
      createdAt: 't',
    })
  })

  it('parses metadata JSON', () => {
    expect(
      mapLogRowToLogEntry({
        id: 'x',
        agentId: 'a',
        level: 'warn',
        message: 'm',
        metadataJson: '{"k":1}',
        createdAt: 't',
      }).metadata,
    ).toEqual({ k: 1 })
  })

  it('invalid JSON yields undefined metadata', () => {
    expect(
      mapLogRowToLogEntry({
        id: 'x',
        agentId: null,
        level: 'error',
        message: 'm',
        metadataJson: '{',
        createdAt: 't',
      }).metadata,
    ).toBeUndefined()
  })
})

describe('createLogEntry', () => {
  it('persists via drizzle insert', async () => {
    insertRun.mockClear()
    await createLogEntry({ level: 'info', message: 'hello' })
    expect(insertRun).toHaveBeenCalledTimes(1)
  })
})
