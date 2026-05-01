<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 lg:gap-6">
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h1 class="text-highlighted font-semibold">
                Overview
              </h1>
              <UButton
                icon="i-lucide-refresh-cw"
                label="Refresh agents"
                color="neutral"
                variant="outline"
                size="sm"
                :loading="isLoading"
                @click="refresh"
              />
            </div>
          </template>

          <div class="flex flex-wrap items-center gap-2">
            <p class="text-muted text-sm">
              Plan de trabajo en
              <UKbd size="sm">
                .cursor/adr-fase-1-decisiones-tecnicas.md
              </UKbd>
              y
              <UKbd size="sm">
                .cursor/fase-1-infraestructura-base.md
              </UKbd>
              .
            </p>
            <UBadge :color="realtimeConnected ? 'success' : 'neutral'" variant="subtle" size="sm">
              Realtime {{ realtimeConnected ? 'live' : 'offline' }}
            </UBadge>
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            title="Error"
            :description="error"
            class="mt-4"
          />

          <pre
            v-if="health"
            class="bg-muted mt-4 overflow-auto rounded-lg p-4 text-xs ring ring-default"
          >{{ JSON.stringify(health, null, 2) }}</pre>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-highlighted font-semibold">
              Agents
            </h2>
          </template>

          <ul class="divide-default divide-y">
            <li
              v-for="a in agents"
              :key="a.id"
              class="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
            >
              <span class="text-highlighted text-sm font-medium">{{ a.name }}</span>
              <UBadge
                :color="a.status === 'error' ? 'error' : a.status === 'running' ? 'primary' : 'neutral'"
                variant="subtle"
              >
                {{ a.status }}
              </UBadge>
            </li>
            <li v-if="!agents.length && !isLoading" class="text-muted py-3 text-sm">
              No agents loaded yet.
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { agents, health, error, isLoading, refresh } = useOpenClawAgents()
const { connected: realtimeConnected } = useRealtimeEvents()

onMounted(() => {
  void refresh()
})
</script>
