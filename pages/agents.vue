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
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Agent monitor
          </h1>
        </template>
        <AgentMonitorTable :agents="agents" :loading="isLoading" :error="error" />
      </UCard>
    </template>
  </UDashboardPanel>
</template>
