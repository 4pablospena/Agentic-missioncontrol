<script setup lang="ts">
import { getProfileForAgent, AGENT_PROFILES } from '~/config/agent-profiles'
import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import { buildAgentRoster, OFFLINE_KEY_PREFIX } from '~/composables/useAgentRoster'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const { events } = useRealtimeEvents()
const { agents, error, isLoading, refresh } = useAgents({ events })
const { createTask } = useTasks()
const guidedModalOpen = useState('guidedModalOpen', () => false)
const guidedModalRestrictAgentId = useState<string | null>('guidedModalRestrictAgentId', () => null)
const loadingAgentId = ref<string | null>(null)
const toast = useToast()

const filesDrawerOpen = ref(false)
const filesDrawerAgent = ref<AgentSummary | null>(null)
const filesDrawerProfile = ref<AgentProfile | null>(null)

function openFilesDrawer(agent: AgentSummary, profile: AgentProfile) {
  filesDrawerAgent.value = agent
  filesDrawerProfile.value = profile
  filesDrawerOpen.value = true
}

function openGuidedForCurrentAgent() {
  if (resolved.value.type !== 'online' && resolved.value.type !== 'unknown')
    return
  guidedModalRestrictAgentId.value = resolved.value.agent.id
  guidedModalOpen.value = true
}

function openGuidedSquadWide() {
  guidedModalRestrictAgentId.value = null
  guidedModalOpen.value = true
}

const decodedKey = computed(() => {
  const raw = route.params.agentKey
  const s = Array.isArray(raw) ? raw[0] : raw
  if (typeof s !== 'string' || !s.trim())
    return ''
  try {
    return decodeURIComponent(s)
  }
  catch {
    return s
  }
})

const rosterMatch = computed(() => {
  const k = decodedKey.value
  if (!k)
    return null
  return buildAgentRoster(agents.value).find(i => i.agentKey === k) ?? null
})

const resolved = computed(() => {
  const k = decodedKey.value
  if (!k)
    return { type: 'invalid' as const }

  const fromRoster = rosterMatch.value
  if (fromRoster) {
    if (fromRoster.kind === 'online' && fromRoster.agent && fromRoster.profile)
      return { type: 'online' as const, agent: fromRoster.agent, profile: fromRoster.profile }
    if (fromRoster.kind === 'unknown' && fromRoster.agent)
      return { type: 'unknown' as const, agent: fromRoster.agent }
    if (fromRoster.kind === 'offline' && fromRoster.profile)
      return { type: 'offline' as const, profile: fromRoster.profile }
  }

  const agent = agents.value.find(a => a.id === k)
  if (agent) {
    const profile = getProfileForAgent(agent.name)
    if (profile)
      return { type: 'online' as const, agent, profile }
    return { type: 'unknown' as const, agent }
  }

  if (k.startsWith(OFFLINE_KEY_PREFIX)) {
    const nm = k.slice(OFFLINE_KEY_PREFIX.length)
    const profile = AGENT_PROFILES.find(p => p.nameMatch === nm)
    if (profile)
      return { type: 'offline' as const, profile }
  }

  return { type: 'invalid' as const }
})

const pageTitle = computed(() => {
  if (resolved.value.type === 'online')
    return resolved.value.profile.displayName
  if (resolved.value.type === 'unknown')
    return resolved.value.agent.name
  if (resolved.value.type === 'offline')
    return resolved.value.profile.displayName
  return 'Agente'
})

const headerSubtitle = computed(() => {
  const r = resolved.value
  if (r.type === 'online') {
    const labels: Record<string, string> = {
      idle: 'Disponible',
      running: 'En misión',
      error: 'Error',
      offline: 'Fuera de línea',
    }
    return `${r.profile.department} · ${labels[r.agent.status] ?? r.agent.status}`
  }
  if (r.type === 'unknown')
    return 'Sin perfil de puesto · enlaces y plantillas abajo'
  if (r.type === 'offline')
    return `${r.profile.department} · Puesto sin agente conectado`
  return 'Vista del agente'
})

