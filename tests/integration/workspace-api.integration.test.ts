import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  loginSessionCookie,
  startIntegrationServer,
  type IntegrationServer,
} from './helpers/server'

describe('workspace API (integration)', () => {
  let srv: IntegrationServer
  let cookie: string
  let wsRoot: string

  beforeAll(async () => {
    wsRoot = await mkdtemp(join(tmpdir(), 'mc-wsapi-'))
    await mkdir(join(wsRoot, 'docs'), { recursive: true })
    await writeFile(join(wsRoot, 'README.md'), '# Hello\nIntegration line\n')
    await writeFile(join(wsRoot, 'docs', 'note.md'), 'lorem\nfindme integration\nipsum\n')

    srv = await startIntegrationServer({ NUXT_WORKSPACE_ROOT: wsRoot })
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(async () => {
    srv?.stop()
    if (wsRoot)
      await rm(wsRoot, { recursive: true, force: true })
  })

  it('GET /api/workspace/tree without session returns 401/302', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/tree`)
    expect([401, 302, 403]).toContain(res.status)
  })

  it('GET /api/workspace/tree lists root entries', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/tree`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const envelope = await res.json() as {
      data: { entries: Array<{ name: string, kind: string }> }
    }
    const names = envelope.data.entries.map(e => e.name)
    expect(names).toContain('README.md')
    expect(names).toContain('docs')
  })

  it('GET /api/workspace/file returns text content', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/file?path=README.md`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const envelope = await res.json() as { data: { content: string, encoding: string } }
    expect(envelope.data.encoding).toBe('utf-8')
    expect(envelope.data.content).toContain('Hello')
  })

  it('GET /api/workspace/search finds matches', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/search?q=findme`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const envelope = await res.json() as { data: { hits: Array<{ path: string, line: number }> } }
    expect(envelope.data.hits.length).toBeGreaterThan(0)
    expect(envelope.data.hits[0]!.path).toBe('docs/note.md')
  })

  it('GET /api/workspace/file rejects traversal', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/file?path=../etc/passwd`, {
      headers: { Cookie: cookie },
    })
    expect(res.status).toBe(400)
  })
})
