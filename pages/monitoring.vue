<script setup lang="ts">
import type { NamedSeriesPoint } from '~/models/metric'

definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, error, isLoading, refresh } = useAgents({ events })
const {
  logs: recentLogs,
  pending: logsPending,
  refresh: refreshLogs,
} = useLogs({ events, listLimit: 12 })
const {
  alerts,
  pending: alertsPending,
  acknowledge,
  ackPendingId,
  refresh: refreshAlerts,
} = useAlerts({ events })
const {
  tokens,
  models,
  sessions,
  errors,
  costs,
  pending: metricsPending,
  refresh: refreshMetrics,
} = useMetrics({ events })
const { public: publicConfig } = useRuntimeConfig()

const tokenSeries = computed<NamedSeriesPoint[]>(() => {
  const t = tokens.value
  if (!t)
    return []
  return t.byAgent.map(a => ({ label: a.agentName, value: a.tokens }))
})

const tokenMax = computed(() =>
  Math.max(1, ...tokenSeries.value.map(s => s.value)),
)
const advancedAnalyticsEnabled = computed(() => publicConfig.advancedAnalyticsEnabled === true)
const estimatedCostUsd = computed(() => {
  const totalTokens = tokens.value?.total ?? 0
  return (totalTokens * 0.000002).toFixed(4)
})

function refreshAll() {
  void refresh()
  void refreshLogs()
  void refreshAlerts()
  void refreshMetrics()
}

onMounted(() => {
  refreshAll()
})
</script>

