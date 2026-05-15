<script setup lang="ts">
import type { CreateTaskPayload } from '~/models/task'

const route = useRoute()

const mobileOpen = ref(false)
watch(() => route.path, () => {
  mobileOpen.value = false
})

const guidedModalOpen = useState('guidedModalOpen', () => false)
const guidedModalRestrictAgentId = useState<string | null>('guidedModalRestrictAgentId', () => null)
const { realtimeConnected } = useSystemStatus()
const { events } = useRealtimeEvents()

const { agents, refresh: refreshAgents } = useAgents({ events })
const { createTask } = useTasks()

onMounted(() => void refreshAgents())

watch(guidedModalOpen, (open) => {
  if (!open)
    guidedModalRestrictAgentId.value = null
})

async function onTaskCreate(payload: CreateTaskPayload) {
  await createTask(payload)
  guidedModalOpen.value = false
}

function onClearGuidedRestrict() {
  guidedModalRestrictAgentId.value = null
}

const { sections: navSections } = useDashboardNav()

const showAgentRoster = computed(() => route.path.startsWith('/agents'))

provideDashboardShellMobileNav({
  open: () => { mobileOpen.value = true },
  close: () => { mobileOpen.value = false },
  isOpen: readonly(mobileOpen),
})

const mobileSidebarRef = ref<{ focusClose: () => void } | null>(null)
let previousFocus: HTMLElement | null = null

watch(mobileOpen, async (open) => {
  if (!import.meta.client)
    return
  if (open) {
    previousFocus = document.activeElement as HTMLElement | null
    await nextTick()
    mobileSidebarRef.value?.focusClose()
  }
  else {
    previousFocus?.focus?.()
    previousFocus = null
  }
})

let removeEsc: (() => void) | null = null
watch(mobileOpen, (open) => {
  if (!import.meta.client)
    return
  removeEsc?.()
  removeEsc = null
  if (!open)
    return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      mobileOpen.value = false
    }
  }
  window.addEventListener('keydown', onKey)
  removeEsc = () => window.removeEventListener('keydown', onKey)
}, { flush: 'post' })

onUnmounted(() => {
  removeEsc?.()
})
</script>

<template>
  <div class="dark rs-canvas flex h-screen overflow-hidden">
    <a
      href="#main-content"
      class="skip-link"
    >
      Saltar al contenido
    </a>

    <DashboardAppSidebar
      mode="desktop"
      :nav-sections="navSections"
      :show-agent-roster="showAgentRoster"
      :agents="agents"
      :realtime-connected="realtimeConnected"
    />

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="mobileOpen = false"
      />
    </Transition>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-x-full"
      leave-active-class="transition duration-150"
      leave-to-class="-translate-x-full"
    >
      <DashboardAppSidebar
        v-if="mobileOpen"
        ref="mobileSidebarRef"
        mode="mobile"
        :nav-sections="navSections"
        :show-agent-roster="showAgentRoster"
        :agents="agents"
        :realtime-connected="realtimeConnected"
        @close="mobileOpen = false"
      />
    </Transition>

    <main
      id="main-content"
      class="flex-1 flex flex-col min-w-0 overflow-hidden"
      tabindex="-1"
      :inert="mobileOpen"
    >
      <div class="lg:hidden rs-mobile-bar">
        <DashboardMobileNavToggle />
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-zap" class="size-4 rs-glow-indigo" />
          <p class="rs-display" style="font-size: var(--rs-text-md); font-weight: 600;">
            Openclaw
          </p>
        </div>
        <div class="w-9" />
      </div>

      <slot />
    </main>

    <TasksGuidedTaskModal
      v-model:open="guidedModalOpen"
      :agents="agents"
      :restrict-to-agent-id="guidedModalRestrictAgentId"
      @submit="onTaskCreate"
      @clear-restrict="onClearGuidedRestrict"
    />
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  border-radius: var(--rs-radius);
  color: var(--rs-text);
  font-size: var(--rs-text-sm);
  font-weight: 600;
}

.skip-link:focus {
  left: 0.75rem;
  top: 0.75rem;
  outline: 2px solid var(--rs-indigo);
  outline-offset: 2px;
}

.rs-mobile-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--rs-border);
  background: var(--rs-bg-2);
  flex-shrink: 0;
}
</style>
