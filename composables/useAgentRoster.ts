import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { AGENT_PROFILES, getProfileForAgent, type AgentProfile } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'

export const OFFLINE_KEY_PREFIX = 'offline-'

export type AgentRosterKind = 'online' | 'unknown' | 'offline'

export interface AgentRosterItem {
  agentKey: string
  label: string
  kind: AgentRosterKind
  agent?: AgentSummary
  profile?: AgentProfile
}

export function offlineProfileAgentKey(nameMatch: string): string {
  return `${OFFLINE_KEY_PREFIX}${nameMatch}`
}

/** Roster order: profile-matched agents → unknown → offline-only profiles (same as legacy agents page). */
export function buildAgentRoster(agents: readonly AgentSummary[]): AgentRosterItem[] {
  const panels = agents
    .map(agent => ({ agent, profile: getProfileForAgent(agent.name) }))
    .filter((p): p is { agent: AgentSummary, profile: AgentProfile } => !!p.profile)

  const unknownAgents = agents.filter(a => !getProfileForAgent(a.name))

  const offlineProfiles = AGENT_PROFILES.filter(p =>
    !agents.some(a => a.name.toLowerCase().includes(p.nameMatch.toLowerCase())),
  )

  const online: AgentRosterItem[] = panels.map(({ agent, profile }) => ({
    agentKey: agent.id,
    label: profile.displayName,
    kind: 'online',
    agent,
    profile,
  }))

  const unknown: AgentRosterItem[] = unknownAgents.map(agent => ({
    agentKey: agent.id,
    label: agent.name,
    kind: 'unknown',
    agent,
  }))

  const offline: AgentRosterItem[] = offlineProfiles.map(profile => ({
    agentKey: offlineProfileAgentKey(profile.nameMatch),
    label: profile.displayName,
    kind: 'offline',
    profile,
  }))

  return [...online, ...unknown, ...offline]
}

export function useAgentRosterList(agents: MaybeRefOrGetter<readonly AgentSummary[]>) {
  return computed(() => buildAgentRoster(toValue(agents)))
}
