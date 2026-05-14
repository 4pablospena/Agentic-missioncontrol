import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import { useAgentsAgentOperationMenuState } from '~/composables/useAgentsAgentOperationMenuState'

type MenuMode = 'online' | 'unknown' | 'offline'

const props = defineProps<{
  mode: MenuMode
  agent?: AgentSummary
  profile?: AgentProfile
}>()

const emit = defineEmits<{
  'open-guided': []
  'open-guided-squad': []
  'open-files': []
}>()

const {
  cardColor,
  statusLabel,
  statusBadgeColor,
  logsHref,
  chatHref,
} = useAgentsAgentOperationMenuState(toRefs(props))

<template>
  <RetroCard :color="cardColor" static class="ag-ops">

    <!-- Identity -->
    <div class="ag-ops__identity">
      <div
        class="ag-ops__avatar"
        :class="`rs-avatar--${cardColor}`"
        aria-hidden="true"
      >
        <UIcon :name="profile?.icon ?? 'i-lucide-bot'" class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="rs-display ag-ops__name">
          {{ profile?.displayName ?? agent?.name ?? 'Agente desconocido' }}
        </p>
        <p class="rs-body ag-ops__dept">
          {{ profile?.department ?? 'Sin departamento' }}
        </p>
      </div>
      <RetroBadge
        v-if="mode === 'offline'"
        color="neutral"
        size="sm"
      >
        Offline
      </RetroBadge>
      <RetroBadge
        v-else-if="agent"
        :color="statusBadgeColor"
        size="sm"
        :pulse="agent.status === 'running'"
      >
        {{ statusLabel }}
      </RetroBadge>
    </div>

    <!-- Profile info -->
    <div v-if="profile" class="ag-ops__profile">
      <p class="rs-body ag-ops__role">{{ profile.role }}</p>
      <div class="ag-ops__tools">
        <RetroTag
          v-for="tool in profile.tools"
          :key="tool"
          variant="terminal"
          :color="cardColor === 'neutral' ? 'cyan' : cardColor"
          size="sm"
        >
          {{ tool }}
        </RetroTag>
      </div>
      <div class="ag-ops__mission">
        <p class="rs-label ag-ops__mission-kicker">Misión por defecto</p>
        <p class="rs-display ag-ops__mission-title">{{ profile.quickActionLabel }}</p>
        <p class="rs-body ag-ops__mission-desc">{{ profile.quickActionInstruction }}</p>
      </div>
    </div>

    <p
      v-else-if="mode === 'unknown'"
      class="ag-ops__hint"
    >
      Agente activo sin perfil configurado. Puedes asignarle tareas desde el catálogo del escuadrón.
    </p>

    <!-- Actions -->
    <div class="ag-ops__actions">
      <!-- Online with profile -->
      <template v-if="mode === 'online' && agent && profile">
        <RetroButton
          color="pink"
          variant="solid"
          size="md"
          icon="i-lucide-sparkles"
          block
          @click="emit('open-guided')"
        >
          Nueva misión guiada
        </RetroButton>
        <RetroButton
          color="indigo"
          variant="outline"
          size="md"
          icon="i-lucide-folder-cog"
          block
          @click="emit('open-files')"
        >
          Archivos del puesto
        </RetroButton>
        <RetroButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-layout-grid"
          block
          @click="emit('open-guided-squad')"
        >
          Ver catálogo del escuadrón
        </RetroButton>
      </template>

      <!-- Unknown agent -->
      <template v-else-if="mode === 'unknown' && agent">
        <RetroButton
          color="pink"
          variant="solid"
          size="md"
          icon="i-lucide-sparkles"
          block
          @click="emit('open-guided')"
        >
          Asignar tarea
        </RetroButton>
        <RetroButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-layout-grid"
          block
          @click="emit('open-guided-squad')"
        >
          Ver catálogo del escuadrón
        </RetroButton>
      </template>

      <!-- Offline profile -->
      <template v-else-if="mode === 'offline'">
        <p class="rs-body ag-ops__offline-note">
          Conecta el servicio para desplegar misiones desde este puesto.
        </p>
        <RetroButton
          to="/"
          color="indigo"
          variant="outline"
          size="md"
          icon="i-lucide-home"
          block
        >
          Ir al tablero
        </RetroButton>
        <RetroButton
          to="/tasks"
          color="neutral"
          variant="ghost"
          size="sm"
          block
          trailing-icon="i-lucide-arrow-right"
        >
          Revisar misiones activas
        </RetroButton>
      </template>
    </div>

    <!-- Quick nav links -->
    <nav
      v-if="agent"
      class="ag-ops__nav"
      aria-label="Accesos rápidos del agente"
    >
      <RetroButton
        :to="logsHref"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-scroll-text"
      >
        Logs
      </RetroButton>
      <span class="ag-ops__nav-sep" aria-hidden="true" />
      <RetroButton
        :to="chatHref"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-message-square"
      >
        Chat
      </RetroButton>
      <span class="ag-ops__nav-sep" aria-hidden="true" />
      <RetroButton
        to="/tasks"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-list-checks"
      >
        Misiones
      </RetroButton>
    </nav>

  </RetroCard>
