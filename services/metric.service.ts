import type {
  ErrorSeverityMetric,
  ModelUsageMetric,
  SessionStatusMetric,
  TokenMetricsPayload,
} from '~/models/metric'
import type { ApiClient } from '~/services/api-client.service'

export interface MetricService {
  getTokens(): Promise<TokenMetricsPayload>
  getModels(): Promise<ModelUsageMetric[]>
  getSessions(): Promise<SessionStatusMetric[]>
  getErrors(): Promise<ErrorSeverityMetric[]>
}

export function createMetricService(client: ApiClient): MetricService {
  return {
    getTokens() {
      return client.get<TokenMetricsPayload>('/api/metrics/tokens')
    },
    getModels() {
      return client.get<ModelUsageMetric[]>('/api/metrics/models')
    },
    getSessions() {
      return client.get<SessionStatusMetric[]>('/api/metrics/sessions')
    },
    getErrors() {
      return client.get<ErrorSeverityMetric[]>('/api/metrics/errors')
    },
  }
}
