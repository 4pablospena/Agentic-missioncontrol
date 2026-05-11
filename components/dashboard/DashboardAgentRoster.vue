<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'
import { useAgentRosterList } from '~/composables/useAgentRoster'

const props = defineProps<{
  agents: readonly AgentSummary[]
}>()

const route = useRoute()
const roster = useAgentRosterList(() => props.agents)

function hrefFor(key: string) {
  return `/agents/${encodeURIComponent(key)}`
}

function isRowActive(key: string) {
  const p = route.params.agentKey
  const raw = Array.isArray(p) ? p[0] : p
  if (typeof raw !== 'string')
    return false
  try {
    return decodeURIComponent(raw) === key
  }
  catch {
    return raw === key
  }
}
</script>

<template>
  <div class="rs-roster">
    <p class="rs-roster__label">
      Escuadrón
    </p>
    <div class="rs-roster__list">
      <NuxtLink
        v-for="item in roster"
        :key="item.agentKey"
        :to="hrefFor(item.agentKey)"
        class="rs-roster__item"
        :class="{
          'rs-roster__item--active': isRowActive(item.agentKey),
          'rs-roster__item--offline': item.kind === 'offline',
        }"
      >
        <span
          class="rs-dot shrink-0"
          :class="{
            'rs-dot--idle': item.kind === 'online' && item.agent?.status === 'idle',
            'rs-dot--running': item.kind === 'online' && item.agent?.status === 'running',
            'rs-dot--error': item.kind === 'online' && item.agent?.status === 'error',
            'rs-dot--offline': item.kind === 'offline' || item.kind === 'unknown'
              || (item.kind === 'online' && item.agent?.status === 'offline'),
          }"
        />
        <span class="rs-roster__name truncate">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.rs-roster {
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px solid color-mix(in srgb, var(--rs-border) 70%, transparent);
}

.rs-roster__label {
  font-family: var(--rs-font-display);
  font-size: var(--rs-text-2xs);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rs-text-muted);
  padding: 0 0.7rem 0.5rem;
}

.rs-roster__list {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  max-height: min(40vh, 320px);
  overflow-y: auto;
}

.rs-roster__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.7rem;
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-sm);
  font-weight: 500;
  color: var(--rs-text-muted);
  text-decoration: none;
  border-radius: var(--rs-radius);
  transition: background 0.15s ease, color 0.15s ease;
}

.rs-roster__item:hover {
  color: var(--rs-text);
  background: color-mix(in srgb, var(--rs-surface) 90%, var(--rs-indigo));
}

.rs-roster__item--active {
  color: var(--rs-text) !important;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--rs-purple) 18%, transparent),
    color-mix(in srgb, var(--rs-purple) 6%, transparent) 70%,
    transparent
  );
  box-shadow: inset 2px 0 0 0 var(--rs-purple);
}

.rs-roster__item--offline:not(.rs-roster__item--active) {
  opacity: 0.72;
}

.rs-roster__name {
  min-width: 0;
}
</style>
