<template>
  <UDashboardPanel id="chat">
    <template #header>
      <UDashboardNavbar title="Chat" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-highlighted font-semibold">
            Chat
          </h1>
        </template>
        <p class="text-muted text-sm">
          Fase 4. WebSocket stub Nitro:
          <UKbd size="sm">
            /realtime
          </UKbd>
          .
        </p>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>
