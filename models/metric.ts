import type { AlertSeverity } from '~/models/alert'

/** Point series for charts — normalized before hitting chart components. */
export interface NamedSeriesPoint {
  label: string
  value: number
}

export interface TokenUsageByAgent {
  agentId: string
  agentName: string
  tokens: number
}

export interface TokenMetricsPayload {
  byAgent: TokenUsageByAgent[]
  total: number
}

export interface ModelUsageMetric {
  model: string
  tokens: number
}

export interface SessionStatusMetric {
  status: string
  count: number
}

export interface ErrorSeverityMetric {
  severity: AlertSeverity
  count: number
}
