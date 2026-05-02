<script setup lang="ts">
/**
 * Status bar + minimal quick dock. Visual reference: TenacitOS (MIT)
 * https://github.com/carlosazaustre/tenacitOS — adapted for Nuxt/UI.
 *
 * Acts as the SINGLE source for global system status (websocket + bridge).
 * Quick-nav is reduced to 3 high-traffic routes; deeper navigation lives in
 * the sidebar and the command palette.
 */
const { realtimeConnected, bridgeLabel } = useSystemStatus()

const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  function tick() {
    clock.value = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())
  }
  tick()
  clockTimer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (clockTimer != null)
    clearInterval(clockTimer)
})

const quickLinks = [
  { to: '/', icon: 'i-lucide-layout-dashboard', label: 'Overview' },
  { to: '/tasks', icon: 'i-lucide-square-kanban', label: 'Tasks' },
  { to: '/logs', icon: 'i-lucide-scroll-text', label: 'Logs' },
] as const
</script>

<template>
  <div
    class="dock-shell border-default bg-elevated/85 supports-backdrop-filter:bg-elevated/70 fixed right-0 bottom-0 left-0 z-40 flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 backdrop-blur-md md:gap-4 md:px-4"
  >
    <div
      class="text-muted font-metric hidden min-w-0 flex-1 items-center gap-3 text-[11px] sm:flex md:text-xs"
      data-testid="dock-system"
    >
      <span class="text-highlighted shrink-0 tabular-nums">{{ clock }}</span>
      <span class="flex items-center gap-1.5">
        <span class="hidden lg:inline">WS</span>
        <UBadge :color="realtimeConnected ? 'success' : 'neutral'" variant="subtle" size="xs">
          {{ realtimeConnected ? 'live' : 'off' }}
        </UBadge>
      </span>
      <span class="flex items-center gap-1.5">
        <span class="hidden xl:inline">Bridge</span>
        <UBadge :color="bridgeLabel.color" variant="subtle" size="xs">
          {{ bridgeLabel.text }}
        </UBadge>
      </span>
    </div>

    <nav
      class="flex max-w-full flex-1 flex-wrap items-center justify-center gap-1 sm:justify-end md:flex-initial"
      aria-label="Quick navigation"
    >
      <UTooltip v-for="item in quickLinks" :key="item.to" :text="item.label">
        <UButton
          :to="item.to"
          :icon="item.icon"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          class="text-muted hover:text-highlighted"
        />
      </UTooltip>
      <UTooltip text="Open menu (Cmd+K)">
        <UDashboardSearchButton
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :collapsed="true"
          class="text-muted hover:text-highlighted bg-transparent ring-0"
        />
      </UTooltip>
    </nav>
  </div>
</template>
