<template>
  <UDashboardPanel id="logs">
    <template #header>
      <UDashboardNavbar title="Logs" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Logs
          </h1>
        </template>
        <p class="text-muted text-sm">
          Placeholder. Persistencia SQLite lista en servidor (
          <UKbd size="sm">
            GET /api/logs
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
