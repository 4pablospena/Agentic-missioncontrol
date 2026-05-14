import { TASK_TEMPLATES, getTemplatesForAgent, type TaskTemplate } from '~/config/task-templates'
import { getProfileForAgent } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import type { CreateTaskPayload } from '~/models/task'

export interface GuidedTaskAgentGroup {
  agentId: string
  agentName: string
  displayName: string
  templates: TaskTemplate[]
  neonColor: string
}

export function useGuidedTaskModal(
  props: ToRefs<{
    agents: AgentSummary[]
    open: boolean
    restrictToAgentId?: string | null
  }>,
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'submit', payload: CreateTaskPayload): void
    (e: 'clear-restrict'): void
  },
) {
  const step = ref<1 | 2>(1)
  const selectedTemplate = ref<TaskTemplate | null>(null)
  const formValues = ref<Record<string, unknown>>({})
  const formError = ref('')

  watch(
    () => props.open.value,
    (val) => {
      if (!val) {
        setTimeout(() => {
          step.value = 1
          selectedTemplate.value = null
          formValues.value = {}
          formError.value = ''
        }, 200)
      }
    },
  )

  const agentGroups = computed<GuidedTaskAgentGroup[]>(() => {
    const restrictId = (props.restrictToAgentId?.value ?? '').trim()

    const sourceAgents = restrictId
      ? props.agents.value.filter(a => a.id === restrictId)
      : props.agents.value

    if (props.agents.value.length === 0 && !restrictId) {
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

    if (restrictId && sourceAgents.length === 0)
      return []

    if (sourceAgents.length === 0)
      return []

    return sourceAgents
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

  const restrictedButEmpty = computed(
    () => !!(props.restrictToAgentId?.value ?? '').trim() && agentGroups.value.length === 0,
  )

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
    const tpl = selectedTemplate.value
    if (!tpl)
      return

    for (const field of tpl.fields) {
      if (field.required) {
        const val = formValues.value[field.key]
        if (val === undefined || val === null || val === '') {
          formError.value = `"${field.label}" es obligatorio`
          return
        }
      }
    }

    const agentId = String(formValues.value._agentId ?? '')
    const payload = tpl.toPayload(agentId, formValues.value)
    emit('submit', payload)
    emit('update:open', false)
  }

  const modelOpen = computed({
    get: () => props.open.value,
    set: (v: boolean) => emit('update:open', v),
  })

  return {
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
  }
}
