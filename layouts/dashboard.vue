<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Agents',
  icon: 'i-lucide-bot',
  to: '/agents',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Logs',
  icon: 'i-lucide-scroll-text',
  to: '/logs',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Tasks',
  icon: 'i-lucide-square-kanban',
  to: '/tasks',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Memory',
  icon: 'i-lucide-database',
  to: '/memory',
  onSelect: () => {
    open.value = false
  },
}, {
  label: 'Chat',
  icon: 'i-lucide-message-square',
  to: '/chat',
  onSelect: () => {
    open.value = false
  },
}], [{
  label: 'OpenClaw docs',
  icon: 'i-lucide-book-open',
  to: 'https://docs.openclaw.ai/',
  target: '_blank',
}, {
  label: 'Nuxt UI templates',
  icon: 'i-lucide-panels-top-left',
  to: 'https://ui.nuxt.com/templates',
  target: '_blank',
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat(),
}])
</script>

<template>
  <UDashboardGroup unit="rem" class="dashboard-canvas relative min-h-dvh">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/35"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <DashboardWorkspaceSwitcher :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <DashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
