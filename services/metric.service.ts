import type {
  CostAnalyticsPayload,
  ErrorSeverityMetric,
  ModelUsageMetric,
  SessionStatusMetric,
  TokenMetricsPayload,
} from '~/models/metric'
import type { ApiClient } from '~/services/api-client.service'
import { unwrapApiEnvelope } from './api-envelope.service'

export interface MetricService {
  getTokens(): Promise<TokenMetricsPayload>
  getModels(): Promise<ModelUsageMetric[]>
  getSessions(): Promise<SessionStatusMetric[]>
  getErrors(): Promise<ErrorSeverityMetric[]>
  getCosts(): Promise<CostAnalyticsPayload>
}

export function createMetricService(client: ApiClient): MetricService {
  return {
    getTokens() {
      return client
        .get<TokenMetricsPayload>('/api/metrics/tokens')
        .then(unwrapApiEnvelope)
    },
    getModels() {
      return client
        .get<ModelUsageMetric[]>('/api/metrics/models')
        .then(unwrapApiEnvelope)
    },
    getSessions() {
      return client
        .get<SessionStatusMetric[]>('/api/metrics/sessions')
        .then(unwrapApiEnvelope)
    },
    getErrors() {
      return client
        .get<ErrorSeverityMetric[]>('/api/metrics/errors')
        .then(unwrapApiEnvelope)
    },
    getCosts() {
      return client
        .get<CostAnalyticsPayload>('/api/metrics/costs')
        .then(unwrapApiEnvelope)
    },
  }
}
