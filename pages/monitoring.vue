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
  pending: metricsPending,
  refresh: refreshMetrics,
} = useMetrics({ events })

const tokenSeries = computed<NamedSeriesPoint[]>(() => {
  const t = tokens.value
  if (!t)
    return []
  return t.byAgent.map(a => ({ label: a.agentName, value: a.tokens }))
})

const tokenMax = computed(() =>
  Math.max(1, ...tokenSeries.value.map(s => s.value)),
)

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
  <UDashboardPanel id="monitoring">
    <template #header>
      <UDashboardNavbar title="Monitoring" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="isLoading || metricsPending || alertsPending"
            @click="refreshAll"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            Telemetry for engineers: agents, tokens, alerts and recent logs.
          </p>
        </section>

        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricsMetricCard
            title="Agents"
            :value="agents.length"
            description="From OpenClaw bridge"
          />
          <MetricsMetricCard
            title="Total tokens"
            :value="tokens?.total ?? '—'"
            description="Sum across listed agents"
          />
          <MetricsMetricCard
            title="Open alerts"
            :value="alerts.filter(a => !a.acknowledged).length"
            description="Unacknowledged"
          />
          <MetricsMetricCard
            title="Recent logs"
            :value="recentLogs.length"
            description="Last 12 rows"
          />
        </section>

        <div class="grid gap-6 xl:grid-cols-12">
          <UCard class="panel-shell xl:col-span-7" :ui="{ root: 'shadow-none ring-0', body: 'p-4 sm:p-5' }">
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Agents
              </h2>
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
              <p v-if="!agents.length && !isLoading" class="text-muted text-sm sm:col-span-2">
                No agents loaded.
              </p>
            </div>
          </UCard>

          <UCard class="panel-shell xl:col-span-5" :ui="{ root: 'shadow-none ring-0', body: 'p-4 sm:p-5' }">
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Token usage
              </h2>
            </template>
            <MetricsTokenUsageChart :series="tokenSeries" :max="tokenMax" />
          </UCard>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0', body: 'p-4 sm:p-5' }">
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Alerts
              </h2>
            </template>
            <AlertsAlertList
              :alerts="alerts.slice(0, 8)"
              :loading="alertsPending"
              :acknowledge-pending-id="ackPendingId"
              @acknowledge="acknowledge($event)"
            />
          </UCard>

          <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0', body: 'p-4 sm:p-5' }">
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Models &amp; sessions
              </h2>
            </template>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-muted mb-2 text-xs font-medium uppercase">
                  By model
                </p>
                <ul class="text-muted space-y-1 text-sm">
                  <li v-for="m in models" :key="m.model">
                    {{ m.model }}: {{ m.tokens }}
                  </li>
                  <li v-if="!models.length">
                    —
                  </li>
                </ul>
              </div>
              <div>
                <p class="text-muted mb-2 text-xs font-medium uppercase">
                  Agent status
                </p>
                <ul class="text-muted space-y-1 text-sm">
                  <li v-for="s in sessions" :key="s.status">
                    {{ s.status }}: {{ s.count }}
                  </li>
                  <li v-if="!sessions.length">
                    —
                  </li>
                </ul>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-muted mb-2 text-xs font-medium uppercase">
                Unacked alert severity
              </p>
              <ul class="text-muted flex flex-wrap gap-3 text-sm">
                <li v-for="e in errors" :key="e.severity">
                  {{ e.severity }}: {{ e.count }}
                </li>
                <li v-if="!errors.length">
                  —
                </li>
              </ul>
            </div>
          </UCard>
        </div>

        <UCard class="panel-shell" :ui="{ root: 'shadow-none ring-0', body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Recent logs
              </h2>
              <UButton
                to="/logs"
                label="Open logs"
                color="neutral"
                variant="ghost"
                size="xs"
                trailing-icon="i-lucide-arrow-up-right"
              />
            </div>
          </template>
          <LogsLogViewer compact layout="timeline" :logs="recentLogs" :pending="logsPending" />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
