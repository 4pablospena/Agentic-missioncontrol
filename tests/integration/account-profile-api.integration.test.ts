import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Buffer } from 'node:buffer'
import {
  loginSessionCookie,
  startIntegrationServer,
  type IntegrationServer,
} from './helpers/server'

/** Smallest valid PNG (1×1). */
const MIN_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('account profile API (integration)', () => {
  let srv: IntegrationServer
  let cookie: string

  beforeAll(async () => {
    srv = await startIntegrationServer()
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(() => {
    srv?.stop()
  })

  it('PATCH /api/account/profile without session returns 401', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Someone' }),
    })
    expect(res.status).toBe(401)
  })

  it('PATCH /api/account/profile updates display name', async () => {
    const nextName = `Integration Operator ${Date.now()}`
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: nextName }),
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { user: { name: string, email: string, role: string } }
    expect(body.user.name).toBe(nextName)
    expect(body.user.email).toBe(srv.auth.email)
    expect(body.user.role).toBe('admin')
  })

  it('PATCH /api/account/profile rejects empty name', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '   ' }),
    })
    expect(res.status).toBe(400)
  })

  it('PATCH /api/account/profile stores HTTPS avatar URL', async () => {
    const url = 'https://www.w3.org/Icons/valid-xhtml10'
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `Avatar User ${Date.now()}`, avatarUrl: url }),
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { user: { avatarUrl?: string } }
    expect(body.user.avatarUrl).toBe(url)
  })

  it('PATCH /api/account/profile clears avatar when avatarUrl is empty', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `Clear Avatar ${Date.now()}`, avatarUrl: '' }),
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { user: { avatarUrl?: string } }
    expect(body.user.avatarUrl).toBeUndefined()
  })

  it('PATCH /api/account/profile rejects HTTP avatar URL', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/profile`, {
      method: 'PATCH',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Bad avatar',
        avatarUrl: 'http://example.org/x.png',
      }),
    })
    expect(res.status).toBe(400)
  })

  it('POST /api/account/avatar without session returns 401', async () => {
    const png = Buffer.from(MIN_PNG_BASE64, 'base64')
    const blob = new Blob([png], { type: 'image/png' })
    const fd = new FormData()
    fd.append('file', blob, 'tiny.png')
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`, {
      method: 'POST',
      body: fd,
    })
    expect(res.status).toBe(401)
  })

  it('POST /api/account/avatar accepts PNG upload', async () => {
    const png = Buffer.from(MIN_PNG_BASE64, 'base64')
    const blob = new Blob([png], { type: 'image/png' })
    const fd = new FormData()
    fd.append('file', blob, 'tiny.png')
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`, {
      method: 'POST',
      headers: { Cookie: cookie },
      body: fd,
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { user: { avatarUrl?: string } }
    expect(body.user.avatarUrl).toBe('/api/account/avatar')
  })

  it('GET /api/account/avatar returns PNG when uploaded', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    expect(res.headers.get('content-type')).toBe('image/png')
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50)
  })

  it('GET /api/account/avatar without session returns 401', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`)
    expect(res.status).toBe(401)
  })

  it('DELETE /api/account/avatar removes file and session avatarUrl', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { user: { avatarUrl?: string } }
    expect(body.user.avatarUrl).toBeUndefined()
  })

  it('GET /api/account/avatar returns 404 after delete', async () => {
    const res = await fetch(`${srv.baseUrl}/api/account/avatar`, {
      headers: { Cookie: cookie },
    })
    expect(res.status).toBe(404)
  })
})
