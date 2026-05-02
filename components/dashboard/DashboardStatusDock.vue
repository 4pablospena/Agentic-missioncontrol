<script setup lang="ts">
/**
 * Status bar + quick dock. Visual reference: TenacitOS (MIT)
 * https://github.com/carlosazaustre/tenacitOS — adapted for Nuxt/UI.
 */
import type { OpenClawHealth } from '~/models/openclaw'

const { connected } = useRealtimeEvents()

const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined
let healthPoller: ReturnType<typeof setInterval> | undefined

const { data: bridge, refresh } = useFetch<OpenClawHealth>('/api/openclaw/health', {
  server: false,
  default: () => null,
})

/** null = loading; gateway mock always "ok" for UI strip */
const bridgeStrip = computed(() => {
  const h = bridge.value
  if (h === null || h === undefined)
    return { color: 'neutral' as const, text: '…' }
  if (h.bridgeMode === 'mock')
    return { color: 'neutral' as const, text: 'mock' }
  if (h.gatewayReachable === true)
    return { color: 'success' as const, text: 'gateway' }
  return { color: 'error' as const, text: 'gateway' }
})

onMounted(() => {
  function tick() {
    clock.value = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())
  }
  tick()
  clockTimer = setInterval(tick, 1000)
  healthPoller = setInterval(() => {
    void refresh()
  }, 45_000)
})

onUnmounted(() => {
  if (clockTimer != null)
    clearInterval(clockTimer)
  if (healthPoller != null)
    clearInterval(healthPoller)
})

const dockLinks = [
  { to: '/', icon: 'i-lucide-layout-dashboard', label: 'Dashboard' },
  { to: '/agents', icon: 'i-lucide-bot', label: 'Agents' },
  { to: '/logs', icon: 'i-lucide-scroll-text', label: 'Logs' },
  { to: '/tasks', icon: 'i-lucide-square-kanban', label: 'Tasks' },
  { to: '/scheduler', icon: 'i-lucide-clock', label: 'Cron' },
  { to: '/memory', icon: 'i-lucide-database', label: 'Memory' },
  { to: '/chat', icon: 'i-lucide-message-square', label: 'Chat' },
] as const
</script>

<template>
  <div
    class="dock-shell border-default bg-elevated/85 supports-[backdrop-filter]:bg-elevated/70 fixed right-0 bottom-0 left-0 z-40 flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 backdrop-blur-md md:gap-4 md:px-4"
  >
    <div class="text-muted hidden min-w-0 flex-1 items-center gap-3 font-metric text-[11px] sm:flex md:text-xs">
      <span class="text-highlighted shrink-0 tabular-nums">{{ clock }}</span>
      <span class="flex items-center gap-1.5">
        <span class="hidden lg:inline">WS</span>
        <UBadge :color="connected ? 'success' : 'neutral'" variant="subtle" size="xs">
          {{ connected ? 'live' : 'off' }}
        </UBadge>
      </span>
      <span class="flex items-center gap-1.5">
        <span class="hidden xl:inline">OpenClaw</span>
        <UBadge
          :color="bridgeStrip.color"
          variant="subtle"
          size="xs"
        >
          {{ bridgeStrip.text }}
        </UBadge>
      </span>
    </div>

    <nav
      class="flex max-w-full flex-1 flex-wrap items-center justify-center gap-1 sm:justify-end md:flex-initial"
      aria-label="Quick navigation"
    >
      <UTooltip v-for="item in dockLinks" :key="item.to" :text="item.label">
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
    </nav>
  </div>
</template>
