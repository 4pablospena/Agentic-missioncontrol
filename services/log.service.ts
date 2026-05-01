import type { LogFilters } from '~/models/log-filters'
import type { ApiClient } from '~/services/api-client.service'
import type { LogEntry } from '~/models/log'

export interface CreateLogPayload {
  level: LogEntry['level']
  message: string
  agentId?: string
  metadata?: Record<string, unknown>
}

export interface LogService {
  list(filters?: LogFilters & { limit?: number }): Promise<LogEntry[]>
  create(payload: CreateLogPayload): Promise<LogEntry>
}

function appendParams(params: URLSearchParams, filters: LogFilters & { limit?: number }) {
  if (filters.agentId)
    params.set('agentId', filters.agentId)
  if (filters.level)
    params.set('level', filters.level)
  if (filters.query)
    params.set('query', filters.query)
  if (filters.from)
    params.set('from', filters.from)
  if (filters.to)
    params.set('to', filters.to)
  if (filters.sessionId)
    params.set('sessionId', filters.sessionId)
  if (filters.limit != null)
    params.set('limit', String(filters.limit))
}

export function createLogService(client: ApiClient): LogService {
  return {
    list(filters = {}) {
      const params = new URLSearchParams()
      appendParams(params, filters)
      const qs = params.toString()
      return client.get<LogEntry[]>(`/api/logs${qs ? `?${qs}` : ''}`)
    },
    create(payload: CreateLogPayload): Promise<LogEntry> {
      return client.post<CreateLogPayload, LogEntry>('/api/logs', payload)
    },
  }
}
