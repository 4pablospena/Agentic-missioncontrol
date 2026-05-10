<script setup lang="ts">
import { TASK_TEMPLATES, getTemplatesForAgent, type TaskTemplate } from '~/config/task-templates'
import { getProfileForAgent } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import type { CreateTaskPayload } from '~/models/task'

const props = defineProps<{
  agents: AgentSummary[]
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: CreateTaskPayload]
}>()

const step = ref<1 | 2>(1)
const selectedTemplate = ref<TaskTemplate | null>(null)
const formValues = ref<Record<string, unknown>>({})
const formError = ref('')

watch(() => props.open, (val) => {
  if (!val) {
    setTimeout(() => {
      step.value = 1
      selectedTemplate.value = null
      formValues.value = {}
      formError.value = ''
    }, 200)
  }
})

interface AgentGroup {
  agentId: string
  agentName: string
  displayName: string
  templates: TaskTemplate[]
  neonColor: string
}

const agentGroups = computed<AgentGroup[]>(() => {
  if (props.agents.length === 0) {
    const groups: Record<string, TaskTemplate[]> = {}
    for (const t of TASK_TEMPLATES) {
      ;(groups[t.agentNameMatch] ??= []).push(t)
    }
    return Object.entries(groups).map(([slug, templates]) => ({
      agentId: '',
      agentName: slug,
      displayName: slug.toUpperCase(),
      templates,
      neonColor: 'var(--rs-pink)',
    }))
  }

  return props.agents
    .map((agent) => {
      const profile = getProfileForAgent(agent.name)
      return {
        agentId: agent.id,
        agentName: agent.name,
        displayName: profile?.displayName ?? agent.name.toUpperCase(),
        templates: getTemplatesForAgent(agent.name),
        neonColor: profile?.neonColor ?? 'var(--rs-pink)',
      }
    })
    .filter(g => g.templates.length > 0)
})

function selectTemplate(template: TaskTemplate, agentId: string) {
  selectedTemplate.value = template
  const defaults: Record<string, unknown> = { _agentId: agentId }
  for (const field of template.fields) {
    if (field.default !== undefined) {
      defaults[field.key] = field.default
    }
  }
  formValues.value = defaults
  step.value = 2
}

function onBack() {
  step.value = 1
  formError.value = ''
}

function onSubmit() {
  formError.value = ''
  if (!selectedTemplate.value) return

  for (const field of selectedTemplate.value.fields) {
    if (field.required) {
      const val = formValues.value[field.key]
      if (val === undefined || val === null || val === '') {
        formError.value = `"${field.label}" es obligatorio`
        return
      }
    }
  }

  const agentId = String(formValues.value._agentId ?? '')
  const payload = selectedTemplate.value.toPayload(agentId, formValues.value)
  emit('submit', payload)
  emit('update:open', false)
}

const modelOpen = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})
</script>

