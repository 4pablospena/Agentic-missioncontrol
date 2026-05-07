import type { Agent } from '~/models/agent'
import type { Alert, AlertSeverity } from '~/models/alert'
import type {
  CostAnalyticsPayload,
  CostByAgentMetric,
  CostByModelMetric,
  CostTrendPoint,
  ErrorSeverityMetric,
  ModelUsageMetric,
  SessionStatusMetric,
  TokenMetricsPayload,
} from '~/models/metric'

export function buildTokenMetrics(agents: Agent[]): TokenMetricsPayload {
  const byAgent = agents.map(a => ({
    agentId: a.id,
    agentName: a.name,
    tokens: a.tokenUsage ?? 0,
  }))
  const total = byAgent.reduce((s, x) => s + x.tokens, 0)
  return { byAgent, total }
}

export function buildModelUsage(agents: Agent[]): ModelUsageMetric[] {
  const map = new Map<string, number>()
  for (const a of agents) {
    const model = a.model?.trim() || 'unknown'
    map.set(model, (map.get(model) ?? 0) + (a.tokenUsage ?? 0))
  }
  return [...map.entries()].map(([model, tokens]) => ({ model, tokens }))
}

export function buildSessionStatuses(agents: Agent[]): SessionStatusMetric[] {
  const map = new Map<string, number>()
  for (const a of agents)
    map.set(a.status, (map.get(a.status) ?? 0) + 1)
  return [...map.entries()].map(([status, count]) => ({ status, count }))
}

export function buildErrorSeverities(alertList: Alert[]): ErrorSeverityMetric[] {
  const map = new Map<AlertSeverity, number>()
  for (const a of alertList) {
    if (a.acknowledged)
      continue
    map.set(a.severity, (map.get(a.severity) ?? 0) + 1)
  }
  const severities: AlertSeverity[] = ['critical', 'warning', 'info']
  return severities.filter(s => (map.get(s) ?? 0) > 0).map(severity => ({
    severity,
    count: map.get(severity) ?? 0,
  }))
}

const DEFAULT_PRICE_PER_TOKEN = 0.000002

export function buildCostAnalytics(
  agents: Agent[],
  options: { pricePerToken?: number } = {},
): CostAnalyticsPayload {
  const pricePerToken = options.pricePerToken ?? DEFAULT_PRICE_PER_TOKEN
  const byAgent: CostByAgentMetric[] = agents
    .map((agent) => {
      const tokens = agent.tokenUsage ?? 0
      return {
        agentId: agent.id,
        agentName: agent.name,
        model: agent.model?.trim() || 'unknown',
        tokens,
        estimatedUsd: Number((tokens * pricePerToken).toFixed(6)),
      }
    })
    .sort((a, b) => b.estimatedUsd - a.estimatedUsd)

  const byModelMap = new Map<string, number>()
  for (const row of byAgent)
    byModelMap.set(row.model, (byModelMap.get(row.model) ?? 0) + row.tokens)

  const byModel: CostByModelMetric[] = [...byModelMap.entries()]
    .map(([model, tokens]) => ({
      model,
      tokens,
      estimatedUsd: Number((tokens * pricePerToken).toFixed(6)),
    }))
    .sort((a, b) => b.estimatedUsd - a.estimatedUsd)

  const sortedTokenValues = byAgent.map(row => row.tokens).sort((a, b) => a - b)
  const medianTokens = sortedTokenValues.length
    ? sortedTokenValues[Math.floor(sortedTokenValues.length / 2)] ?? 0
    : 0
  const anomalyThreshold = Math.max(medianTokens * 1.7, 1)
  const anomalies = byAgent
    .filter(row => row.tokens > anomalyThreshold)
    .map(row => ({
      type: 'spike' as const,
      label: row.agentName,
      value: row.tokens,
      threshold: Number(anomalyThreshold.toFixed(2)),
    }))

  const trend: CostTrendPoint[] = ['6h', '24h', '7d'].map((rangeLabel, index) => {
    const rangeFactor = index + 1
    const tokens = byAgent.reduce((sum, row) => sum + Math.round(row.tokens / rangeFactor), 0)
    return {
      rangeLabel,
      tokens,
      estimatedUsd: Number((tokens * pricePerToken).toFixed(6)),
    }
  })

  const totalUsd = Number(byAgent.reduce((sum, row) => sum + row.estimatedUsd, 0).toFixed(6))

  return {
    totalUsd,
    byAgent,
    byModel,
    trend,
    anomalies,
  }
}
