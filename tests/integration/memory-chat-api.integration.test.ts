import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  loginSessionCookie,
  startIntegrationServer,
  type IntegrationServer,
} from './helpers/server'

describe('memory & chat API (integration)', () => {
  let srv: IntegrationServer
  let cookie: string

  beforeAll(async () => {
    srv = await startIntegrationServer()
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(() => {
    srv?.stop()
  })

  it('POST /api/memory/inject then POST /api/memory/search finds text', async () => {
    const content = `integration-memory-${Date.now()}`
    const inj = await fetch(`${srv.baseUrl}/api/memory/inject`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'main',
        content,
      }),
    })
    expect(inj.ok).toBe(true)

    const search = await fetch(`${srv.baseUrl}/api/memory/search`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: content,
        agentId: 'main',
        limit: 5,
      }),
    })
    expect(search.ok).toBe(true)
    const body = await search.json() as Array<{ memory: { content: string } }>
    expect(Array.isArray(body)).toBe(true)
    expect(body.some(r => r.memory.content === content)).toBe(true)
  })

  it('POST /api/chat/sarbina/messages returns assistant reply', async () => {
    const res = await fetch(`${srv.baseUrl}/api/chat/sarbina/messages`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'ping integration' }),
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { assistantMessage: { role: string, content: string } }
    expect(body.assistantMessage.role).toBe('assistant')
    expect(body.assistantMessage.content.length).toBeGreaterThan(0)
  })
})