<template>
  <UModal
    v-model:open="modelOpen"
    :ui="{ content: 'sm:max-w-2xl', overlay: 'bg-black/75 backdrop-blur-sm' }"
  >
    <template #content>
      <div class="rs-modal">
        <!-- Header -->
        <div class="rs-modal__header">
          <div class="flex items-center gap-3">
            <button
              v-if="step === 2"
              class="rs-modal__back"
              @click="onBack"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" />
            </button>
            <div>
              <p class="rs-display text-[0.7rem] sm:text-[0.85rem] rs-glow-pink leading-tight">
                {{ step === 1 ? '// NUEVA ORDEN' : `// ${selectedTemplate?.name?.toUpperCase()}` }}
              </p>
              <p class="rs-body text-sm mt-1" style="color: var(--rs-text-muted);">
                {{ step === 1 ? 'Selecciona qué quieres hacer' : selectedTemplate?.description }}
              </p>
            </div>
          </div>
          <button class="rs-modal__back" @click="modelOpen = false">
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="rs-modal__body">
          <!-- Step 1: template grid -->
          <div v-if="step === 1">
            <RetroEmptyState
              v-if="agentGroups.length === 0"
              title="Sin agentes"
              description="No hay agentes disponibles. Comprueba la conexión con Openclaw."
              color="purple"
            />

            <div v-for="group in agentGroups" :key="group.agentName" class="mb-6 last:mb-0">
              <p
                class="rs-display text-[0.6rem] mb-3 tracking-widest"
                :style="{ color: group.neonColor, textShadow: `0 0 6px ${group.neonColor}` }"
              >
                ◢ {{ group.displayName }}
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <RetroCard
                  v-for="template in group.templates"
                  :key="template.id"
                  color="pink"
                  interactive
                  class="p-3.5 flex items-start gap-3 text-left"
                  @click="selectTemplate(template, group.agentId)"
                >
                  <UIcon
                    :name="template.icon"
                    class="size-5 shrink-0 mt-0.5"
                    :style="{ color: group.neonColor, filter: `drop-shadow(0 0 4px ${group.neonColor})` }"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="rs-display text-[0.7rem] leading-tight" style="color: var(--rs-text);">
                      {{ template.name }}
                    </p>
                    <p class="rs-body text-sm mt-1" style="color: var(--rs-text-muted);">
                      {{ template.description }}
                    </p>
                  </div>
                </RetroCard>
              </div>
            </div>
          </div>

          <!-- Step 2: form -->
          <form
            v-else-if="step === 2 && selectedTemplate"
            class="flex flex-col gap-5"
            @submit.prevent="onSubmit"
          >
            <template v-for="field in selectedTemplate.fields" :key="field.key">
              <div>
                <label class="rs-display text-[0.65rem] tracking-widest mb-2 block" style="color: var(--rs-cyan);">
                  {{ field.label }}<span v-if="field.required" class="rs-glow-pink"> *</span>
                </label>

                <input
                  v-if="field.type === 'text'"
                  v-model="formValues[field.key] as string"
                  :placeholder="field.placeholder"
                  class="rs-input w-full"
                >

                <textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="formValues[field.key] as string"
                  :placeholder="field.placeholder"
                  rows="3"
                  class="rs-input w-full resize-y"
                />

                <select
                  v-else-if="field.type === 'select'"
                  v-model="formValues[field.key] as string"
                  class="rs-input w-full"
                >
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>

                <input
                  v-else-if="field.type === 'number'"
                  v-model.number="formValues[field.key] as number"
                  type="number"
                  class="rs-input w-full"
                >

                <label
                  v-else-if="field.type === 'checkbox'"
                  class="flex items-center gap-2.5 cursor-pointer rs-body text-base"
                  style="color: var(--rs-text-muted);"
                >
                  <input
                    v-model="formValues[field.key] as boolean"
                    type="checkbox"
                    class="rs-checkbox"
                  >
                  {{ field.label }}
                </label>
              </div>
            </template>

            <RetroCard v-if="formError" color="red" static class="px-3 py-2">
              <p class="rs-body text-sm rs-glow-red">⚠ {{ formError }}</p>
            </RetroCard>

            <div class="flex justify-end gap-2 pt-1">
              <RetroButton
                color="neutral"
                variant="ghost"
                size="md"
                @click="modelOpen = false"
              >
                Cancelar
              </RetroButton>
              <RetroButton
                type="submit"
                color="pink"
                variant="solid"
                size="md"
                icon="i-lucide-send"
              >
                Enviar
              </RetroButton>
            </div>
          </form>
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

/* Inputs */
.rs-input {
  font-family: var(--rs-font-body);
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  padding: 0.6rem 0.85rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--rs-border);
  color: var(--rs-text);
  transition: border-color 150ms, box-shadow 150ms;
  outline: none;
}

.rs-input::placeholder { color: var(--rs-text-dim); }

.rs-input:focus {
  border-color: var(--rs-cyan);
  box-shadow: 0 0 0 1px var(--rs-cyan), 0 0 16px color-mix(in srgb, var(--rs-cyan) 25%, transparent);
}

.rs-input:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--rs-cyan) 40%, var(--rs-border));
}

select.rs-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300f5ff' viewBox='0 0 16 16'%3E%3Cpath d='M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem center;
  padding-right: 2rem;
  appearance: none;
}

.rs-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid var(--rs-border);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  position: relative;
  transition: all 150ms;
}

.rs-checkbox:checked {
  border-color: var(--rs-pink);
  background: var(--rs-pink);
  box-shadow: 0 0 8px color-mix(in srgb, var(--rs-pink) 50%, transparent);
}

.rs-checkbox:checked::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rs-bg);
  font-size: 0.85rem;
  font-weight: bold;
}
</style>
