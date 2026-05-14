<script setup lang="ts">
const mobileNav = useDashboardShellMobileNav()

const isOpen = computed(() => mobileNav?.isOpen.value ?? false)

function onClick() {
  if (!mobileNav)
    return
  if (isOpen.value)
    mobileNav.close()
  else
    mobileNav.open()
}
</script>

<template>
  <button
    v-if="mobileNav"
    type="button"
    class="rs-icon-btn lg:hidden shrink-0"
    :aria-expanded="isOpen"
    aria-controls="dashboard-mobile-nav"
    :aria-label="isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'"
    @click="onClick"
  >
    <UIcon
      :name="isOpen ? 'i-lucide-x' : 'i-lucide-menu'"
      class="size-5"
    />
  </button>
</template>

<style scoped>
.rs-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: var(--rs-radius);
  color: var(--rs-text-muted);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms, box-shadow 150ms;
  flex-shrink: 0;
}

.rs-icon-btn:hover {
  border-color: color-mix(in srgb, var(--rs-indigo) 50%, var(--rs-border));
  color: var(--rs-text);
  background: var(--rs-surface-2);
}

.rs-icon-btn:focus-visible {
  outline: 2px solid var(--rs-indigo);
  outline-offset: 2px;
}
</style>
