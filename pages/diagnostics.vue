<script setup lang="ts">
import type { TimelineEvent } from '~/models/timeline'

definePageMeta({ layout: 'dashboard', middleware: 'diagnostics-flag' })

const { refresh: refreshSystem } = useSystemStatus()
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
  <DashboardPageShell
    title="Diagnostics"
    subtitle="Estado del bridge, salud del gateway y línea temporal por sesión"
    icon="i-lucide-wrench"
    accent-color="orange"
  >
    <template #actions>
      <RetroButton
        color="orange"
        variant="outline"
        size="sm"
        icon="i-lucide-rotate-ccw"
        :loading="timelinePending"
        type="button"
        @click="refreshAll"
      >
        <span class="hidden sm:inline">Actualizar</span>
      </RetroButton>
    </template>

    <div class="flex flex-col gap-6">
        <section class="page-toolbar pb-2">
          <p class="text-muted text-sm leading-snug">
            Depuración técnica: estado crudo del bridge OpenClaw, salud del gateway y eventos por sesión.
          </p>
        </section>

        <DashboardBridgeConnectionStatus accent-color="orange" />

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Salud del bridge (servicio de agentes)
              </h2>
              <UButton
                :label="jsonOpen ? 'Ocultar JSON' : 'Ver JSON'"
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
                title="Sin datos del bridge"
                description="Pulsa Actualizar para obtener la respuesta del gateway."
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
            Oculto por defecto. Expande para inspeccionar la respuesta del gateway.
          </p>
        </UCard>

        <UCard class="panel-shell rounded-xl" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h2 class="text-highlighted font-semibold">
                Línea temporal de sesión
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
            <UFormField label="ID de sesión" class="min-w-[200px] flex-1">
              <UInput v-model="sessionIdInput" data-testid="diagnostics-session-input" />
            </UFormField>
            <UButton
              label="Recargar línea temporal"
              color="neutral"
              variant="outline"
              size="sm"
              :loading="timelinePending"
              @click="refreshTimeline"
            />
            <UButton
              :label="timelineOpen ? 'Ocultar eventos' : 'Ver eventos'"
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
            Línea temporal oculta por defecto. Expande para ver los {{ timelineList.length }} evento(s) cargados.
          </p>
        </UCard>
    </div>
  </DashboardPageShell>
</template>
