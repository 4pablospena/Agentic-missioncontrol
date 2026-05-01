import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../services/api-client.service'
import { createLogService } from '../services/log.service'

describe('createLogService', () => {
  it('list() builds query string from filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue([])
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createLogService(client)
    await svc.list({
      agentId: 'a1',
      level: 'warn',
      query: 'hello',
      limit: 40,
    })
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toContain('/api/logs?')
    expect(url).toContain('agentId=a1')
    expect(url).toContain('level=warn')
    expect(url).toContain('query=hello')
    expect(url).toContain('limit=40')
  })
})
