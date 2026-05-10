<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'
import type { AgentProfile } from '~/config/agent-profiles'

const props = defineProps<{
  agent: AgentSummary
  profile: AgentProfile
  loading?: boolean
}>()

const emit = defineEmits<{
  deploy: [agentId: string, profile: AgentProfile]
  configure: [agent: AgentSummary, profile: AgentProfile]
}>()

type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red'

const cardColor = computed<RetroColor>(() => {
  const map: Record<string, RetroColor> = {
    success: 'green', info: 'cyan', secondary: 'purple',
    warning: 'yellow', error: 'orange',
  }
  return map[props.profile.twColor] ?? 'indigo'
})

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    idle: 'Disponible',
    running: 'En misión',
    error: 'Error',
    offline: 'Offline',
  }
  return map[props.agent.status] ?? props.agent.status
})

const statusBadgeColor = computed<RetroColor>(() => {
  const map: Record<string, RetroColor> = {
    idle: 'green', running: 'yellow', error: 'red', offline: 'purple',
  }
  return map[props.agent.status] ?? 'purple'
})

const isActive = computed(() => props.agent.status === 'running')
const isOffline = computed(() => props.agent.status === 'offline' || props.agent.status === 'error')

function onConfigure(e: Event) {
  e.stopPropagation()
  emit('configure', props.agent, props.profile)
}
</script>

<template>
  <RetroCard
    :color="cardColor"
    :active="isActive"
    interactive
    static
    class="rs-character-card"
  >
    <!-- Top strip -->
    <div class="rs-character-card__strip">
      <RetroTag variant="ticket" :color="cardColor" size="sm">
        {{ profile.department }}
      </RetroTag>
      <div class="flex items-center gap-2">
        <button
          class="rs-character-card__config-btn"
          aria-label="Configurar agente"
          @click="onConfigure"
        >
          <UIcon name="i-lucide-settings-2" class="size-3.5" />
        </button>
        <RetroBadge :color="statusBadgeColor" size="sm" :pulse="isActive">
          {{ statusLabel }}
        </RetroBadge>
      </div>
    </div>

    <!-- Body -->
    <div class="rs-character-card__body">
      <!-- Identity -->
      <div class="flex items-center gap-3.5">
        <div
          class="rs-character-card__avatar"
          :class="`rs-avatar--${cardColor}`"
        >
          <UIcon :name="profile.icon" class="size-6" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="rs-display rs-character-card__name">
            {{ profile.displayName }}
          </p>
          <p class="rs-body rs-character-card__role">
            {{ profile.role }}
          </p>
        </div>
      </div>

      <!-- Tools -->
      <div class="flex flex-wrap gap-1.5">
        <RetroTag
          v-for="tool in profile.tools"
          :key="tool"
          variant="terminal"
          :color="cardColor"
          size="sm"
        >
          {{ tool }}
        </RetroTag>
      </div>

      <!-- Current action -->
      <div
        v-if="agent.currentAction && isActive"
        class="rs-character-card__action"
      >
        <span class="rs-dot rs-dot--running" />
        <span class="rs-body rs-character-card__action-text">
          {{ agent.currentAction }}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="rs-character-card__footer">
      <p class="rs-body rs-character-card__action-label">
        {{ profile.quickActionLabel }}
      </p>
      <RetroButton
        :color="cardColor"
        variant="solid"
        size="md"
        :icon="loading ? undefined : isActive ? 'i-lucide-radio' : 'i-lucide-play'"
        :loading="loading"
        :disabled="isOffline"
        block
        @click="emit('deploy', agent.id, profile)"
      >
        <span v-if="loading">Desplegando<span class="rs-cursor"/></span>
        <span v-else-if="isActive">En misión</span>
        <span v-else-if="isOffline">Offline</span>
        <span v-else>Desplegar</span>
      </RetroButton>
    </div>
  </RetroCard>
</template>

<style scoped>
.rs-character-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100%;
}

.rs-character-card__strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.95rem;
  border-bottom: 1px solid color-mix(in srgb, var(--rs-border) 70%, transparent);
}

