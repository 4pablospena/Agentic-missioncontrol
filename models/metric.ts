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

export interface CostByAgentMetric {
  agentId: string
  agentName: string
  model: string
  tokens: number
  estimatedUsd: number
}

export interface CostByModelMetric {
  model: string
  tokens: number
  estimatedUsd: number
}

export interface CostTrendPoint {
  rangeLabel: string
  tokens: number
  estimatedUsd: number
}

export interface CostAnomaly {
  type: 'spike'
  label: string
  value: number
  threshold: number
}

export interface CostAnalyticsPayload {
  totalUsd: number
  byAgent: CostByAgentMetric[]
  byModel: CostByModelMetric[]
  trend: CostTrendPoint[]
  anomalies: CostAnomaly[]
}
