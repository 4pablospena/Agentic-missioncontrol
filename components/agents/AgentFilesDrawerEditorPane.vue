<script setup lang="ts">
import type { AgentFile } from '~/config/agent-files-mock'
import type { AgentProfile } from '~/config/agent-profiles'
import { agentFileLineCount, agentFileTierColor } from '~/composables/useAgentFilesDrawerState'

defineProps<{
  profile: AgentProfile | null
  selectedFile: AgentFile | null
  isCurrentDirty: boolean
}>()

const draft = defineModel<string>('draft', { required: true })
const showSensitive = defineModel<boolean>('showSensitive', { required: true })

const emit = defineEmits<{
  discard: []
  save: []
}>()
</script>

<template>
  <main class="rs-drawer__content">
    <template v-if="selectedFile">
      <div class="rs-content__header">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <UIcon
              :name="selectedFile.icon"
              class="size-4 shrink-0"
              :style="{ color: profile?.neonColor }"
            />
            <p class="rs-heading rs-content__path">{{ selectedFile.path }}</p>
            <RetroBadge :color="agentFileTierColor(selectedFile.tier)" size="sm">
              {{ selectedFile.tier }}
            </RetroBadge>
            <RetroTag
              v-if="selectedFile.language === 'markdown'"
              variant="terminal"
              color="cyan"
              size="sm"
            >
              MD
            </RetroTag>
            <RetroTag
              v-else-if="selectedFile.language === 'json'"
              variant="terminal"
              color="yellow"
              size="sm"
            >
              JSON
            </RetroTag>
            <RetroTag
              v-else-if="selectedFile.language === 'env'"
              variant="terminal"
              color="red"
              size="sm"
            >
              ENV
            </RetroTag>
          </div>
          <p class="rs-body rs-content__description">
            {{ selectedFile.description }}
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span
            v-if="!isCurrentDirty"
            class="rs-body rs-content__saved-label"
          >
            <span class="rs-dot rs-dot--idle" /> Guardado
          </span>
          <RetroButton
            v-if="isCurrentDirty"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-undo-2"
            @click="emit('discard')"
          >
            Descartar
          </RetroButton>
          <RetroButton
            v-if="!selectedFile.sensitive"
            color="pink"
            variant="solid"
            size="sm"
            icon="i-lucide-save"
            :disabled="!isCurrentDirty"
            @click="emit('save')"
          >
            Guardar
          </RetroButton>
        </div>
      </div>

      <div v-if="selectedFile.sensitive && !showSensitive" class="rs-sensitive-shield">
        <UIcon name="i-lucide-shield-alert" class="size-10 rs-glow-red" />
        <p class="rs-display rs-glow-red" style="font-size: var(--rs-text-md);">
          Archivo confidencial
        </p>
        <p class="rs-body" style="color: var(--rs-text-muted); max-width: 24rem; text-align: center;">
          Este archivo contiene API keys y tokens. Asegúrate de no compartir tu pantalla antes de mostrarlo.
        </p>
        <RetroButton
          color="red"
          variant="outline"
          size="md"
          icon="i-lucide-eye"
          @click="showSensitive = true"
        >
          Mostrar de todos modos
        </RetroButton>
      </div>

      <div v-else class="rs-editor">
        <div class="rs-editor__meta">
          <span class="rs-mono">
            {{ agentFileLineCount(draft) }} líneas · {{ draft.length }} caracteres
          </span>
        </div>
        <textarea
          v-model="draft"
          class="rs-editor__textarea rs-mono"
          :class="`rs-editor__textarea--${selectedFile.language}`"
          :readonly="selectedFile.sensitive"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
        />
      </div>
    </template>

    <div v-else class="rs-content__empty">
      <p class="rs-body" style="color: var(--rs-text-dim);">
        Selecciona un archivo de la izquierda
      </p>
    </div>
  </main>
</template>

<style scoped>
.rs-drawer__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.rs-content__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--rs-border);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.rs-content__path {
  font-family: var(--rs-font-mono);
  font-weight: 500;
  font-size: var(--rs-text-md);
  color: var(--rs-text);
}

.rs-content__description {
  font-size: var(--rs-text-sm);
  color: var(--rs-text-muted);
  margin-top: 0.4rem;
  line-height: 1.4;
}

.rs-content__saved-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--rs-text-xs);
  color: var(--rs-text-dim);
  letter-spacing: 0.04em;
}

.rs-content__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rs-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgba(0, 0, 0, 0.4);
}

.rs-editor__meta {
  padding: 0.45rem 1rem;
  border-bottom: 1px solid var(--rs-border-soft);
  font-size: var(--rs-text-xs);
  color: var(--rs-text-dim);
  flex-shrink: 0;
}

.rs-editor__textarea {
  flex: 1;
  width: 100%;
  padding: 1.1rem 1.25rem;
  background: transparent;
  border: none;
  color: var(--rs-text);
  font-size: var(--rs-text-md);
  line-height: 1.65;
  resize: none;
  outline: none;
  tab-size: 2;
  min-height: 0;
}

.rs-editor__textarea--markdown { color: #e0d8f5; }
.rs-editor__textarea--json     { color: var(--rs-yellow); font-feature-settings: "tnum"; }
.rs-editor__textarea--env      { color: var(--rs-red); }

.rs-editor__textarea:focus {
  background: rgba(0, 0, 0, 0.55);
}

.rs-editor__textarea::placeholder { color: var(--rs-text-dim); }

.rs-editor__textarea[readonly] { cursor: default; opacity: 0.85; }

.rs-sensitive-shield {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--rs-red) 8%, transparent) 100%);
}
</style>
