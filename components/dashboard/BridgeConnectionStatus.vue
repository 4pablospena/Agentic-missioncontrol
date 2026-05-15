<script setup lang="ts">
import type { DashboardPageAccentColor } from '~/models/dashboard-shell'

const props = withDefaults(
  defineProps<{
    accentColor?: DashboardPageAccentColor
  }>(),
  { accentColor: 'cyan' },
)

const { bridge, bridgeLabel, refresh } = useSystemStatus()

const statusTone = computed(() => {
  const label = bridgeLabel.value
  if (label.color === 'success')
    return 'ok' as const
  if (label.color === 'error')
    return 'error' as const
  return 'neutral' as const
})

const modeLabel = computed(() => {
  const mode = bridge.value?.bridgeMode ?? bridgeLabel.value.text
  if (mode === 'mock')
    return 'Mock'
  if (mode === 'gateway' || bridgeLabel.value.text === 'gateway')
    return 'Gateway'
  return 'OpenClaw'
})

const headline = computed(() => {
  if (bridge.value == null)
    return 'Comprobando bridge…'
  if (bridge.value.bridgeMode === 'mock')
    return 'Bridge en modo simulado'
  if (bridge.value.gatewayReachable === true)
    return 'Gateway conectado'
  return 'Gateway no disponible'
})

const description = computed(() => {
  const h = bridge.value
  if (h == null)
    return 'Consultando salud del bridge OpenClaw.'
  if (h.bridgeMode === 'mock') {
    return 'Los datos son simulados. Define OPENCLAW_BRIDGE_MODE=gateway en .env para usar el gateway real.'
  }
  if (h.gatewayReachable === true)
    return h.message ?? 'El gateway responde correctamente.'
  return h.message ?? 'Revisa OPENCLAW_GATEWAY_URL, token y conectividad (p. ej. Tailscale).'
})

const badgeColor = computed(() => {
  if (statusTone.value === 'ok')
    return 'green' as const
  if (statusTone.value === 'error')
    return 'red' as const
  return 'neutral' as const
})
</script>

<template>
  <RetroCard
    :color="props.accentColor"
    static
    class="bridge-status px-4 py-3"
    data-testid="bridge-connection-status"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <div
          class="bridge-status__icon shrink-0"
          :class="`bridge-status__icon--${statusTone}`"
        >
          <UIcon
            :name="statusTone === 'ok' ? 'i-lucide-plug-zap' : statusTone === 'error' ? 'i-lucide-unplug' : 'i-lucide-loader-2'"
            :class="{ 'animate-spin': bridge == null }"
            class="size-4"
          />
        </div>
        <div class="min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="rs-display text-sm font-semibold text-[var(--rs-text)]">
              {{ headline }}
            </p>
            <RetroBadge :color="badgeColor" size="sm">
              {{ modeLabel }}
            </RetroBadge>
            <span
              v-if="bridge?.gatewayStatus != null"
              class="rs-mono text-xs text-[var(--rs-text-dim)]"
            >
              HTTP {{ bridge.gatewayStatus }}
            </span>
          </div>
          <p class="rs-body text-sm text-[var(--rs-text-muted)]">
            {{ description }}
          </p>
        </div>
      </div>
      <RetroButton
        color="cyan"
        variant="ghost"
        size="sm"
        icon="i-lucide-rotate-ccw"
        type="button"
        @click="refresh"
      >
        <span class="hidden sm:inline">Comprobar</span>
      </RetroButton>
    </div>
  </RetroCard>
</template>

<style scoped>
.bridge-status__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--rs-radius);
  border: 1px solid var(--rs-border);
}

.bridge-status__icon--ok {
  color: var(--rs-green-hi);
  border-color: color-mix(in srgb, var(--rs-green) 45%, transparent);
  background: color-mix(in srgb, var(--rs-green) 10%, transparent);
}

.bridge-status__icon--error {
  color: var(--rs-red);
  border-color: color-mix(in srgb, var(--rs-red) 45%, transparent);
  background: color-mix(in srgb, var(--rs-red) 10%, transparent);
}

.bridge-status__icon--neutral {
  color: var(--rs-text-muted);
}
</style>
