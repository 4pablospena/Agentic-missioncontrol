<script setup lang="ts">
/**
 * One-shot welcome banner for the Overview page. Persisted in localStorage so it
 * never reappears once dismissed. Renders nothing on SSR; the parent wraps this
 * in `<ClientOnly>` to avoid hydration mismatches around `localStorage`.
 */
withDefaults(defineProps<{
  showDiagnostics?: boolean
}>(), {
  showDiagnostics: true,
})

const STORAGE_KEY = 'mc.overview.onboarding.dismissed'

/** Default to dismissed so SSR / first paint never flashes the banner. */
const dismissed = ref(true)

onMounted(() => {
  try {
    dismissed.value = localStorage.getItem(STORAGE_KEY) === '1'
  }
  catch {
    dismissed.value = false
  }
})

function dismiss() {
  dismissed.value = true
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  }
  catch {
    /** Private browsing or storage disabled — keep the in-memory dismiss. */
  }
}
</script>

<template>
  <UAlert
    v-if="!dismissed"
    color="neutral"
    variant="subtle"
    icon="i-lucide-sparkles"
    title="Welcome to Mission Control"
    description="This Overview shows the system at a glance. Open Monitoring for engineer telemetry, or jump into Diagnostics for raw bridge state."
    :ui="{ root: 'panel-shell rounded-xl' }"
    :close="{ 'aria-label': 'Dismiss welcome banner' }"
    @update:open="(open: boolean) => { if (!open) dismiss() }"
  >
    <template #actions>
      <UButton
        to="/monitoring"
        label="Explore Monitoring"
        color="neutral"
        variant="outline"
        size="xs"
        icon="i-lucide-activity"
      />
      <UButton
        v-if="showDiagnostics"
        to="/diagnostics"
        label="Open Diagnostics"
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-wrench"
      />
    </template>
  </UAlert>
</template>
