<template>
  <UDashboardPanel id="tasks">
    <template #header>
      <UDashboardNavbar title="Tasks" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Tasks
          </h1>
        </template>
        <p class="text-muted text-sm">
          Fase 3 (
          <UKbd size="sm">
            .cursor/fase-3-control-de-tareas.md
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