<template>
  <DashboardPageShell
    title="Monitorización"
    subtitle="Métricas, alertas y actividad del bridge OpenClaw"
    icon="i-lucide-activity"
    accent-color="cyan"
  >
    <template #actions>
      <RetroButton
        color="cyan"
        variant="outline"
        size="sm"
        icon="i-lucide-rotate-ccw"
        :loading="isLoading || metricsPending || alertsPending"
        @click="refreshAll"
      >
        <span class="hidden sm:inline">Actualizar</span>
      </RetroButton>
    </template>

    <div class="flex flex-col gap-8">
      <DashboardBridgeConnectionStatus class="max-w-2xl" accent-color="cyan" />
      <MetricsMonitoringPageIntro />

        <section aria-labelledby="monitoring-metrics-heading">
          <h2 id="monitoring-metrics-heading" class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
            Métricas instantáneas
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricsMetricCard
            title="Agentes"
            :value="agents.length"
            description="Desde el bridge OpenClaw"
          />
          <MetricsMetricCard
            title="Tokens totales"
            :value="tokens?.total ?? '—'"
            description="Suma de agentes listados"
          />
          <MetricsMetricCard
            title="Alertas abiertas"
            :value="alerts.filter(a => !a.acknowledged).length"
            description="Sin reconocer"
          />
          <MetricsMetricCard
            title="Registros recientes"
            :value="recentLogs.length"
            description="Últimas 12 filas"
          />
          </div>
        </section>

        <section v-if="advancedAnalyticsEnabled" aria-labelledby="monitoring-cost-heading">
          <h2 id="monitoring-cost-heading" class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
            Advanced analytics
          </h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <MetricsMetricCard
              title="Estimated cost (USD)"
              :value="`$${costs?.totalUsd ?? estimatedCostUsd}`"
              description="Approximation based on total tokens"
            />
            <MetricsMetricCard
              title="Top model share"
              :value="models[0] ? `${models[0].model}` : '—'"
              :description="models[0] ? `${models[0].tokens} tokens` : 'No model usage yet'"
            />
          </div>
          <div class="mt-4 grid gap-6 xl:grid-cols-3">
            <UiHudPanel title="Cost by agent" subtitle="Highest spenders in current snapshot">
              <p class="text-muted mb-2 text-xs font-medium uppercase">
                Agent spend
              </p>
              <ul v-if="costs?.byAgent.length" class="space-y-1 text-sm">
                <li v-for="row in costs.byAgent.slice(0, 6)" :key="row.agentId" class="flex justify-between gap-2">
                  <span class="text-highlighted truncate">{{ row.agentName }}</span>
                  <span class="text-muted font-metric">${{ row.estimatedUsd.toFixed(4) }}</span>
                </li>
              </ul>
              <CommonEmptyState v-else title="No cost data yet." variant="inline" icon="i-lucide-wallet" />
            </UiHudPanel>
            <UiHudPanel title="Cost trend" subtitle="Projected cost across tactical windows">
              <p class="text-muted mb-2 text-xs font-medium uppercase">
                Cost trend
              </p>
              <ul v-if="costs?.trend.length" class="space-y-1 text-sm">
                <li v-for="point in costs.trend" :key="point.rangeLabel" class="flex justify-between gap-2">
                  <span class="text-highlighted">{{ point.rangeLabel }}</span>
                  <span class="text-muted font-metric">${{ point.estimatedUsd.toFixed(4) }}</span>
                </li>
              </ul>
              <CommonEmptyState v-else title="No trend data." variant="inline" icon="i-lucide-chart-line" />
            </UiHudPanel>
            <UiHudPanel title="Usage anomalies" subtitle="Spike detector from current fleet state" :tone="costs?.anomalies.length ? 'critical' : 'default'">
              <p class="text-muted mb-2 text-xs font-medium uppercase">
                Usage anomalies
              </p>
              <ul v-if="costs?.anomalies.length" class="space-y-1 text-sm">
                <li v-for="anomaly in costs.anomalies" :key="anomaly.label" class="flex justify-between gap-2">
                  <span class="text-highlighted">{{ anomaly.label }}</span>
                  <span class="text-muted font-metric">{{ anomaly.value }}</span>
                </li>
              </ul>
              <CommonEmptyState v-else title="No spikes detected." variant="inline" icon="i-lucide-shield-check" />
            </UiHudPanel>
          </div>
        </section>

        <section aria-labelledby="monitoring-fleet-heading">
          <h2 id="monitoring-fleet-heading" class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
            Fleet &amp; usage
          </h2>
          <div class="grid gap-6 xl:grid-cols-12">
          <UCard class="panel-shell rounded-xl xl:col-span-7" :ui="{ body: 'p-4 sm:p-5' }">
            <template #header>
              <div>
                <h3 class="text-highlighted text-base font-semibold">
                  Agents
                </h3>
                <p class="text-muted mt-0.5 text-xs leading-snug">
                  Live fleet from the OpenClaw bridge.
                </p>
              </div>
            </template>
            <UAlert
              v-if="error"
              color="error"
              variant="soft"
              title="Agents"
              :description="error"
              class="mb-4"
            />
            <div class="grid gap-3 sm:grid-cols-2">
              <AgentsAgentSummaryCard v-for="a in agents" :key="a.id" :agent="a" dense />
              <CommonEmptyState
                v-if="!agents.length && !isLoading"
                title="No agents yet."
                description="Connect a worker or check the bridge to see agents here."
                icon="i-lucide-bot"
                variant="compact"
                class="sm:col-span-2"
              />
              <CommonEmptyState
                v-else-if="isLoading && !agents.length"
                loading
                title="Loading agents…"
                variant="compact"
                class="sm:col-span-2"
              />
            </div>
          </UCard>

          <UCard class="panel-shell rounded-xl xl:col-span-5" :ui="{ body: 'p-4 sm:p-5' }">
            <template #header>
              <div>
                <h3 class="text-highlighted text-base font-semibold">
                  Token usage
                </h3>
                <p class="text-muted mt-0.5 text-xs leading-snug">
                  Per-agent totals reported by the gateway.
                </p>
              </div>
            </template>
            <MetricsTokenUsageChart :series="tokenSeries" :max="tokenMax" />
          </UCard>
          </div>
        </section>

        <section aria-labelledby="monitoring-ops-heading">
          <h2 id="monitoring-ops-heading" class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
            Alerts &amp; breakdown
          </h2>
          <div class="grid gap-6 xl:grid-cols-2">
          <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
            <template #header>
              <div>
                <h3 class="text-highlighted text-base font-semibold">
                  Alerts
                </h3>
                <p class="text-muted mt-0.5 text-xs leading-snug">
                  Unacknowledged items; acknowledge here or from Alerts elsewhere.
                </p>
              </div>
            </template>
            <AlertsAlertList
              :alerts="alerts.slice(0, 8)"
              :loading="alertsPending"
              :acknowledge-pending-id="ackPendingId"
              @acknowledge="acknowledge($event)"
            />
          </UCard>

          <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
            <template #header>
              <div>
                <h3 class="text-highlighted text-base font-semibold">
                  Models &amp; sessions
                </h3>
                <p class="text-muted mt-0.5 text-xs leading-snug">
                  Token usage by model, agent status mix, and alert severity.
                </p>
              </div>
            </template>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-muted mb-2 text-xs font-medium uppercase">
                  By model
                </p>
                <ul v-if="models.length" class="text-muted space-y-1 text-sm">
                  <li v-for="m in models" :key="m.model">
                    {{ m.model }}: {{ m.tokens }}
                  </li>
                </ul>
                <CommonEmptyState
                  v-else
                  title="No model usage yet."
                  icon="i-lucide-cpu"
                  variant="inline"
                />
              </div>
              <div>
                <p class="text-muted mb-2 text-xs font-medium uppercase">
                  Agent status
                </p>
                <ul v-if="sessions.length" class="text-muted space-y-1 text-sm">
                  <li v-for="s in sessions" :key="s.status">
                    {{ s.status }}: {{ s.count }}
                  </li>
                </ul>
                <CommonEmptyState
                  v-else
                  title="No sessions yet."
                  icon="i-lucide-activity"
                  variant="inline"
                />
              </div>
            </div>
            <div class="mt-4">
              <p class="text-muted mb-2 text-xs font-medium uppercase">
                Unacked alert severity
              </p>
              <ul v-if="errors.length" class="text-muted flex flex-wrap gap-3 text-sm">
                <li v-for="e in errors" :key="e.severity">
                  {{ e.severity }}: {{ e.count }}
                </li>
              </ul>
              <CommonEmptyState
                v-else
                title="No unacked alerts."
                icon="i-lucide-shield-check"
                variant="inline"
              />
            </div>
          </UCard>
          </div>
        </section>

        <section aria-labelledby="monitoring-logs-heading">
          <h2 id="monitoring-logs-heading" class="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
            Activity trail
          </h2>
          <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-highlighted text-base font-semibold">
                  Recent logs
                </h3>
                <p class="text-muted mt-0.5 max-w-md text-xs leading-snug">
                  Last 12 rows from the feed; open Logs for filters and search.
                </p>
              </div>
              <UButton
                to="/logs"
                label="Abrir registros"
                color="neutral"
                variant="ghost"
                size="xs"
                trailing-icon="i-lucide-arrow-up-right"
                class="shrink-0"
              />
            </div>
          </template>
          <LogsLogViewer compact layout="timeline" :logs="recentLogs" :pending="logsPending" />
        </UCard>
        </section>
    </div>
  </DashboardPageShell>
</template>
