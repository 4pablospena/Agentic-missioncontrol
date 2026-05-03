<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)
const { public: publicConfig } = useRuntimeConfig()
const showDiagnostics = publicConfig.showDiagnostics !== false
const workspaceEnabled = publicConfig.workspaceEnabled === true

function closeMobileNav() {
  open.value = false
}

const diagnosticsGroup: NavigationMenuItem = {
  label: 'Diagnostics',
  icon: 'i-lucide-wrench',
  type: 'trigger' as const,
  children: [{
    label: 'Bridge & sessions',
    icon: 'i-lucide-stethoscope',
    to: '/diagnostics',
    onSelect: closeMobileNav,
  }],
}

/** Sidebar grouping: Control / Observability / Operations / Context / Diagnostics. */
const primaryGroups: NavigationMenuItem[] = [{
  label: 'Control',
  icon: 'i-lucide-layout-grid',
  type: 'trigger' as const,
  defaultOpen: true,
  children: [{
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: '/',
    onSelect: closeMobileNav,
  }, {
    label: 'Agents',
    icon: 'i-lucide-bot',
    to: '/agents',
    onSelect: closeMobileNav,
  }],
}, {
  label: 'Observability',
  icon: 'i-lucide-activity',
  type: 'trigger' as const,
  defaultOpen: true,
  children: [{
    label: 'Monitoring',
    icon: 'i-lucide-gauge',
    to: '/monitoring',
    onSelect: closeMobileNav,
  }, {
    label: 'Logs',
    icon: 'i-lucide-scroll-text',
    to: '/logs',
    onSelect: closeMobileNav,
  }],
}, {
  label: 'Operations',
  icon: 'i-lucide-orbit',
  type: 'trigger' as const,
  children: [{
    label: 'Tasks',
    icon: 'i-lucide-square-kanban',
    to: '/tasks',
    onSelect: closeMobileNav,
  }, {
    label: 'Scheduler',
    icon: 'i-lucide-clock',
    to: '/scheduler',
    onSelect: closeMobileNav,
  }],
}, {
  label: 'Context',
  icon: 'i-lucide-layers',
  type: 'trigger' as const,
  children: [
    {
      label: 'Memory',
      icon: 'i-lucide-database',
      to: '/memory',
      onSelect: closeMobileNav,
    },
    {
      label: 'Chat',
      icon: 'i-lucide-message-square',
      to: '/chat',
      onSelect: closeMobileNav,
    },
    ...(workspaceEnabled
      ? [{
          label: 'Workspace',
          icon: 'i-lucide-folder-tree',
          to: '/workspace',
          onSelect: closeMobileNav,
        }]
      : []),
  ],
}, ...(showDiagnostics ? [diagnosticsGroup] : [])]

/** Docs / templates: command palette only — keeps the sidebar operator-focused. */
const externalResourcesItems: CommandPaletteItem[] = [{
  label: 'OpenClaw docs',
  icon: 'i-lucide-book-open',
  description: 'Gateway and worker documentation',
  to: 'https://docs.openclaw.ai/',
  target: '_blank',
}, {
  label: 'Nuxt UI templates',
  icon: 'i-lucide-panels-top-left',
  description: 'Dashboard UI reference',
  to: 'https://ui.nuxt.com/templates',
  target: '_blank',
}]

const links = primaryGroups satisfies NavigationMenuItem[]

function flattenPrimaryNav(items: NavigationMenuItem[]): NavigationMenuItem[] {
  return items.flatMap((item) => {
    if (item.children?.length)
      return item.children as NavigationMenuItem[]
    return [item]
  })
}

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/': 'System overview at a glance',
  '/agents': 'Fleet tiles and bridge-backed agent monitor',
  '/monitoring': 'KPIs, agents, alerts, recent logs',
  '/logs': 'Browse, filter and ingest log streams',
  '/tasks': 'Kanban board and task execution controls',
  '/scheduler': 'Cron schedules for recurring tasks',
  '/memory': 'Semantic memory, snapshots, embeddings',
  '/chat': 'Agent conversations and threads',
  '/account': 'Profile, avatar and session details',
  ...(workspaceEnabled ? { '/workspace': 'Browse files and search content read-only' } : {}),
  ...(showDiagnostics ? { '/diagnostics': 'Raw bridge state and session timeline' } : {}),
}

const accountGroup: CommandPaletteGroup = {
  id: 'account',
  label: 'Account',
  items: [{
    label: 'Account',
    icon: 'i-lucide-user-round',
    description: ROUTE_DESCRIPTIONS['/account'],
    to: '/account',
    onSelect: closeMobileNav,
  }] satisfies CommandPaletteItem[],
}

const externalResourcesGroup: CommandPaletteGroup = {
  id: 'external-resources',
  label: 'External resources',
  items: externalResourcesItems,
}

const groups = computed((): CommandPaletteGroup[] => {
  const primary = flattenPrimaryNav(links).map((item) => {
    const desc = typeof item.to === 'string' ? ROUTE_DESCRIPTIONS[item.to] : undefined
    if (desc)
      return { ...item, description: desc }
    return item
  })
  return [{
    id: 'links',
    label: 'Go to',
    items: primary as CommandPaletteItem[],
  }, accountGroup, externalResourcesGroup]
})
</script>

<template>
  <UDashboardGroup unit="rem" class="dashboard-canvas min-h-0">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="min-h-0 bg-elevated/35 dock-sidebar-border"
      :ui="{
        body: '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      }"
    >
      <template #header="{ collapsed }">
        <div
          class="flex min-w-0 gap-1.5"
          :class="collapsed ? 'w-full flex-col items-center' : 'w-full flex-row items-center'"
        >
          <DashboardWorkspaceSwitcher :collapsed="collapsed" />
          <ClientOnly>
            <DashboardNotificationBell :collapsed="collapsed" placement="header" />
          </ClientOnly>
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex min-h-0 flex-1 flex-col gap-2">
          <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default shrink-0" />

          <UNavigationMenu
            :collapsed="collapsed"
            :items="links"
            orientation="vertical"
            tooltip
            popover
            class="min-h-0 flex-1 overflow-y-auto"
          />

          <!-- Profile + Sign out (session exit lives here only). Docs: command palette → External resources -->
          <div
            class="border-default mt-auto flex w-full min-w-0 shrink-0 flex-col gap-2 border-t pt-3 pb-2"
            :class="collapsed ? 'items-center' : 'px-1'"
          >
            <DashboardUserMenu :collapsed="collapsed" class="min-h-0 w-full min-w-0 shrink-0" />
          </div>
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <!-- min-h-0 + flex-1: lets UDashboardPanel body own vertical scroll inside the fixed shell -->
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <slot />
    </div>
  </UDashboardGroup>
</template>
