import type { Notification, NotificationStatusFilter } from '~/models/notification'
import type { ApiClient } from '~/services/api-client.service'
import { unwrapApiEnvelope } from './api-envelope.service'

export interface ListNotificationsParams {
  status?: NotificationStatusFilter
  limit?: number
}

export interface NotificationService {
  list(params?: ListNotificationsParams): Promise<Notification[]>
  markRead(id: string): Promise<Notification>
  markAllRead(): Promise<{ updated: number }>
}

export function createNotificationService(client: ApiClient): NotificationService {
  return {
    list(params: ListNotificationsParams = {}) {
      const search = new URLSearchParams()
      if (params.status)
        search.set('status', params.status)
      if (params.limit != null)
        search.set('limit', String(params.limit))
      const qs = search.toString()
      return client
        .get<Notification[]>(`/api/notifications${qs ? `?${qs}` : ''}`)
        .then(unwrapApiEnvelope)
    },
    markRead(id: string) {
      return client.post<Record<string, never>, Notification>(
        `/api/notifications/${encodeURIComponent(id)}/read`,
        {},
      ).then(unwrapApiEnvelope)
    },
    markAllRead() {
      return client.post<Record<string, never>, { updated: number }>(
        '/api/notifications/read-all',
        {},
      ).then(unwrapApiEnvelope)
    },
  }
}
