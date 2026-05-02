<script setup lang="ts">
import type { LogFilters } from '~/models/log-filters'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()

const { events, connected } = useRealtimeEvents()
const {
  logs,
  filters,
  pending,
  errorMsg,
  refresh,
  resetFilters,
  create,
} = useLogs({ events })
const { agents, refresh: refreshAgents } = useAgents({ events })

function queryFromRoute(): LogFilters {
  const q = route.query
  const levelRaw = typeof q.level === 'string' ? q.level : undefined
  const level
    = levelRaw === 'debug'
    || levelRaw === 'info'
    || levelRaw === 'warn'
    || levelRaw === 'error'
      ? levelRaw
      : undefined
  return {
    agentId: typeof q.agentId === 'string' ? q.agentId : undefined,
    level,
    query: typeof q.query === 'string' ? q.query : undefined,
    from: typeof q.from === 'string' ? q.from : undefined,
    to: typeof q.to === 'string' ? q.to : undefined,
  }
}

function filtersToQuery(f: LogFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (f.agentId)
    out.agentId = f.agentId
  if (f.level)
    out.level = f.level
  if (f.query)
    out.query = f.query
  if (f.from)
    out.from = f.from
  if (f.to)
    out.to = f.to
  return out
}

const agentOptions = computed(() =>
  agents.value.map(a => ({ label: a.name, value: a.id })),
)

const samplePending = ref(false)

onMounted(async () => {
  await refreshAgents()
  const qf = queryFromRoute()
  if (Object.keys(qf).length)
    filters.value = { ...filters.value, ...qf }
  await refresh()
})

function onApply() {
  void router.replace({ query: filtersToQuery(filters.value) })
  void refresh()
}

function onReset() {
  resetFilters()
  void router.replace({ query: {} })
}

async function addSampleLog() {
  samplePending.value = true
  try {
    await create({
      level: 'info',
      message: `Sample log (${new Date().toISOString()})`,
      metadata: {
        source: 'mission-control-ui',
        sessionId: 'demo-session',
      },
    })
  }
  catch {
    /* errorMsg from useLogs */
  }
  finally {
    samplePending.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="logs">
    <template #header>
      <UDashboardNavbar title="Logs" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Sample log"
            color="neutral"
            variant="outline"
            size="sm"
            :loading="samplePending"
            @click="addSampleLog"
          />
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            size="sm"
            :loading="pending"
            @click="refresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard class="shadow-none ring-0 panel-shell" :ui="{ body: 'p-4 sm:p-5' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 class="text-highlighted font-semibold tracking-tight">
                Logs
              </h1>
              <p class="text-muted mt-1 max-w-2xl text-sm leading-snug">
                Structured feed filtered by bridge metadata. Matches the observability pane of the shell below.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Realtime {{ connected ? 'connected' : 'disconnected' }}
              </UBadge>
              <span class="text-muted text-xs">
                Filters sync to URL on Apply ·
                <UKbd size="sm">
                  log.created
                </UKbd>
              </span>
            </div>
          </div>
        </template>

        <LogsLogFilters
          v-model="filters"
          :agent-options="agentOptions"
          class="mb-6"
          @apply="onApply"
          @reset="onReset"
        />

        <UAlert
          v-if="errorMsg"
          color="error"
          variant="soft"
          title="Could not load logs"
          :description="errorMsg"
          class="mb-4"
        />

        <LogsLogViewer :logs="logs" :pending="pending" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
