<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, error, isLoading, refresh } = useAgents({ events })

onMounted(() => {
  void refresh()
})
</script>

<template>
  <UDashboardPanel id="agents">
    <template #header>
      <UDashboardNavbar title="Agents" :ui="{ right: 'gap-3' }">
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
            :loading="isLoading"
            @click="refresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-8">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          title="Agents"
          :description="error"
          class="rounded-xl"
        />

        <section class="page-toolbar pb-6">
          <h1 class="text-highlighted text-lg font-semibold tracking-tight">
            Agents
          </h1>
          <p class="text-muted mt-1 max-w-2xl text-sm leading-snug">
            Fleet overview and bridge-backed monitor. Tiles show model and token usage where the gateway exposes them.
          </p>
        </section>

        <section>
          <p class="text-muted mb-3 font-metric text-xs font-medium uppercase tracking-wide">
            Fleet tiles
          </p>
          <div class="panel-shell rounded-xl p-4 sm:p-5">
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AgentsAgentSummaryCard
                v-for="a in agents"
                :key="a.id"
                :agent="a"
                dense
              />
              <p v-if="!agents.length && !isLoading" class="text-muted col-span-full py-4 text-center text-sm">
                No agents loaded.
              </p>
              <p v-if="isLoading && !agents.length" class="text-muted col-span-full py-4 text-center text-sm">
                Loading…
              </p>
            </div>
          </div>
        </section>

        <UCard class="panel-shell shadow-none ring-0" :ui="{ body: 'p-4 sm:p-5' }">
          <template #header>
            <h2 class="text-highlighted text-base font-semibold">
              Agent monitor
            </h2>
          </template>
          <AgentMonitorTable
            :agents="agents"
            :loading="isLoading"
            :error="error"
            :show-error-alert="false"
          />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