.rs-character-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.05rem 1.05rem 0.85rem;
}

.rs-character-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border: 1px solid;
  border-radius: var(--rs-radius);
  background: rgba(0, 0, 0, 0.3);
}

.rs-character-card__name {
  font-size: var(--rs-text-lg);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: var(--rs-text);
}

.rs-character-card__role {
  font-size: var(--rs-text-md);
  color: var(--rs-text-muted);
  margin-top: 0.2rem;
  line-height: 1.3;
}

.rs-character-card__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  background: color-mix(in srgb, var(--rs-yellow) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--rs-yellow) 22%, transparent);
  border-radius: var(--rs-radius);
}

.rs-character-card__action-text {
  font-size: var(--rs-text-md);
  color: var(--rs-text-muted);
  line-height: 1.3;
}

.rs-character-card__footer {
  padding: 0.85rem 1.05rem 1.05rem;
  border-top: 1px solid color-mix(in srgb, var(--rs-border) 60%, transparent);
}

.rs-character-card__action-label {
  font-size: var(--rs-text-md);
  color: var(--rs-text-muted);
  margin-bottom: 0.6rem;
  line-height: 1.4;
}

/* ─── Config button ─── */
.rs-character-card__config-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--rs-surface-2);
  border: 1px solid var(--rs-border);
  border-radius: var(--rs-radius-sm);
  color: var(--rs-text-dim);
  cursor: pointer;
  transition: all 150ms;
}

.rs-character-card__config-btn:hover {
  color: var(--rs-text);
  border-color: var(--rs-border-hi);
  background: var(--rs-surface-3);
}

/* ─── Avatar colors ─── */
.rs-avatar--pink   { color: var(--rs-pink-hi);   border-color: color-mix(in srgb, var(--rs-pink)   45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-pink)   18%, transparent), color-mix(in srgb, var(--rs-pink)   4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-pink)   12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-pink)   18%, transparent); }
.rs-avatar--cyan   { color: var(--rs-cyan-hi);   border-color: color-mix(in srgb, var(--rs-cyan)   45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-cyan)   18%, transparent), color-mix(in srgb, var(--rs-cyan)   4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-cyan)   12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-cyan)   18%, transparent); }
.rs-avatar--purple { color: var(--rs-purple-hi); border-color: color-mix(in srgb, var(--rs-purple) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-purple) 18%, transparent), color-mix(in srgb, var(--rs-purple) 4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-purple) 12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-purple) 18%, transparent); }
.rs-avatar--indigo { color: var(--rs-indigo-hi); border-color: color-mix(in srgb, var(--rs-indigo) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-indigo) 18%, transparent), color-mix(in srgb, var(--rs-indigo) 4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-indigo) 12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-indigo) 18%, transparent); }
.rs-avatar--yellow { color: var(--rs-yellow-hi); border-color: color-mix(in srgb, var(--rs-yellow) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-yellow) 18%, transparent), color-mix(in srgb, var(--rs-yellow) 4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-yellow) 12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-yellow) 18%, transparent); }
.rs-avatar--orange { color: var(--rs-orange);    border-color: color-mix(in srgb, var(--rs-orange) 45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-orange) 18%, transparent), color-mix(in srgb, var(--rs-orange) 4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-orange) 12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-orange) 18%, transparent); }
.rs-avatar--green  { color: var(--rs-green-hi);  border-color: color-mix(in srgb, var(--rs-green)  45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-green)  18%, transparent), color-mix(in srgb, var(--rs-green)  4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-green)  12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-green)  18%, transparent); }
.rs-avatar--red    { color: var(--rs-red);       border-color: color-mix(in srgb, var(--rs-red)    45%, transparent); background: linear-gradient(135deg, color-mix(in srgb, var(--rs-red)    18%, transparent), color-mix(in srgb, var(--rs-red)    4%, transparent)); box-shadow: inset 0 0 16px color-mix(in srgb, var(--rs-red)    12%, transparent), 0 0 16px color-mix(in srgb, var(--rs-red)    18%, transparent); }
</style>
