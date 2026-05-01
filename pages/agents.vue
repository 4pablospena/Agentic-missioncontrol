<template>
  <UDashboardPanel id="agents">
    <template #header>
      <UDashboardNavbar title="Agents" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Agents
          </h1>
        </template>
        <p class="text-muted text-sm">
          Placeholder Fase 1. Lista desde el puente OpenClaw (
          <UKbd size="sm">
            OPENCLAW_BRIDGE_MODE
          </UKbd>
          ).
        </p>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
