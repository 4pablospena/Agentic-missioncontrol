<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

function closeMobileNav() {
  open.value = false
}

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/',
  onSelect: closeMobileNav,
}, {
  label: 'Agents',
  icon: 'i-lucide-bot',
  to: '/agents',
  onSelect: closeMobileNav,
}, {
  label: 'Logs',
  icon: 'i-lucide-scroll-text',
  to: '/logs',
  onSelect: closeMobileNav,
}, {
  label: 'Tasks',
  icon: 'i-lucide-square-kanban',
  to: '/tasks',
  onSelect: closeMobileNav,
}, {
  label: 'Scheduler',
  icon: 'i-lucide-clock',
  to: '/scheduler',
  onSelect: closeMobileNav,
}, {
  label: 'Context',
  icon: 'i-lucide-layers',
  type: 'trigger' as const,
  defaultOpen: true,
  children: [{
    label: 'Memory',
    icon: 'i-lucide-database',
    to: '/memory',
    onSelect: closeMobileNav,
  }, {
    label: 'Chat',
    icon: 'i-lucide-message-square',
    to: '/chat',
    onSelect: closeMobileNav,
  }],
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

function flattenPrimaryNav(items: NavigationMenuItem[]): NavigationMenuItem[] {
  return items.flatMap((item) => {
    if (item.children?.length)
      return item.children as NavigationMenuItem[]
    return [item]
  })
}

const groups = computed(() => {
  const primary = flattenPrimaryNav(links[0]).map((item) => {
    if (item.to === '/memory') {
      return {
        ...item,
        description: 'Semantic search, embeddings, cosine similarity, vector memory, snapshots',
      }
    }
    if (item.to === '/chat') {
      return {
        ...item,
        description: 'Agent conversations, threads, messaging, realtime chat',
      }
    }
    return item
  })
  return [{
    id: 'links',
    label: 'Go to',
    items: [...primary, ...links[1]],
  }]
})
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
