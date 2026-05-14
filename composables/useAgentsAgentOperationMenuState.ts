import type { AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'

export type AgentsAgentOperationMenuMode = 'online' | 'unknown' | 'offline'

type RetroColor = 'pink' | 'cyan' | 'purple' | 'indigo' | 'yellow' | 'orange' | 'green' | 'red' | 'neutral'

export function useAgentsAgentOperationMenuState(
  props: ToRefs<{
    mode: AgentsAgentOperationMenuMode
    agent?: AgentSummary
    profile?: AgentProfile
  }>,
) {
  const cardColor = computed<RetroColor>(() => {
    if (!props.profile?.value)
      return props.mode.value === 'unknown' ? 'cyan' : 'neutral'
    const map: Record<string, RetroColor> = {
      success: 'green',
      info: 'cyan',
      secondary: 'purple',
      warning: 'yellow',
      error: 'orange',
    }
    return map[props.profile.value.twColor] ?? 'indigo'
  })

  const statusLabel = computed(() => {
    const map: Record<string, string> = {
      idle: 'Disponible',
      running: 'En misión',
      error: 'Error',
      offline: 'Offline',
    }
    return map[props.agent?.value?.status ?? ''] ?? '—'
  })

  const statusBadgeColor = computed<RetroColor>(() => {
    const map: Record<string, RetroColor> = {
      idle: 'green',
      running: 'yellow',
      error: 'red',
      offline: 'neutral',
    }
    return map[props.agent?.value?.status ?? ''] ?? 'neutral'
  })

  const logsHref = computed(() =>
    props.agent?.value
      ? `/logs?agentId=${encodeURIComponent(props.agent.value.id)}`
      : '/logs',
  )

  const chatHref = computed(() =>
    props.agent?.value
      ? `/chat?agentId=${encodeURIComponent(props.agent.value.id)}`
      : '/chat',
  )

  return {
    cardColor,
    statusLabel,
    statusBadgeColor,
    logsHref,
    chatHref,
  }
}
