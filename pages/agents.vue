<script setup lang="ts">
import { getProfileForAgent, AGENT_PROFILES } from '~/config/agent-profiles'
import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'

definePageMeta({ layout: 'dashboard' })

const { events } = useRealtimeEvents()
const { agents, error, isLoading, refresh } = useAgents({ events })
const { createTask } = useTasks()
const guidedModalOpen = useState('guidedModalOpen', () => false)
const loadingAgentId = ref<string | null>(null)
const toast = useToast()

// Files drawer
const filesDrawerOpen = ref(false)
const filesDrawerAgent = ref<AgentSummary | null>(null)
const filesDrawerProfile = ref<AgentProfile | null>(null)

function openFilesDrawer(agent: AgentSummary, profile: AgentProfile) {
  filesDrawerAgent.value = agent
  filesDrawerProfile.value = profile
  filesDrawerOpen.value = true
}

const agentPanels = computed(() =>
  agents.value
    .map(agent => ({ agent, profile: getProfileForAgent(agent.name) }))
    .filter((p): p is { agent: AgentSummary, profile: AgentProfile } => !!p.profile),
)

const unknownAgents = computed(() =>
  agents.value.filter(a => !getProfileForAgent(a.name)),
)

const offlineProfiles = computed(() =>
  AGENT_PROFILES.filter(p =>
    !agents.value.some(a => a.name.toLowerCase().includes(p.nameMatch.toLowerCase())),
  ),
)

async function deploy(agentId: string, profile: AgentProfile) {
  if (loadingAgentId.value) return
  loadingAgentId.value = agentId
  try {
    await createTask({
      title: `${profile.displayName}: ${profile.quickActionLabel}`,
      assignedAgentId: agentId,
      priority: 'normal',
      input: { action: 'daily_auto', instruction: profile.quickActionInstruction },
    })
    toast.add({ title: `${profile.displayName} desplegada`, color: 'success' })
  }
  catch {
    toast.add({ title: 'Error al desplegar', color: 'error' })
  }
  finally {
    loadingAgentId.value = null
  }
}

onMounted(() => void refresh())
</script>

<template>
  <div class="rs-canvas rs-scanlines flex flex-col h-full overflow-auto">
    <RetroPageHeader
      title="Tu escuadrón"
      subtitle="Estado de todos los agentes del equipo"
      icon="i-lucide-users"
      accent-color="purple"
    >
      <template #actions>
        <RetroBadge color="green" size="sm" class="hidden sm:inline-flex">
          {{ agentPanels.length }} online
        </RetroBadge>
        <RetroButton
          color="cyan"
          variant="outline"
          size="sm"
          icon="i-lucide-rotate-ccw"
          :loading="isLoading"
          @click="refresh"
        >
          <span class="hidden sm:inline">Actualizar</span>
        </RetroButton>
      </template>
    </RetroPageHeader>

    <div class="rs-page">
      <RetroCard v-if="error" color="red" static class="px-4 py-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-triangle-alert" class="size-5 shrink-0 rs-glow-red" />
          <p class="rs-body rs-glow-red" style="font-size: 0.95rem;">{{ error }}</p>
        </div>
      </RetroCard>

      <!-- Loading -->
      <div v-if="isLoading && agents.length === 0" class="rs-grid">
        <div v-for="i in 6" :key="i" class="rs-skeleton h-72" />
      </div>

      <!-- Connected -->
      <section v-if="agentPanels.length > 0">
        <RetroSectionLabel
          label="Agentes conectados"
          color="green"
          :count="agentPanels.length"
        />
        <div class="rs-grid">
          <AgentsAgentCharacterCard
            v-for="panel in agentPanels"
            :key="panel.agent.id"
            :agent="panel.agent"
            :profile="panel.profile"
            :loading="loadingAgentId === panel.agent.id"
            @deploy="deploy"
            @configure="openFilesDrawer"
          />

          <RetroCard
            v-for="agent in unknownAgents"
            :key="agent.id"
            color="cyan"
            interactive
            class="p-4 flex flex-col gap-3"
            @click="guidedModalOpen = true"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-bot" class="size-5 shrink-0 rs-glow-cyan" />
              <p class="rs-display rs-glow-cyan truncate" style="font-size: 0.95rem;">
                {{ agent.name.toUpperCase() }}
              </p>
            </div>
            <p class="rs-body" style="font-size: 0.85rem; color: var(--rs-text-muted);">
              Sin perfil configurado en el sistema
            </p>
            <RetroButton color="cyan" variant="outline" size="sm" block icon="i-lucide-send">
              Orden manual
            </RetroButton>
          </RetroCard>
        </div>
      </section>

      <!-- Offline -->
      <section v-if="offlineProfiles.length > 0 && !isLoading">
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
            class="p-4 flex flex-col gap-2.5 opacity-50 hover:opacity-80 transition-opacity"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-9 items-center justify-center border shrink-0"
                :style="{
                  borderColor: `color-mix(in srgb, ${profile.neonColor} 30%, transparent)`,
                  background: 'rgba(0,0,0,0.25)',
                }"
              >
                <UIcon :name="profile.icon" class="size-4" :style="{ color: profile.neonColor, opacity: 0.7 }" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="rs-display" style="font-size: 0.85rem; line-height: 1.1;" :style="{ color: profile.neonColor, opacity: 0.8 }">
                  {{ profile.displayName }}
                </p>
                <p class="rs-body" style="font-size: 0.75rem; color: var(--rs-text-dim); margin-top: 0.2rem;">
                  {{ profile.department }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="rs-dot rs-dot--offline" />
              <span class="rs-label" style="color: var(--rs-text-dim);">OFFLINE</span>
            </div>
          </RetroCard>
        </div>
      </section>

      <RetroEmptyState
        v-if="!isLoading && agents.length === 0"
        title="Sin señal"
        description="Conecta Openclaw y activa Tailscale para ver tus agentes."
        icon="i-lucide-radio-tower"
        color="purple"
      />

      <!-- Files drawer (global per page) -->
      <AgentsAgentFilesDrawer
        v-model:open="filesDrawerOpen"
        :agent="filesDrawerAgent"
        :profile="filesDrawerProfile"
      />
    </div>
  </div>
</template>

<style scoped>
.rs-page {
  flex: 1;
  width: 100%;
  max-width: var(--rs-content-max);
  margin: 0 auto;
  padding: 1.5rem var(--rs-page-px) 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

@media (min-width: 640px) {
  .rs-page { padding-top: 2rem; }
}

.rs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.1rem;
}
@media (min-width: 640px) { .rs-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1280px) { .rs-grid { grid-template-columns: repeat(3, 1fr); } }

.rs-grid-sm {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}
@media (min-width: 640px) { .rs-grid-sm { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .rs-grid-sm { grid-template-columns: repeat(3, 1fr); } }
</style>
