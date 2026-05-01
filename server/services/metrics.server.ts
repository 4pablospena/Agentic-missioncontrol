import type { Agent } from '~/models/agent'
import type { Alert, AlertSeverity } from '~/models/alert'
import type {
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
