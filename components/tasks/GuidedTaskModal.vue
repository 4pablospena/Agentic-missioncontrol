<script setup lang="ts">
import type { AgentSummary } from '~/models/agent'
import type { CreateTaskPayload } from '~/models/task'
import { useGuidedTaskModal } from '~/composables/useGuidedTaskModal'
import type { TaskTemplate } from '~/config/task-templates'

const props = withDefaults(
  defineProps<{
    agents: AgentSummary[]
    open: boolean
    restrictToAgentId?: string | null
  }>(),
  { restrictToAgentId: null },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: CreateTaskPayload]
  'clear-restrict': []
}>()

const {
  step,
  selectedTemplate,
  formValues,
  formError,
  agentGroups,
  restrictedButEmpty,
  selectTemplate,
  onBack,
  onSubmit,
  modelOpen,
} = useGuidedTaskModal(toRefs(props), emit)

function onSelectTemplate(template: TaskTemplate, agentId: string) {
  selectTemplate(template, agentId)
}
</script>

<template>
  <UModal
    v-model:open="modelOpen"
    :ui="{ content: 'sm:max-w-2xl', overlay: 'bg-black/75 backdrop-blur-sm' }"
  >
    <template #content>
      <div class="rs-modal">
        <div class="rs-modal__header">
          <div class="flex items-center gap-3">
            <button
              v-if="step === 2"
              type="button"
              class="rs-modal__back"
              aria-label="Volver"
              @click="onBack"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" />
            </button>
            <div>
              <p class="rs-display text-[0.7rem] sm:text-[0.85rem] rs-glow-pink leading-tight">
                {{ step === 1 ? '// NUEVA ORDEN' : `// ${selectedTemplate?.name?.toUpperCase()}` }}
              </p>
              <p class="rs-body text-sm mt-1" style="color: var(--rs-text-muted);">
                <template v-if="step === 1">
                  {{ restrictToAgentId?.trim() ? 'Tareas disponibles para este agente' : 'Selecciona qué quieres hacer' }}
                </template>
                <template v-else>
                  {{ selectedTemplate?.description }}
                </template>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="rs-modal__back"
            aria-label="Cerrar"
            @click="modelOpen = false"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <div class="rs-modal__body">
          <TasksGuidedTaskModalPickStep
            v-if="step === 1"
            :agent-groups="agentGroups"
            :restricted-but-empty="restrictedButEmpty"
            @select="onSelectTemplate"
            @clear-restrict="emit('clear-restrict')"
          />

          <TasksGuidedTaskModalFormStep
            v-else-if="step === 2 && selectedTemplate"
            v-model:form-values="formValues"
            :selected-template="selectedTemplate"
            :form-error="formError"
            @submit="onSubmit"
            @cancel="modelOpen = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.rs-modal {
  background: var(--rs-surface);
  border: 1px solid var(--rs-border);
  box-shadow:
    0 0 0 1px var(--rs-pink),
    0 0 48px color-mix(in srgb, var(--rs-pink) 25%, transparent),
    0 16px 48px rgba(0, 0, 0, 0.6);
  position: relative;
}

.rs-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid var(--rs-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--rs-pink) 8%, transparent), transparent);
}

.rs-modal__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--rs-border);
  color: var(--rs-text-muted);
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}

.rs-modal__back:hover {
  border-color: var(--rs-cyan);
  color: var(--rs-cyan);
  box-shadow: 0 0 12px color-mix(in srgb, var(--rs-cyan) 30%, transparent);
}

.rs-modal__body {
  padding: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
}
</style>
