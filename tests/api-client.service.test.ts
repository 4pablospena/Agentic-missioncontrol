import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../services/api-client.service'

describe('createApiClient', () => {
  it('GET forwards path and method', async () => {
    const fetchMock = vi.fn().mockResolvedValue([{ id: '1' }])
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const data = await client.get<{ id: string }[]>('/api/logs')
    expect(fetchMock).toHaveBeenCalledWith('/api/logs', expect.objectContaining({ method: 'GET' }))
    expect(data).toEqual([{ id: '1' }])
  })

  it('POST sends JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '/prefix')
    await client.post('/api/logs', { level: 'info', message: 'x' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/prefix/api/logs',
      expect.objectContaining({
        method: 'POST',
        body: { level: 'info', message: 'x' },
      }),
    )
  })

  it('PATCH sends JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ alert: { id: '1' } })
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    await client.patch('/api/alerts/x/acknowledge', {})
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/alerts/x/acknowledge',
      expect.objectContaining({
        method: 'PATCH',
        body: {},
      }),
    )
  })
})
