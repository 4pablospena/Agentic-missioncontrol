<script setup lang="ts">
import { getFilesForAgent, TIER_META, type AgentFile } from '~/config/agent-files-mock'
import type { AgentSummary } from '~/models/agent'
import type { AgentProfile } from '~/config/agent-profiles'

const props = defineProps<{
  open: boolean
  agent: AgentSummary | null
  profile: AgentProfile | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

type RetroColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'orange' | 'green' | 'red'

const cardColor = computed<RetroColor>(() => {
  if (!props.profile) return 'pink'
  const map: Record<string, RetroColor> = {
    success: 'green', info: 'cyan', secondary: 'purple',
    warning: 'yellow', error: 'orange',
  }
  return map[props.profile.twColor] ?? 'pink'
})

// ─── Files state ──────────────────────────────────────────────────────────
const allFiles = ref<AgentFile[]>([])
const selectedPath = ref<string>('SOUL.md')
const draftContents = ref<Record<string, string>>({})
const dirtyPaths = ref<Set<string>>(new Set())
const showSensitive = ref(false)
const toast = useToast()

// Load files when drawer opens for an agent
watch(
  [() => props.open, () => props.agent?.id],
  ([isOpen, agentId]) => {
    if (!isOpen || !agentId) return
    allFiles.value = getFilesForAgent(agentId)
    draftContents.value = Object.fromEntries(
      allFiles.value.map(f => [f.path, f.content]),
    )
    dirtyPaths.value = new Set()
    if (allFiles.value.length > 0) {
      selectedPath.value = allFiles.value[0]!.path
    }
    showSensitive.value = false
  },
  { immediate: true },
)

const selectedFile = computed(() =>
  allFiles.value.find(f => f.path === selectedPath.value) ?? null,
)

// Group files by tier for navigation
const filesByTier = computed(() => {
  const groups: Record<string, AgentFile[]> = {}
  for (const f of allFiles.value) {
    ;(groups[f.tier] ??= []).push(f)
  }
  return groups
})

const tiers = computed(() =>
  TIER_META.filter(t => filesByTier.value[t.id]?.length),
)

// ─── Editor logic ──────────────────────────────────────────────────────────
const currentDraft = computed({
  get: () => draftContents.value[selectedPath.value] ?? '',
  set: (val: string) => {
    draftContents.value[selectedPath.value] = val
    if (selectedFile.value && val !== selectedFile.value.content) {
      dirtyPaths.value.add(selectedPath.value)
    }
    else {
      dirtyPaths.value.delete(selectedPath.value)
    }
  },
})

const isCurrentDirty = computed(() => dirtyPaths.value.has(selectedPath.value))
const totalDirty = computed(() => dirtyPaths.value.size)

function selectFile(path: string) {
  selectedPath.value = path
}

function discardChanges() {
  if (!selectedFile.value) return
  draftContents.value[selectedPath.value] = selectedFile.value.content
  dirtyPaths.value.delete(selectedPath.value)
}

function saveCurrent() {
  if (!selectedFile.value || !isCurrentDirty.value) return
  // Persist locally — the original mock object is updated in place
  selectedFile.value.content = draftContents.value[selectedPath.value] ?? ''
  dirtyPaths.value.delete(selectedPath.value)
  toast.add({
    title: 'Guardado',
    description: `${selectedFile.value.path} actualizado`,
    color: 'success',
  })
}

function close() {
  if (totalDirty.value > 0) {
    if (!confirm(`Tienes ${totalDirty.value} cambio(s) sin guardar. ¿Cerrar de todos modos?`)) return
  }
  emit('update:open', false)
}

const modelOpen = computed({
  get: () => props.open,
  set: (v: boolean) => { if (!v) close(); else emit('update:open', v) },
})

// ─── Display helpers ──────────────────────────────────────────────────────
function tierColor(tier: string): RetroColor {
  const map: Record<string, RetroColor> = {
    T0: 'pink', T1: 'cyan', T2: 'purple', T3: 'yellow', T4: 'orange',
  }
  return map[tier] ?? 'cyan'
}

function fileLineCount(content: string): number {
  return content.split('\n').length
}
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
        <!-- ── Header ──────────────────────────────────────────────────── -->
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
            <button class="rs-drawer__close" @click="close">
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </div>

        <!-- ── Body: split layout ──────────────────────────────────────── -->
        <div class="rs-drawer__body">
          <!-- Left: file tree -->
          <aside class="rs-drawer__tree">
            <div
              v-for="tier in tiers"
              :key="tier.id"
              class="rs-tree__group"
            >
              <div class="rs-tree__group-header">
                <span
                  class="rs-tree__tier-badge"
                  :class="`rs-glow-${tierColor(tier.id)}`"
                >
                  {{ tier.id }}
                </span>
                <span class="rs-tree__group-label">
                  {{ tier.label }}
                </span>
              </div>

              <button
                v-for="file in filesByTier[tier.id]"
                :key="file.path"
                class="rs-tree__item"
                :class="{ 'rs-tree__item--active': selectedPath === file.path }"
                @click="selectFile(file.path)"
              >
                <UIcon :name="file.icon" class="size-3.5 shrink-0" />
                <span class="truncate flex-1 text-left">{{ file.label }}</span>
                <span
                  v-if="dirtyPaths.has(file.path)"
                  class="rs-tree__dirty-dot"
                  title="Sin guardar"
                />
                <UIcon
                  v-else-if="file.sensitive"
                  name="i-lucide-lock"
                  class="size-3 opacity-50 shrink-0"
                />
              </button>
            </div>
          </aside>

          <!-- Right: file content -->
          <main class="rs-drawer__content">
            <template v-if="selectedFile">
              <!-- File header -->
              <div class="rs-content__header">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <UIcon :name="selectedFile.icon" class="size-4 shrink-0" :style="{ color: profile?.neonColor }" />
                    <p class="rs-heading rs-content__path">{{ selectedFile.path }}</p>
                    <RetroBadge :color="tierColor(selectedFile.tier)" size="sm">
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
                    @click="discardChanges"
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
                    @click="saveCurrent"
                  >
                    Guardar
                  </RetroButton>
                </div>
              </div>

              <!-- Sensitive file: confirm before reveal -->
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

              <!-- Editor / viewer -->
              <div v-else class="rs-editor">
                <div class="rs-editor__meta">
                  <span class="rs-mono">
                    {{ fileLineCount(currentDraft) }} líneas · {{ currentDraft.length }} caracteres
                  </span>
                </div>
                <textarea
                  v-model="currentDraft"
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

            <!-- No file selected -->
            <div v-else class="rs-content__empty">
              <p class="rs-body" style="color: var(--rs-text-dim);">
                Selecciona un archivo de la izquierda
              </p>
            </div>
          </main>
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

/* ─── Tree (left nav) ─────────────────────────────────────────────────── */
.rs-drawer__tree {
  background: color-mix(in srgb, var(--rs-surface) 60%, var(--rs-bg));
  border-right: 1px solid var(--rs-border);
  overflow-y: auto;
  padding: 0.6rem 0;
}

.rs-tree__group {
  margin-bottom: 0.65rem;
}

.rs-tree__group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem 0.35rem;
}

