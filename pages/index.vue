<script setup lang="ts">
import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'

definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, isLoading: agentsLoading, refresh: refreshAgents } = useAgents({ events })
const {
  grouped: tasksByStatus,
  pending: tasksPending,
  loadTasks,
  createTask,
} = useTasks({ events })

const guidedModalOpen = useState('guidedModalOpen', () => false)
const toast = useToast()
const { public: publicConfig } = useRuntimeConfig()
const showDiagnosticsOnboarding = computed(() => publicConfig.showDiagnostics !== false)

const {
  greeting,
  agentPanels,
  onlineCount,
  activeTasks,
  recentTasks,
  offlineProfiles,
  deploy,
  loadingAgentId,
  taskStatusColor,
  taskStatusLabel,
  formatTaskTime,
} = useOverviewDashboard(agents, tasksByStatus, createTask, loadTasks, toast)

const filesDrawerOpen = ref(false)
const filesDrawerAgent = ref<AgentSummary | null>(null)
const filesDrawerProfile = ref<AgentProfile | null>(null)

function openFilesDrawer(agent: AgentSummary, profile: AgentProfile) {
  filesDrawerAgent.value = agent
  filesDrawerProfile.value = profile
  filesDrawerOpen.value = true
}

onMounted(async () => {
  await Promise.all([refreshAgents(), loadTasks()])
})
</script>

<template>
  <DashboardPageShell
    :title="`${greeting}, comandante`"
    subtitle="Selecciona un agente para desplegar una misión"
    icon="i-lucide-radio-tower"
    accent-color="indigo"
  >
    <template #actions>
        <RetroBadge
          v-if="activeTasks > 0"
          color="yellow"
          size="sm"
          pulse
          class="hidden sm:inline-flex"
        >
          {{ activeTasks }} en misión
        </RetroBadge>
        <RetroBadge
          color="green"
          size="sm"
          class="hidden md:inline-flex"
        >
          {{ onlineCount }} online
        </RetroBadge>
    </template>

    <ClientOnly>
        <DashboardOverviewOnboarding :show-diagnostics="showDiagnosticsOnboarding" class="mb-6" />
      </ClientOnly>
      <!-- ── Agentes ─── -->
      <section>
        <div class="flex items-end justify-between mb-4 gap-3 flex-wrap">
          <RetroSectionLabel
            label="Agentes disponibles"
            color="indigo"
            :count="agentPanels.length"
            class="!mb-0"
          />
          <RetroButton
            color="indigo"
            variant="ghost"
            size="sm"
            icon="i-lucide-sliders-horizontal"
            @click="guidedModalOpen = true"
          >
            <span class="hidden sm:inline">Orden personalizada</span>
            <span class="sm:hidden">Personalizar</span>
          </RetroButton>
        </div>

        <div v-if="agentsLoading" class="rs-grid">
          <div v-for="i in 3" :key="i" class="rs-skeleton h-72" />
        </div>

        <RetroEmptyState
          v-else-if="agents.length === 0"
          title="Sin señal"
          description="Verifica que Openclaw esté activo y Tailscale conectado."
          icon="i-lucide-radio-tower"
          color="purple"
        />

        <div v-else class="rs-grid rs-stagger">
          <AgentsAgentCharacterCard
            v-for="panel in agentPanels"
            :key="panel.agent.id"
            :agent="panel.agent"
            :profile="panel.profile"
            :loading="loadingAgentId === panel.agent.id"
            @deploy="deploy"
            @configure="openFilesDrawer"
          />
        </div>
      </section>

      <!-- ── Offline ─── -->
      <section v-if="offlineProfiles.length > 0 && !agentsLoading">
        <RetroSectionLabel
          label="Agentes offline"
          color="neutral"
          :count="offlineProfiles.length"
        />
        <div class="rs-grid-sm">
          <RetroCard
            v-for="profile in offlineProfiles"
            :key="profile.nameMatch"
            color="neutral"
            static
            class="p-4 opacity-60 hover:opacity-90 transition-opacity"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center border rounded"
                :style="{
                  borderColor: `color-mix(in srgb, ${profile.neonColor} 30%, var(--rs-border))`,
                  background: `color-mix(in srgb, ${profile.neonColor} 6%, rgba(0,0,0,0.2))`,
                }"
              >
                <UIcon
                  :name="profile.icon"
                  class="size-4"
                  :style="{ color: profile.neonColor, opacity: 0.65 }"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="rs-display" style="font-size: var(--rs-text-md); font-weight: 600; color: var(--rs-text);">
                  {{ profile.displayName }}
                </p>
                <p class="rs-body" style="font-size: var(--rs-text-sm); color: var(--rs-text-dim); margin-top: 0.15rem;">
                  {{ profile.department }}
                </p>
              </div>
              <span class="rs-dot rs-dot--offline shrink-0" />
            </div>
          </RetroCard>
        </div>
      </section>

      <!-- Drawer -->
      <AgentsAgentFilesDrawer
        v-model:open="filesDrawerOpen"
        :agent="filesDrawerAgent"
        :profile="filesDrawerProfile"
      />

      <!-- ── Actividad reciente ─── -->
      <section v-if="recentTasks.length > 0 || tasksPending">
        <div class="flex items-end justify-between mb-4 gap-3">
          <RetroSectionLabel
            label="Actividad reciente"
            color="cyan"
            :count="recentTasks.length"
            class="!mb-0"
          />
          <RetroButton
            to="/tasks"
            color="indigo"
            variant="ghost"
            size="sm"
            trailing-icon="i-lucide-arrow-right"
          >
            Ver todas
          </RetroButton>
        </div>

        <div v-if="tasksPending" class="flex flex-col gap-2">
          <div v-for="i in 3" :key="i" class="rs-skeleton h-12" />
        </div>

        <RetroCard v-else color="indigo" static class="overflow-hidden p-0">
          <NuxtLink
            v-for="task in recentTasks"
            :key="task.id"
            to="/tasks"
            class="rs-task-row"
          >
            <RetroBadge
              :color="taskStatusColor(task.status)"
              size="sm"
              class="shrink-0 w-[88px] justify-center"
            >
              {{ taskStatusLabel(task.status) }}
            </RetroBadge>
            <span class="rs-body flex-1 min-w-0 truncate" style="color: var(--rs-text); font-size: var(--rs-text-md);">
              {{ task.title }}
            </span>
            <span class="rs-mono shrink-0" style="color: var(--rs-text-dim); font-size: var(--rs-text-xs);">
              {{ formatTaskTime(task.updatedAt) }}
            </span>
          </NuxtLink>
        </RetroCard>
      </section>
  </DashboardPageShell>
</template>

<style scoped>
.rs-task-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--rs-border-soft);
  transition: background 150ms;
  text-decoration: none;
}
.rs-task-row:last-child { border-bottom: none; }
.rs-task-row:hover {
  background: var(--rs-surface-2);
}
</style>
