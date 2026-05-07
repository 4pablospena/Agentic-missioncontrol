import type { Ref } from 'vue'
import { readonly, ref, watch } from 'vue'
import type {
  CostAnalyticsPayload,
  ErrorSeverityMetric,
  ModelUsageMetric,
  SessionStatusMetric,
  TokenMetricsPayload,
} from '~/models/metric'
import type { MissionControlEvent } from '~/models/realtime'
import { useMcConfig } from '~/composables/useMcConfig'
import { createApiClient } from '~/services/api-client.service'
import { createMetricService, type MetricService } from '~/services/metric.service'

export interface UseMetricsOptions {
  metricService?: MetricService
  events?: Ref<MissionControlEvent[]>
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { apiBase } = useMcConfig()
  const tokens = ref<TokenMetricsPayload | null>(null)
  const models = ref<ModelUsageMetric[]>([])
  const sessions = ref<SessionStatusMetric[]>([])
  const errors = ref<ErrorSeverityMetric[]>([])
  const costs = ref<CostAnalyticsPayload | null>(null)
  const pending = ref(false)
  const errorMsg = ref('')

  function resolveService(): MetricService {
    if (options.metricService)
      return options.metricService
    const client = createApiClient(useRequestFetch(), apiBase.value)
    return createMetricService(client)
  }

  async function refresh() {
    pending.value = true
    errorMsg.value = ''
    try {
      const svc = resolveService()
      const [t, m, s, e, c] = await Promise.all([
        svc.getTokens(),
        svc.getModels(),
        svc.getSessions(),
        svc.getErrors(),
        svc.getCosts(),
      ])
      tokens.value = t
      models.value = m
      sessions.value = s
      errors.value = e
      costs.value = c
    }
    catch (e: unknown) {
      const err = e as { statusMessage?: string, message?: string }
      errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
    }
    finally {
      pending.value = false
    }
  }

  const eventsSource = options.events ?? useRealtimeEvents().events
  watch(
    eventsSource,
    (list) => {
      const last = list[list.length - 1]
      if (last?.type === 'metric.updated')
        void refresh()
    },
    { deep: true },
  )

  return {
    tokens: readonly(tokens),
    models: readonly(models),
    sessions: readonly(sessions),
    errors: readonly(errors),
    costs: readonly(costs),
    pending: readonly(pending),
    errorMsg: readonly(errorMsg),
    refresh,
  }
}
