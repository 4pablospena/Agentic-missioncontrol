import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  loginSessionCookie,
  startIntegrationServer,
  type IntegrationServer,
} from './helpers/server'

describe('notifications API (integration)', () => {
  let srv: IntegrationServer
  let cookie: string

  beforeAll(async () => {
    srv = await startIntegrationServer()
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(() => {
    srv?.stop()
  })

  it('GET /api/notifications without session returns 401/302', async () => {
    const res = await fetch(`${srv.baseUrl}/api/notifications`)
    expect([401, 302, 403]).toContain(res.status)
  })

  it('GET /api/notifications returns array', async () => {
    const res = await fetch(`${srv.baseUrl}/api/notifications`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as unknown
    expect(Array.isArray(body)).toBe(true)
  })

  it('persists notification after a task.failed alert is posted', async () => {
    const alert = await fetch(`${srv.baseUrl}/api/alerts`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        severity: 'critical',
        title: `integration-notif-${Date.now()}`,
        message: 'should be persisted',
      }),
    })
    expect(alert.ok).toBe(true)

    // Allow the broadcast tap to flush its async write before listing.
    await new Promise(resolve => setTimeout(resolve, 200))

    const list = await fetch(`${srv.baseUrl}/api/notifications?status=all&limit=20`, {
      headers: { Cookie: cookie },
    })
    expect(list.ok).toBe(true)
    const items = await list.json() as Array<{ type: string, severity: string, title: string }>
    expect(items.some(n => n.type === 'alert.created' && typeof n.title === 'string')).toBe(true)
  })

  it('POST /api/notifications/:id/read marks the row as read', async () => {
    const list = await fetch(`${srv.baseUrl}/api/notifications?status=unread&limit=5`, {
      headers: { Cookie: cookie },
    })
    const items = await list.json() as Array<{ id: string }>
    if (items.length === 0)
      return // nothing unread; skip without failing

    const id = items[0]!.id
    const upd = await fetch(`${srv.baseUrl}/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(upd.ok).toBe(true)
    const body = await upd.json() as { id: string, read: boolean }
    expect(body.id).toBe(id)
    expect(body.read).toBe(true)
  })

  it('POST /api/notifications/read-all marks remaining unread rows', async () => {
    const upd = await fetch(`${srv.baseUrl}/api/notifications/read-all`, {
      method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(upd.ok).toBe(true)
    const body = await upd.json() as { updated: number }
    expect(body.updated).toBeGreaterThanOrEqual(0)

    const after = await fetch(`${srv.baseUrl}/api/notifications?status=unread`, {
      headers: { Cookie: cookie },
    })
    const items = await after.json() as Array<{ id: string }>
    expect(items.length).toBe(0)
  })
})
