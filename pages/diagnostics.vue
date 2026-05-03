<script setup lang="ts">
import type { TimelineEvent } from '~/models/timeline'

definePageMeta({ layout: 'dashboard', middleware: 'diagnostics-flag' })

const { bridge, bridgeLabel, refresh: refreshSystem } = useSystemStatus()
const { health: agentsHealth, refresh: refreshAgents } = useAgents()

const sessionIdInput = ref('demo-session')
const {
  events: timelineEvents,
  pending: timelinePending,
  refresh: refreshTimeline,
} = useSessionTimeline(sessionIdInput)

const jsonOpen = ref(false)
const timelineOpen = ref(false)

const timelineList = computed<TimelineEvent[]>(() => [...timelineEvents.value])

function refreshAll() {
  void refreshSystem()
  void refreshAgents()
  void refreshTimeline()
}

onMounted(() => {
  refreshAll()
})
</script>

<template>
  <UDashboardPanel id="diagnostics">
    <template #header>
      <UDashboardNavbar title="Diagnostics" :ui="{ right: 'gap-2' }">
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
            :loading="timelinePending"
            @click="refreshAll"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            Raw bridge state, gateway health and per-session timeline. For technical debugging.
          </p>
        </section>

        <section
          class="panel-shell font-metric flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-[11px] sm:text-xs"
          data-testid="diagnostics-bridge-strip"
        >
          <span class="text-dimmed font-medium tracking-wide uppercase">Bridge</span>
          <UBadge :color="bridgeLabel.color" variant="subtle" size="sm">
            {{ bridgeLabel.text }}
          </UBadge>
          <span v-if="bridge?.gatewayStatus != null" class="text-muted tabular-nums">
            HTTP {{ bridge.gatewayStatus }}
          </span>
          <span v-if="bridge?.message" class="text-muted max-w-xl truncate">{{ bridge.message }}</span>
        </section>

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Bridge health (agents service)
              </h2>
              <UButton
                :label="jsonOpen ? 'Hide JSON' : 'Show JSON'"
                color="neutral"
                variant="ghost"
                size="xs"
                :icon="jsonOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
                @click="jsonOpen = !jsonOpen"
              />
            </div>
          </template>
          <UCollapsible v-model:open="jsonOpen">
            <template #content>
              <CommonEmptyState
                v-if="!agentsHealth"
                title="No bridge data yet."
                description="Hit Refresh to fetch the gateway response."
                icon="i-lucide-database"
                variant="compact"
              />
              <pre
                v-else
                class="bg-muted font-metric ring-default overflow-auto rounded-lg p-4 text-[11px] ring sm:text-xs"
              >{{ JSON.stringify(agentsHealth, null, 2) }}</pre>
            </template>
          </UCollapsible>
          <p v-if="!jsonOpen" class="text-muted text-sm">
            Hidden by default. Toggle to inspect the gateway response.
          </p>
        </UCard>

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Session timeline
              </h2>
              <UTooltip text="Uses log metadata.sessionId — try `demo-session` after adding a sample log from /logs.">
                <UButton
                  icon="i-lucide-info"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  aria-label="How session timeline works"
                />
              </UTooltip>
            </div>
          </template>

          <div class="mb-4 flex flex-wrap items-end gap-2">
            <UFormField label="Session id" class="min-w-[200px] flex-1">
              <UInput v-model="sessionIdInput" data-testid="diagnostics-session-input" />
            </UFormField>
            <UButton
              label="Reload timeline"
              color="neutral"
              variant="outline"
              size="sm"
              :loading="timelinePending"
              @click="refreshTimeline"
            />
            <UButton
              :label="timelineOpen ? 'Hide events' : 'Show events'"
              color="neutral"
              variant="ghost"
              size="sm"
              :icon="timelineOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              @click="timelineOpen = !timelineOpen"
            />
          </div>

          <UCollapsible v-model:open="timelineOpen">
            <template #content>
              <TimelineEventTimeline :events="timelineList" />
            </template>
          </UCollapsible>
          <p v-if="!timelineOpen" class="text-muted text-sm">
            Timeline hidden by default. Toggle to render the {{ timelineList.length }} loaded event(s).
          </p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
