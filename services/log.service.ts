import type { ApiClient } from '~/services/api-client.service'
import type { LogEntry } from '~/models/log'

export interface CreateLogPayload {
  level: LogEntry['level']
  message: string
  agentId?: string
  metadata?: Record<string, unknown>
}

export function createLogService(client: ApiClient) {
  return {
    list(): Promise<LogEntry[]> {
      return client.get<LogEntry[]>('/api/logs')
    },
    create(payload: CreateLogPayload): Promise<LogEntry> {
      return client.post<CreateLogPayload, LogEntry>('/api/logs', payload)
    },
  }
}