async function deploy(agentId: string, profile: AgentProfile) {
  if (loadingAgentId.value)
    return
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

function formatSeen(iso: string) {
  if (!iso)
    return '—'
  try {
    return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  }
  catch {
    return iso
  }
}

onMounted(() => void refresh())
</script>

<template>
  <div class="rs-canvas flex flex-col h-full overflow-auto">
    <RetroPageHeader
      :title="pageTitle"
      :subtitle="headerSubtitle"
      icon="i-lucide-user-cog"
      accent-color="purple"
    >
      <template #actions>
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

      <div v-if="isLoading && agents.length === 0" class="flex justify-center py-12">
        <div class="rs-skeleton h-80 w-full max-w-2xl rounded-lg" />
      </div>

      <template v-else-if="resolved.type === 'online'">
        <div class="rs-agent-shell">
          <div class="rs-agent-shell__grid">
            <div class="rs-agent-shell__main">
              <AgentsAgentCharacterCard
                :agent="resolved.agent"
                :profile="resolved.profile"
                :loading="loadingAgentId === resolved.agent.id"
                class="rs-agent-hero"
                @deploy="deploy"
                @configure="openFilesDrawer"
              />
              <RetroCard color="neutral" static class="rs-telemetry" aria-label="Telemetría del agente">
                <dl class="rs-telemetry__grid">
                  <div class="rs-telemetry__item">
                    <dt class="rs-label">Modelo</dt>
                    <dd class="rs-mono rs-telemetry__val">{{ resolved.agent.model || '—' }}</dd>
                  </div>
                  <div class="rs-telemetry__item">
                    <dt class="rs-label">Última señal</dt>
                    <dd class="rs-mono rs-telemetry__val">{{ formatSeen(resolved.agent.lastSeenAt) }}</dd>
                  </div>
                  <div class="rs-telemetry__item">
                    <dt class="rs-label">Tokens usados</dt>
                    <dd class="rs-mono rs-telemetry__val">{{ resolved.agent.tokenUsage.toLocaleString('es-ES') }}</dd>
                  </div>
                </dl>
              </RetroCard>
            </div>
            <aside class="rs-agent-shell__rail">
              <AgentsAgentOperationMenu
                mode="online"
                :agent="resolved.agent"
                :profile="resolved.profile"
                @open-guided="openGuidedForCurrentAgent"
                @open-guided-squad="openGuidedSquadWide"
                @open-files="openFilesDrawer(resolved.agent, resolved.profile)"
              />
            </aside>
          </div>
        </div>
      </template>

      <template v-else-if="resolved.type === 'unknown'">
        <div class="rs-agent-shell rs-agent-shell--single">
          <AgentsAgentOperationMenu
            mode="unknown"
            :agent="resolved.agent"
            class="rs-agent-single"
            @open-guided="openGuidedForCurrentAgent"
            @open-guided-squad="openGuidedSquadWide"
          />
        </div>
      </template>

      <template v-else-if="resolved.type === 'offline'">
        <div class="rs-agent-shell rs-agent-shell--single">
          <AgentsAgentOperationMenu
            mode="offline"
            :profile="resolved.profile"
            class="rs-agent-single"
          />
        </div>
      </template>

      <RetroEmptyState
        v-else
        title="Agente no encontrado"
        description="La ruta no coincide con ningún agente del escuadrón."
        icon="i-lucide-user-x"
        color="purple"
      >
        <RetroButton to="/agents" color="purple" variant="solid" size="sm">
          Volver al escuadrón
        </RetroButton>
      </RetroEmptyState>

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
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .rs-page { padding-top: 2rem; }
}

/* ── Shell wrapper ── */
.rs-agent-shell {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
}

.rs-agent-shell__grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 1024px) {
  .rs-agent-shell__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 18.5rem);
    gap: 1.5rem;
    align-items: start;
  }

  .rs-agent-shell__rail {
    position: sticky;
    top: 4.5rem;
  }
}

/* ── Telemetry card ── */
.rs-telemetry {
  padding: 0.9rem 1.1rem;
}

.rs-telemetry__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
}

.rs-telemetry__item {
  padding: 0 0.9rem;
  border-right: 1px solid var(--rs-border-soft);
}

.rs-telemetry__item:first-child { padding-left: 0; }
.rs-telemetry__item:last-child  { border-right: none; }

.rs-telemetry__val {
  display: block;
  font-size: var(--rs-text-sm);
  color: var(--rs-text);
  margin-top: 0.3rem;
  word-break: break-word;
  line-height: 1.4;
}

@media (max-width: 639px) {
  .rs-telemetry__grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .rs-telemetry__item {
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--rs-border-soft);
    padding-bottom: 0.75rem;
  }

  .rs-telemetry__item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

/* ── Single-column layouts (unknown / offline) ── */
.rs-agent-shell--single {
  max-width: min(100%, 28rem);
}

.rs-agent-single {
  width: 100%;
}
</style>