</template>

<style scoped>
.ag-ops {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

/* ── Identity ── */
.ag-ops__identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--rs-border) 70%, transparent);
}

.ag-ops__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid;
  border-radius: var(--rs-radius);
  background: rgba(0, 0, 0, 0.3);
}

.ag-ops__name {
  font-size: var(--rs-text-md);
  color: var(--rs-text);
  line-height: 1.2;
}

.ag-ops__dept {
  font-size: var(--rs-text-xs);
  color: var(--rs-text-muted);
  margin-top: 0.15rem;
}

/* ── Profile ── */
.ag-ops__profile {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--rs-border) 70%, transparent);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.ag-ops__role {
  font-size: var(--rs-text-sm);
  color: var(--rs-text-muted);
  line-height: 1.4;
}

.ag-ops__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ag-ops__mission {
  padding: 0.65rem 0.75rem;
  border-radius: var(--rs-radius);
  border: 1px solid var(--rs-border);
  background: rgba(0, 0, 0, 0.22);
}

.ag-ops__mission-kicker {
  font-size: var(--rs-text-2xs);
  letter-spacing: 0.1em;
  margin-bottom: 0.3rem;
}

.ag-ops__mission-title {
  font-size: var(--rs-text-sm);
  color: var(--rs-text);
  line-height: 1.35;
  margin-bottom: 0.3rem;
}

.ag-ops__mission-desc {
  font-size: var(--rs-text-xs);
  color: var(--rs-text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Hints ── */
.ag-ops__hint,
.ag-ops__offline-note {
  padding: 0.75rem 1rem;
  font-size: var(--rs-text-sm);
  color: var(--rs-text-muted);
  line-height: 1.5;
  border-bottom: 1px solid color-mix(in srgb, var(--rs-border) 70%, transparent);
}

.ag-ops__offline-note {
  border-bottom: none;
  padding-bottom: 0;
}

/* ── Actions ── */
.ag-ops__actions {
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* ── Quick nav ── */
.ag-ops__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.65rem 0.85rem;
  border-top: 1px solid color-mix(in srgb, var(--rs-border) 60%, transparent);
}

.ag-ops__nav-sep {
  width: 1px;
  height: 12px;
  background: var(--rs-border);
  flex-shrink: 0;
  margin: 0 0.1rem;
}

/* Avatar colors — mirrors AgentCharacterCard */
.rs-avatar--pink   { color: var(--rs-pink-hi);   border-color: color-mix(in srgb, var(--rs-pink)   45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-pink)   18%, transparent), color-mix(in srgb, var(--rs-pink)   4%, transparent)); }
.rs-avatar--cyan   { color: var(--rs-cyan-hi);   border-color: color-mix(in srgb, var(--rs-cyan)   45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-cyan)   18%, transparent), color-mix(in srgb, var(--rs-cyan)   4%, transparent)); }
.rs-avatar--purple { color: var(--rs-purple-hi); border-color: color-mix(in srgb, var(--rs-purple) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-purple) 18%, transparent), color-mix(in srgb, var(--rs-purple) 4%, transparent)); }
.rs-avatar--indigo { color: var(--rs-indigo-hi); border-color: color-mix(in srgb, var(--rs-indigo) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-indigo) 18%, transparent), color-mix(in srgb, var(--rs-indigo) 4%, transparent)); }
.rs-avatar--yellow { color: var(--rs-yellow-hi); border-color: color-mix(in srgb, var(--rs-yellow) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-yellow) 18%, transparent), color-mix(in srgb, var(--rs-yellow) 4%, transparent)); }
.rs-avatar--orange { color: var(--rs-orange);    border-color: color-mix(in srgb, var(--rs-orange) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-orange) 18%, transparent), color-mix(in srgb, var(--rs-orange) 4%, transparent)); }
.rs-avatar--green  { color: var(--rs-green-hi);  border-color: color-mix(in srgb, var(--rs-green)  45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-green)  18%, transparent), color-mix(in srgb, var(--rs-green)  4%, transparent)); }
.rs-avatar--red    { color: var(--rs-red);       border-color: color-mix(in srgb, var(--rs-red)    45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-red)    18%, transparent), color-mix(in srgb, var(--rs-red)    4%, transparent)); }
.rs-avatar--neutral { color: var(--rs-text-dim); border-color: var(--rs-border); background: rgba(0, 0, 0, 0.2); }
</style>
