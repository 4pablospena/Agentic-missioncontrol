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
            @click="loadLogs"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h1 class="text-highlighted font-semibold">
              Logs
            </h1>
            <div class="flex items-center gap-2">
              <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle">
                Realtime {{ connected ? 'connected' : 'disconnected' }}
              </UBadge>
              <span class="text-muted text-xs">
                New rows broadcast as
                <UKbd size="sm">
                  log.created
                </UKbd>
              </span>
            </div>
          </div>
        </template>

        <p class="text-muted text-sm">
          Data from authenticated
          <UKbd size="sm">
            GET /api/logs
          </UKbd>
          · create via
          <UKbd size="sm">
            POST /api/logs
          </UKbd>
          .
        </p>

        <UAlert
          v-if="errorMsg"
          color="error"
          variant="soft"
          title="Could not load logs"
          :description="errorMsg"
          class="mt-4"
        />

        <div class="mt-4 overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr class="border-default text-muted border-b">
                <th class="pb-2 pe-4 font-medium">
                  Time
                </th>
                <th class="pb-2 pe-4 font-medium">
                  Level
                </th>
                <th class="pb-2 pe-4 font-medium">
                  Agent
                </th>
                <th class="pb-2 font-medium">
                  Message
                </th>
              </tr>
            </thead>
            <tbody class="divide-default divide-y">
              <tr v-for="row in logs" :key="row.id">
                <td class="text-dimmed py-2 pe-4 whitespace-nowrap">
                  {{ formatIso(row.createdAt) }}
                </td>
                <td class="py-2 pe-4">
                  <UBadge
                    :color="levelColor(row.level)"
                    variant="subtle"
                  >
                    {{ row.level }}
                  </UBadge>
                </td>
                <td class="text-muted py-2 pe-4 font-mono text-xs">
                  {{ row.agentId ?? '—' }}
                </td>
                <td class="text-highlighted py-2 wrap-break-word">
                  {{ row.message }}
                </td>
              </tr>
              <tr v-if="!logs.length && !pending">
                <td colspan="4" class="text-muted py-6 text-center">
                  No log entries yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { LogEntry } from '~/models/log'
import { createApiClient } from '~/services/api-client.service'
import { createLogService } from '~/services/log.service'
import { formatIso } from '~/utils/formatDate'

definePageMeta({ layout: 'dashboard' })

const config = useRuntimeConfig()
const api = createApiClient(useRequestFetch(), String(config.public.apiBase ?? ''))
const logService = createLogService(api)

const logs = ref<LogEntry[]>([])
const pending = ref(false)
const samplePending = ref(false)
const errorMsg = ref('')

const { events, connected } = useRealtimeEvents()

async function loadLogs() {
  pending.value = true
  errorMsg.value = ''
  try {
    logs.value = await logService.list()
  }
  catch (e: unknown) {
    const err = e as { statusMessage?: string, message?: string }
    errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
  }
  finally {
    pending.value = false
  }
}

async function addSampleLog() {
  samplePending.value = true
  errorMsg.value = ''
  try {
    await logService.create({
      level: 'info',
      message: `Sample log (${new Date().toISOString()})`,
      metadata: { source: 'mission-control-ui' },
    })
    await loadLogs()
  }
  catch (e: unknown) {
    const err = e as { statusMessage?: string, message?: string }
    errorMsg.value = err?.statusMessage ?? err?.message ?? 'Unknown error'
  }
  finally {
    samplePending.value = false
  }
}

function levelColor(level: LogEntry['level']): 'neutral' | 'info' | 'warning' | 'error' {
  if (level === 'error')
    return 'error'
  if (level === 'warn')
    return 'warning'
  if (level === 'debug')
    return 'neutral'
  return 'info'
}

watch(
  events,
  (list) => {
    const last = list[list.length - 1]
    if (last?.type === 'log.created')
      void loadLogs()
  },
  { deep: true },
)

onMounted(() => {
  void loadLogs()
})
</script>
