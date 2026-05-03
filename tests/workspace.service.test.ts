import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../services/api-client.service'
import { createWorkspaceService } from '../services/workspace.service'

describe('createWorkspaceService', () => {
  it('getTree includes path query when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createWorkspaceService(client)
    await svc.getTree('docs')
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/workspace/tree?path=docs')
  })

  it('getTree omits path query when empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createWorkspaceService(client)
    await svc.getTree()
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/workspace/tree')
  })

  it('getFile sends path query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createWorkspaceService(client)
    await svc.getFile('README.md')
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/workspace/file?path=README.md')
  })

  it('search forwards q, path and exts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createWorkspaceService(client)
    await svc.search({ query: 'hello', path: 'src', exts: ['ts', 'vue'] })
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toBe('/api/workspace/search?q=hello&path=src&exts=ts%2Cvue')
  })
})
