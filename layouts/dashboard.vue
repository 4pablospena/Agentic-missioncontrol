<script setup lang="ts">
import type { CreateTaskPayload } from '~/models/task'

const route = useRoute()

const mobileOpen = ref(false)
watch(() => route.path, () => { mobileOpen.value = false })

const guidedModalOpen = useState('guidedModalOpen', () => false)
const { realtimeConnected } = useSystemStatus()

const { agents, refresh: refreshAgents } = useAgents()
const { createTask } = useTasks()

onMounted(() => void refreshAgents())

async function onTaskCreate(payload: CreateTaskPayload) {
  await createTask(payload)
  guidedModalOpen.value = false
}

interface NavItem {
  label: string
  to: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Inicio',   icon: 'i-lucide-home',          to: '/' },
  { label: 'Agentes',  icon: 'i-lucide-users',         to: '/agents' },
  { label: 'Misiones', icon: 'i-lucide-list-checks',   to: '/tasks' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}
</script>

<template>
  <div class="dark rs-canvas flex h-screen overflow-hidden">

    <!-- ── Desktop sidebar ────────────────────────────────────────────── -->
    <aside class="rs-sidebar hidden lg:flex">
      <!-- Brand -->
      <div class="rs-sidebar__brand">
        <div class="rs-logo-mark">
          <UIcon name="i-lucide-zap" class="size-[18px]" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="rs-display rs-sidebar__brand-name">Openclaw</p>
          <p class="rs-sidebar__brand-sub">Mission Control</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="rs-sidebar__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rs-nav-item"
          :class="{ 'rs-nav-item--active': isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Footer -->
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

    <!-- ── Mobile drawer ──────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        @click="mobileOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-x-full"
      leave-active-class="transition duration-150"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="mobileOpen"
        class="rs-sidebar lg:hidden fixed inset-y-0 left-0 z-50"
      >
        <div class="rs-sidebar__brand">
          <div class="rs-logo-mark">
            <UIcon name="i-lucide-zap" class="size-[18px]" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="rs-display rs-sidebar__brand-name">Openclaw</p>
            <p class="rs-sidebar__brand-sub">Mission Control</p>
          </div>
          <button class="rs-icon-btn" @click="mobileOpen = false">
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <nav class="rs-sidebar__nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rs-nav-item"
            :class="{ 'rs-nav-item--active': isActive(item.to) }"
          >
            <UIcon :name="item.icon" class="size-4 shrink-0" />
            <span>{{ item.label }}</span>
          </NuxtLink>
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
    </Transition>

    <!-- ── Main ─────────────────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Mobile top bar -->
      <div class="lg:hidden rs-mobile-bar">
        <button class="rs-icon-btn" @click="mobileOpen = true">
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="size-4 rs-glow-indigo" />
          <p class="rs-display" style="font-size: var(--rs-text-md); font-weight: 600;">Openclaw</p>
        </div>
        <div class="w-9" />
      </div>

      <slot />
    </main>

    <!-- Global modal -->
    <TasksGuidedTaskModal
      v-model:open="guidedModalOpen"
      :agents="agents"
      @submit="onTaskCreate"
    />
  </div>
</template>

<style scoped>
/* ─── Sidebar ────────────────────────────────────────────────────────── */
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

/* ─── Logo mark — modern gradient ─── */
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

/* ─── Nav items ──────────────────────────────────────────────────────── */
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

/* ─── Mobile top bar ─────────────────────────────────────────────────── */
.rs-mobile-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--rs-border);
  background: var(--rs-bg-2);
  flex-shrink: 0;
}

/* ─── Icon buttons ───────────────────────────────────────────────────── */
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
