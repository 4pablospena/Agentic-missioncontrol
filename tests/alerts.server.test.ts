import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => {
  const listAll = vi.fn()
  const get = vi.fn()
  const updateRun = vi.fn()
  const insertRun = vi.fn()
  return {
    listAll,
    get,
    updateRun,
    insertRun,
    getDb() {
      return {
        select() {
          return {
            from() {
              return {
                orderBy() {
                  return {
                    limit() {
                      return { all: listAll }
                    },
                  }
                },
                where() {
                  return { get }
                },
              }
            },
          }
        },
        update() {
          return {
            set() {
              return {
                where() {
                  return { run: updateRun }
                },
              }
            },
          }
        },
        insert() {
          return {
            values() {
              return { run: insertRun }
            },
          }
        },
      }
    },
  }
})

vi.mock('../server/db/client', () => ({
  getDb: () => h.getDb(),
}))

import {
  acknowledgeAlert,
  createAlertEntry,
  listAlerts,
} from '../server/services/alerts.server'

const row = {
  id: 'al-1',
  agentId: 'ag',
  severity: 'warn' as const,
  title: 't',
  message: 'm',
  acknowledged: false,
  createdAt: '2026-05-01T00:00:00.000Z',
}

describe('alerts.server', () => {
  beforeEach(() => {
    h.listAll.mockReset()
    h.get.mockReset()
    h.updateRun.mockReset()
    h.insertRun.mockReset()
  })

  it('listAlerts maps rows', async () => {
    h.listAll.mockReturnValue([row])
    const alerts = await listAlerts(50)
    expect(alerts).toHaveLength(1)
    expect(alerts[0]?.id).toBe('al-1')
    expect(alerts[0]?.severity).toBe('warn')
  })

  it('acknowledgeAlert updates existing row', async () => {
    h.get
      .mockReturnValueOnce({ ...row, acknowledged: false })
      .mockReturnValueOnce({ ...row, acknowledged: true })
    const updated = await acknowledgeAlert('al-1')
    expect(h.updateRun).toHaveBeenCalledTimes(1)
    expect(updated?.acknowledged).toBe(true)
    expect(h.get).toHaveBeenCalledTimes(2)
  })

  it('acknowledgeAlert returns null when missing', async () => {
    h.get.mockReturnValueOnce(undefined)
    const updated = await acknowledgeAlert('missing')
    expect(updated).toBeNull()
    expect(h.updateRun).not.toHaveBeenCalled()
  })

  it('createAlertEntry inserts and returns mapped alert', async () => {
    const created = {
      ...row,
      id: 'new-id',
      severity: 'error' as const,
      acknowledged: false,
    }
    h.get.mockReturnValueOnce(created)
    const alert = await createAlertEntry({
      agentId: 'ag',
      severity: 'error',
      title: 't',
      message: 'm',
    })
    expect(h.insertRun).toHaveBeenCalledTimes(1)
    expect(alert.id).toBe('new-id')
    expect(alert.severity).toBe('error')
  })
})
