import { getProfileForAgent, AGENT_PROFILES } from '~/config/agent-profiles'
import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import type { AgentTask, CreateTaskPayload, TaskStatus } from '~/models/task'
import type { ComputedRef, Ref } from 'vue'

export type TaskStatusColor = 'pink' | 'cyan' | 'purple' | 'yellow' | 'green' | 'red' | 'neutral'

export function taskStatusColor(status: string): TaskStatusColor {
  const map: Record<string, TaskStatusColor> = {
    queued: 'neutral',
    running: 'yellow',
    completed: 'green',
    failed: 'red',
    cancelled: 'neutral',
    scheduled: 'cyan',
  }
  return map[status] ?? 'neutral'
}

export function taskStatusLabel(status: string) {
  const map: Record<string, string> = {
    queued: 'En cola',
    running: 'En curso',
    completed: 'Hecha',
    failed: 'Fallida',
    cancelled: 'Cancel.',
    scheduled: 'Prog.',
  }
  return map[status] ?? status
}

export function formatTaskTime(dateStr: string) {
  if (!dateStr)
    return ''
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function useOverviewDashboard(
  agents: Ref<AgentSummary[]>,
  tasksByStatus: ComputedRef<Partial<Record<TaskStatus, AgentTask[]>>>,
  createTask: (payload: CreateTaskPayload) => Promise<unknown>,
  loadTasks: () => Promise<unknown>,
  toast: ReturnType<typeof useToast>,
) {
  const loadingAgentId = ref<string | null>(null)

  const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 13)
      return 'Buenos días'
    if (h < 20)
      return 'Buenas tardes'
    return 'Buenas noches'
  })

  const agentPanels = computed(() =>
    agents.value
      .map(agent => ({ agent, profile: getProfileForAgent(agent.name) }))
      .filter((p): p is { agent: AgentSummary, profile: AgentProfile } => !!p.profile),
  )

  const onlineCount = computed(() =>
    agentPanels.value.filter(p => p.agent.status === 'idle' || p.agent.status === 'running').length,
  )

  const activeTasks = computed(
    () => (tasksByStatus.value.running?.length ?? 0) + (tasksByStatus.value.queued?.length ?? 0),
  )

  const recentTasks = computed(() => {
    const all = [
      ...(tasksByStatus.value.running ?? []),
      ...(tasksByStatus.value.queued ?? []),
      ...(tasksByStatus.value.completed ?? []),
      ...(tasksByStatus.value.failed ?? []),
    ]
    return all.slice(0, 5)
  })

  const offlineProfiles = computed(() =>
    AGENT_PROFILES.filter(p =>
      !agents.value.some(a => a.name.toLowerCase().includes(p.nameMatch.toLowerCase())),
    ),
  )

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
      toast.add({
        title: `${profile.displayName} desplegada`,
        description: profile.quickActionLabel,
        color: 'success',
      })
      await loadTasks()
    }
    catch {
      toast.add({ title: 'Error al desplegar', color: 'error' })
    }
    finally {
      loadingAgentId.value = null
    }
  }

  return {
    greeting,
    agentPanels,
    onlineCount,
    activeTasks,
    recentTasks,
    offlineProfiles,
    deploy,
    loadingAgentId,
    taskStatusColor,
    taskStatusLabel,
    formatTaskTime,
  }
}
