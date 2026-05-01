import type { Alert } from '~/models/alert'
import type { ApiClient } from '~/services/api-client.service'

export interface CreateAlertPayload {
  agentId?: string
  severity: Alert['severity']
  title: string
  message: string
}

export interface AlertService {
  list(): Promise<Alert[]>
  create(payload: CreateAlertPayload): Promise<Alert>
  acknowledge(alertId: string): Promise<Alert>
}

export function createAlertService(client: ApiClient): AlertService {
  return {
    list() {
      return client.get<Alert[]>('/api/alerts')
    },
    create(payload: CreateAlertPayload) {
      return client.post<CreateAlertPayload, Alert>('/api/alerts', payload)
    },
    async acknowledge(alertId: string) {
      const res = await client.patch<
        Record<string, never>,
        { alert: Alert }
      >(`/api/alerts/${encodeURIComponent(alertId)}/acknowledge`, {})
      return res.alert
    },
  }
}
