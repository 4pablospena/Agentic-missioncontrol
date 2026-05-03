<script setup lang="ts">
/**
 * One-shot hint for where Sign out lives (sidebar profile menu).
 * Persisted in localStorage; parent wraps in ClientOnly for SSR parity.
 */
const STORAGE_KEY = 'mc.account.signout-hint.dismissed'

/** Default dismissed until mounted avoids SSR/client mismatch flash. */
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
    /** Private browsing — keep in-memory dismiss only. */
  }
}
</script>

<template>
  <UAlert
    v-if="!dismissed"
    color="neutral"
    variant="subtle"
    icon="i-lucide-info"
    title="Signing out"
    description="Use Sign out in the profile menu at the bottom of the sidebar."
    :ui="{ root: 'panel-shell rounded-xl' }"
    :close="{ 'aria-label': 'Dismiss sign-out hint' }"
    @update:open="(open: boolean) => { if (!open) dismiss() }"
  />
</template>
