import { describe, expect, it, vi } from 'vitest'
import { createApiClient } from '../services/api-client.service'
import { createNotificationService } from '../services/notification.service'

describe('createNotificationService', () => {
  it('list() forwards status and limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue([])
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createNotificationService(client)
    await svc.list({ status: 'unread', limit: 10 })
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toBe('/api/notifications?status=unread&limit=10')
  })

  it('markRead posts to the right path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({})
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createNotificationService(client)
    await svc.markRead('abc/def')
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toBe('/api/notifications/abc%2Fdef/read')
  })

  it('markAllRead posts to read-all', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ updated: 0 })
    const client = createApiClient(fetchMock as Parameters<typeof createApiClient>[0], '')
    const svc = createNotificationService(client)
    await svc.markAllRead()
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toBe('/api/notifications/read-all')
  })
})