.rs-tree__tier-badge {
  font-family: var(--rs-font-display);
  font-size: var(--rs-text-2xs);
  letter-spacing: 0.05em;
  border: 1px solid currentColor;
  padding: 0.1rem 0.35rem;
  line-height: 1;
}

.rs-tree__group-label {
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-2xs);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rs-text-dim);
}

.rs-tree__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.85rem 0.4rem 1rem;
  font-family: var(--rs-font-body);
  font-size: var(--rs-text-md);
  font-weight: 500;
  color: var(--rs-text-muted);
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: all 120ms;
}

.rs-tree__item:hover {
  background: color-mix(in srgb, var(--rs-cyan) 6%, transparent);
  color: var(--rs-text);
}

.rs-tree__item--active {
  color: var(--rs-pink) !important;
  background: linear-gradient(90deg, color-mix(in srgb, var(--rs-pink) 15%, transparent), transparent 80%);
  border-left-color: var(--rs-pink);
  text-shadow: 0 0 6px color-mix(in srgb, var(--rs-pink) 50%, transparent);
}

.rs-tree__dirty-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rs-yellow);
  box-shadow: 0 0 6px var(--rs-yellow);
  flex-shrink: 0;
}

/* ─── Content (right) ─────────────────────────────────────────────────── */
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

/* ─── Editor ──────────────────────────────────────────────────────────── */
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

/* ─── Sensitive shield ────────────────────────────────────────────────── */
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
