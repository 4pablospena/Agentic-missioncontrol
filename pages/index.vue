<script setup lang="ts">
import type { NamedSeriesPoint } from '~/models/metric'

definePageMeta({ layout: 'dashboard' })

const { events, connected } = useRealtimeEvents()
const { agents, health, error, isLoading, refresh } = useAgents({ events })
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

const sessionIdInput = ref('demo-session')
const {
  events: timelineEvents,
  pending: timelinePending,
  refresh: refreshTimeline,
} = useSessionTimeline(sessionIdInput)

const tokenSeries = computed<NamedSeriesPoint[]>(() => {
  const t = tokens.value
  if (!t)
    return []
  return t.byAgent.map(a => ({ label: a.agentName, value: a.tokens }))
})

const tokenMax = computed(() =>
  Math.max(1, ...tokenSeries.value.map(s => s.value)),
)

function dashboardRefresh() {
  void refresh()
  void refreshLogs()
  void refreshAlerts()
  void refreshMetrics()
  void refreshTimeline()
}

onMounted(() => {
  dashboardRefresh()
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle" size="sm">
            Realtime {{ connected ? 'live' : 'offline' }}
          </UBadge>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="isLoading || metricsPending || alertsPending"
            @click="dashboardRefresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Agents"
            :value="agents.length"
            description="From OpenClaw bridge"
          />
          <MetricCard
            title="Total tokens"
            :value="tokens?.total ?? '—'"
            description="Sum across listed agents"
          />
          <MetricCard
            title="Open alerts"
            :value="alerts.filter(a => !a.acknowledged).length"
            description="Unacknowledged"
          />
          <MetricCard
            title="Recent logs"
            :value="recentLogs.length"
            description="Last 12 rows"
          />
        </section>

        <div class="grid gap-6 xl:grid-cols-2">
          <UCard>
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
              <AgentSummaryCard v-for="a in agents" :key="a.id" :agent="a" />
              <p v-if="!agents.length && !isLoading" class="text-muted text-sm sm:col-span-2">
                No agents loaded.
              </p>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Token usage
              </h2>
            </template>
            <TokenUsageChart :series="tokenSeries" :max="tokenMax" />
          </UCard>
        </div>

        <div class="grid gap-6 xl:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-highlighted font-semibold">
                  Alerts
                </h2>
              </div>
            </template>
            <AlertList
              :alerts="alerts.slice(0, 8)"
              :loading="alertsPending"
              :acknowledge-pending-id="ackPendingId"
              @acknowledge="acknowledge($event)"
            />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-highlighted font-semibold">
                Models & sessions
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

        <UCard>
          <template #header>
            <h2 class="text-highlighted font-semibold">
              Recent logs
            </h2>
          </template>
          <LogsLogViewer :logs="recentLogs" :pending="logsPending" />
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-highlighted font-semibold">
              Session timeline
            </h2>
          </template>
          <p class="text-muted mb-3 text-sm">
            Uses log metadata
            <UKbd size="xs">
              sessionId
            </UKbd>
            · try
            <UKbd size="xs">
              demo-session
            </UKbd>
            after adding a sample log from the Logs page.
          </p>
          <div class="mb-4 flex flex-wrap items-end gap-2">
            <UFormField label="Session id" class="min-w-[200px] flex-1">
              <UInput v-model="sessionIdInput" />
            </UFormField>
            <UButton
              label="Reload timeline"
              color="neutral"
              variant="outline"
              size="sm"
              :loading="timelinePending"
              @click="refreshTimeline"
            />
          </div>
          <EventTimeline :events="timelineEvents" />
        </UCard>

        <UCard v-if="health">
          <template #header>
            <h2 class="text-highlighted font-semibold">
              Bridge health
            </h2>
          </template>
          <pre class="bg-muted overflow-auto rounded-lg p-4 text-xs ring ring-default">{{ JSON.stringify(health, null, 2) }}</pre>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
