<template>
  <UDashboardPanel id="memory">
    <template #header>
      <UDashboardNavbar title="Memory" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Memory
          </h1>
        </template>
        <p class="text-muted text-sm">
          Fase 4 (
          <UKbd size="sm">
            .cursor/fase-4-memoria-y-chat.md
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
