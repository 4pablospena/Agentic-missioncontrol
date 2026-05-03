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

    process.env.NUXT_WORKSPACE_ROOT = wsRoot
    srv = await startIntegrationServer()
    cookie = await loginSessionCookie(srv.baseUrl, srv.auth.email, srv.auth.password)
  }, 120_000)

  afterAll(async () => {
    srv?.stop()
    delete process.env.NUXT_WORKSPACE_ROOT
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
    const body = await res.json() as { entries: Array<{ name: string, kind: string }> }
    const names = body.entries.map(e => e.name)
    expect(names).toContain('README.md')
    expect(names).toContain('docs')
  })

  it('GET /api/workspace/file returns text content', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/file?path=README.md`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { content: string, encoding: string }
    expect(body.encoding).toBe('utf-8')
    expect(body.content).toContain('Hello')
  })

  it('GET /api/workspace/search finds matches', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/search?q=findme`, {
      headers: { Cookie: cookie },
    })
    expect(res.ok).toBe(true)
    const body = await res.json() as { hits: Array<{ path: string, line: number }> }
    expect(body.hits.length).toBeGreaterThan(0)
    expect(body.hits[0]!.path).toBe('docs/note.md')
  })

  it('GET /api/workspace/file rejects traversal', async () => {
    const res = await fetch(`${srv.baseUrl}/api/workspace/file?path=../etc/passwd`, {
      headers: { Cookie: cookie },
    })
    expect(res.status).toBe(400)
  })
})
