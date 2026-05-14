<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'
import type { AgentProfile } from '~/config/agent-profiles'
import { useAgentFilesDrawerState } from '~/composables/useAgentFilesDrawerState'

const props = defineProps<{
  open: boolean
  agent: AgentSummary | null
  profile: AgentProfile | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const {
  cardColor,
  allFiles,
  selectedPath,
  dirtyPaths,
  showSensitive,
  selectedFile,
  filesByTier,
  tiers,
  currentDraft,
  isCurrentDirty,
  totalDirty,
  selectFile,
  discardChanges,
  saveCurrent,
  close,
  modelOpen,
} = useAgentFilesDrawerState(toRefs(props), v => emit('update:open', v))
</script>

<template>
  <USlideover
    v-model:open="modelOpen"
    side="right"
    :ui="{
      content: 'sm:max-w-5xl max-w-full w-full',
      overlay: 'bg-black/75 backdrop-blur-sm',
    }"
  >
    <template #content>
      <div class="rs-drawer">
        <div class="rs-drawer__header">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div
              v-if="profile"
              class="rs-drawer__avatar"
              :style="{
                color: profile.neonColor,
                borderColor: `color-mix(in srgb, ${profile.neonColor} 50%, transparent)`,
                boxShadow: `0 0 16px color-mix(in srgb, ${profile.neonColor} 30%, transparent)`,
              }"
            >
              <UIcon :name="profile.icon" class="size-5" />
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="rs-display rs-drawer__title"
                :class="`rs-glow-${cardColor}`"
              >
                {{ profile?.displayName ?? agent?.name ?? 'AGENTE' }}
              </p>
              <p class="rs-body rs-drawer__subtitle">
                Configuración del agente · {{ allFiles.length }} archivos
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <RetroBadge
              v-if="totalDirty > 0"
              color="yellow"
              size="sm"
              pulse
            >
              {{ totalDirty }} sin guardar
            </RetroBadge>
            <button
              type="button"
              class="rs-drawer__close"
              aria-label="Cerrar panel"
              @click="close"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </div>

        <div class="rs-drawer__body">
          <AgentsAgentFilesDrawerTree
            :tiers="tiers"
            :files-by-tier="filesByTier"
            :selected-path="selectedPath"
            :dirty-paths="dirtyPaths"
            @select="selectFile"
          />
          <AgentsAgentFilesDrawerEditorPane
            v-model:draft="currentDraft"
            v-model:show-sensitive="showSensitive"
            :profile="profile"
            :selected-file="selectedFile"
            :is-current-dirty="isCurrentDirty"
            @discard="discardChanges"
            @save="saveCurrent"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<style scoped>
/* ─── Drawer shell ────────────────────────────────────────────────────── */
.rs-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--rs-bg);
  border-left: 1px solid var(--rs-border);
}

/* ─── Header ──────────────────────────────────────────────────────────── */
.rs-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--rs-border);
  background: linear-gradient(180deg, var(--rs-surface) 0%, transparent 100%);
  flex-shrink: 0;
}

.rs-drawer__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.3);
}

.rs-drawer__title {
  font-size: var(--rs-text-lg);
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.rs-drawer__subtitle {
  font-size: var(--rs-text-sm);
  color: var(--rs-text-muted);
  margin-top: 0.2rem;
  line-height: 1.3;
}

.rs-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--rs-border);
  color: var(--rs-text-muted);
  cursor: pointer;
  transition: all 150ms;
}
.rs-drawer__close:hover {
  border-color: var(--rs-cyan);
  color: var(--rs-cyan);
  box-shadow: 0 0 12px color-mix(in srgb, var(--rs-cyan) 30%, transparent);
}

/* ─── Body layout ─────────────────────────────────────────────────────── */
.rs-drawer__body {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .rs-drawer__body {
    grid-template-columns: 180px 1fr;
  }
}
</style>
