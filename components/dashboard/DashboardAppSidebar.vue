<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'
import type { DashboardNavSection } from '~/config/dashboard-nav'

const props = defineProps<{
  mode: 'desktop' | 'mobile'
  navSections: DashboardNavSection[]
  showAgentRoster: boolean
  agents: readonly AgentSummary[]
  realtimeConnected: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const route = useRoute()

function isNavActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const closeBtnRef = ref<HTMLButtonElement | null>(null)

const asideClass = computed(() =>
  props.mode === 'desktop'
    ? 'rs-sidebar hidden lg:flex'
    : 'rs-sidebar lg:hidden fixed inset-y-0 left-0 z-50',
)

function focusClose() {
  closeBtnRef.value?.focus()
}

defineExpose({ focusClose })
</script>

<template>
  <aside
    :id="mode === 'mobile' ? 'dashboard-mobile-nav' : undefined"
    :class="asideClass"
    :role="mode === 'mobile' ? 'dialog' : undefined"
    :aria-modal="mode === 'mobile' ? true : undefined"
    aria-label="Navegación principal"
  >
    <div class="rs-sidebar__brand">
      <div class="rs-logo-mark">
        <UIcon name="i-lucide-zap" class="size-[18px]" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="rs-display rs-sidebar__brand-name">Openclaw</p>
        <p class="rs-sidebar__brand-sub">Mission Control</p>
      </div>
      <button
        v-if="mode === 'mobile'"
        ref="closeBtnRef"
        type="button"
        class="rs-icon-btn"
        aria-label="Cerrar menú"
        @click="emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>

    <nav class="rs-sidebar__nav" aria-label="Navegación">
      <template v-for="section in navSections" :key="section.id">
        <p class="rs-sidebar__section-label">
          {{ section.label }}
        </p>
        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="rs-nav-item"
          :class="{ 'rs-nav-item--active': isNavActive(item.to) }"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </template>
      <DashboardAgentRoster v-if="showAgentRoster" :agents="agents" />
    </nav>

    <div class="rs-sidebar__footer">
      <DashboardNotificationBell :collapsed="false" placement="sidebar" />
      <div class="rs-sidebar__status">
        <span
          class="rs-dot"
          :class="realtimeConnected ? 'rs-dot--idle' : 'rs-dot--offline'"
        />
        <span
          class="rs-sidebar__status-label"
          :style="{ color: realtimeConnected ? 'var(--rs-green-hi)' : 'var(--rs-text-dim)' }"
        >
          {{ realtimeConnected ? 'Conectado' : 'Sin señal' }}
        </span>
      </div>
      <DashboardUserMenu :collapsed="false" class="w-full" />
    </div>
  </aside>
</template>

<style scoped>
.rs-sidebar {
  flex-direction: column;
  flex-shrink: 0;
  width: var(--rs-sidebar-w);
  background: color-mix(in srgb, var(--rs-bg-2) 80%, var(--rs-surface));
  border-right: 1px solid var(--rs-border);
  z-index: 30;
}

.rs-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1.1rem;
  border-bottom: 1px solid var(--rs-border);
}

.rs-sidebar__brand-name {
  font-size: var(--rs-text-base);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--rs-text);
}

.rs-sidebar__brand-sub {
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-2xs);
  font-weight: 500;
  color: var(--rs-text-dim);
  margin-top: 0.2rem;
  letter-spacing: 0.02em;
}

.rs-sidebar__nav {
  flex: 1;
  padding: 0.85rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow-y: auto;
}

.rs-sidebar__section-label {
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-2xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--rs-text-dim);
  padding: 0.65rem 0.7rem 0.25rem;
  margin-top: 0.35rem;
}

.rs-sidebar__section-label:first-child {
  margin-top: 0;
  padding-top: 0;
}

.rs-sidebar__footer {
  border-top: 1px solid var(--rs-border);
  padding: 0.85rem 1rem;
}

.rs-sidebar__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.rs-sidebar__status-label {
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-xs);
  font-weight: 500;
}

.rs-logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--rs-indigo) 0%, var(--rs-purple) 60%, var(--rs-pink) 100%);
  color: white;
  border-radius: var(--rs-radius);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(99, 102, 241, 0.35);
}

.rs-nav-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-md);
  font-weight: 500;
  color: var(--rs-text-muted);
  text-decoration: none;
  border-radius: var(--rs-radius);
  transition: all 150ms ease;
  position: relative;
}

.rs-nav-item:hover {
  color: var(--rs-text);
  background: var(--rs-surface);
}

.rs-nav-item--active {
  color: var(--rs-text) !important;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--rs-indigo) 22%, transparent),
    color-mix(in srgb, var(--rs-indigo) 8%, transparent) 70%,
    transparent
  );
  box-shadow: inset 2px 0 0 0 var(--rs-indigo);
}

.rs-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: var(--rs-radius);
  color: var(--rs-text-muted);
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}

.rs-icon-btn:hover {
  border-color: color-mix(in srgb, var(--rs-indigo) 50%, var(--rs-border));
  color: var(--rs-text);
  background: var(--rs-surface-2);
}
</style>
