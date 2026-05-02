<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, isLoading, refresh: refreshAgents } = useAgents({ events })
const {
  alerts,
  pending: alertsPending,
  refresh: refreshAlerts,
} = useAlerts({ events })
const {
  logs: recentLogs,
  pending: logsPending,
  refresh: refreshLogs,
} = useLogs({ events, listLimit: 5 })
const {
  grouped: tasksByStatus,
  pending: tasksPending,
  loadTasks,
} = useTasks({ events })

const openAlerts = computed(() => alerts.value.filter(a => !a.acknowledged))
const criticalAlerts = computed(() =>
  openAlerts.value.filter(a => a.severity === 'critical'),
)

const agentsTotals = computed(() => {
  const list = agents.value
  const ok = list.filter(a => a.status === 'idle' || a.status === 'running').length
  const degraded = list.filter(a => a.status === 'error' || a.status === 'offline').length
  return { ok, degraded, total: list.length }
})

const queuedTasks = computed(
  () => (tasksByStatus.value.queued?.length ?? 0) + (tasksByStatus.value.running?.length ?? 0),
)

const overallStatus = computed<{ color: 'success' | 'warning' | 'error', label: string }>(() => {
  if (criticalAlerts.value.length > 0)
    return { color: 'error', label: 'Critical alerts open' }
  if (agentsTotals.value.degraded > 0 || openAlerts.value.length > 0)
    return { color: 'warning', label: 'Attention needed' }
  return { color: 'success', label: 'All systems nominal' }
})

const activityOpen = ref(false)

const { public: publicConfig } = useRuntimeConfig()
const showDiagnostics = publicConfig.showDiagnostics !== false

function refreshAll() {
  void refreshAgents()
  void refreshAlerts()
  void refreshLogs()
  void loadTasks()
}

onMounted(() => {
  refreshAll()
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Mission Control" :ui="{ right: 'gap-2' }">
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
            :loading="isLoading || alertsPending || logsPending || tasksPending"
            @click="refreshAll"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            System overview at a glance.
          </p>
        </section>

        <section
          class="panel-shell flex flex-wrap items-center gap-3 rounded-xl px-4 py-3"
          data-testid="overall-status"
        >
          <UBadge :color="overallStatus.color" variant="subtle" size="sm">
            {{ overallStatus.label }}
          </UBadge>
          <span class="text-muted text-sm">
            {{ agentsTotals.ok }}/{{ agentsTotals.total }} agents healthy
          </span>
          <span v-if="openAlerts.length" class="text-muted text-sm">
            · {{ openAlerts.length }} open alerts
          </span>
          <span v-if="queuedTasks" class="text-muted text-sm">
            · {{ queuedTasks }} active tasks
          </span>
        </section>

        <section class="grid gap-4 sm:grid-cols-3">
          <MetricsMetricCard
            title="Open alerts"
            :value="openAlerts.length"
            :description="criticalAlerts.length ? `${criticalAlerts.length} critical` : 'Unacknowledged'"
          />
          <MetricsMetricCard
            title="Agents"
            :value="`${agentsTotals.ok}/${agentsTotals.total}`"
            :description="agentsTotals.degraded ? `${agentsTotals.degraded} degraded` : 'All healthy'"
          />
          <MetricsMetricCard
            title="Active tasks"
            :value="queuedTasks"
            description="Queued + running"
          />
        </section>

        <section
          v-if="criticalAlerts.length || queuedTasks"
          class="panel-shell flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
        >
          <div class="text-sm">
            <p v-if="criticalAlerts.length" class="text-highlighted font-medium">
              {{ criticalAlerts.length }} critical alert{{ criticalAlerts.length === 1 ? '' : 's' }} need acknowledgement.
            </p>
            <p v-else-if="queuedTasks" class="text-highlighted font-medium">
              {{ queuedTasks }} task{{ queuedTasks === 1 ? '' : 's' }} in flight.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="criticalAlerts.length"
              to="/logs"
              label="Ver alertas"
              color="error"
              variant="soft"
              size="sm"
              icon="i-lucide-bell"
              data-testid="cta-alerts"
            />
            <UButton
              v-if="queuedTasks"
              to="/tasks"
              label="Ver tareas"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-square-kanban"
              data-testid="cta-tasks"
            />
          </div>
        </section>

        <section class="panel-shell rounded-xl">
          <UCollapsible v-model:open="activityOpen" :ui="{ root: 'p-0' }">
            <UButton
              :label="activityOpen ? 'Hide recent activity' : 'Show recent activity'"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="activityOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="w-full justify-between rounded-xl px-4 py-3"
              :ui="{ trailingIcon: 'hidden' }"
            />
            <template #content>
              <div class="border-default border-t px-4 py-4">
                <LogsLogViewer compact layout="timeline" :logs="recentLogs" :pending="logsPending" />
                <div class="mt-3 flex justify-end">
                  <UButton
                    to="/logs"
                    label="Open logs"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    trailing-icon="i-lucide-arrow-up-right"
                  />
                </div>
              </div>
            </template>
          </UCollapsible>
        </section>

        <section class="text-muted flex flex-wrap items-center justify-end gap-3 text-xs">
          <span>Need more detail?</span>
          <UButton
            to="/monitoring"
            label="Monitoring"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-activity"
          />
          <UButton
            v-if="showDiagnostics"
            to="/diagnostics"
            label="Diagnostics"
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-wrench"
          />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
