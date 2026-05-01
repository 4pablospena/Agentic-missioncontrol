import type { LogEntry } from '~/models/log'

/** Filters for listing logs (API query + UI). Distinct from `LogEntry`. */
export interface LogFilters {
  agentId?: string
  level?: LogEntry['level']
  query?: string
  from?: string
  to?: string
  /** Restrict to logs whose metadata JSON contains this session id. */
  sessionId?: string
}
