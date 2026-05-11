import { describe, expect, it } from 'vitest'
import { AGENT_PROFILES } from '~/config/agent-profiles'
import type { AgentSummary } from '~/models/agent'
import {
  buildAgentRoster,
  offlineProfileAgentKey,
  OFFLINE_KEY_PREFIX,
} from '~/composables/useAgentRoster'

function summary(p: Partial<AgentSummary> & Pick<AgentSummary, 'id' | 'name'>): AgentSummary {
  return {
    status: 'idle',
    model: '',
    tokenUsage: 0,
    lastSeenAt: '',
    ...p,
  }
}

describe('buildAgentRoster', () => {
  it('orders online (profile match) then unknown then offline-only profiles', () => {
    const agents: AgentSummary[] = [
      summary({ id: 'agent-z', name: 'zeta-no-profile' }),
      summary({ id: 'agent-s', name: 'openclaw-sales-east' }),
    ]
    const roster = buildAgentRoster(agents)
    expect(roster[0]?.kind).toBe('online')
    expect(roster[0]?.agentKey).toBe('agent-s')
    expect(roster[0]?.label).toBe('SARBINA')
    expect(roster[1]?.kind).toBe('unknown')
    expect(roster[1]?.agentKey).toBe('agent-z')
    expect(roster[1]?.label).toBe('zeta-no-profile')
    const offlineKeys = roster.filter(r => r.kind === 'offline').map(r => r.agentKey)
    expect(offlineKeys).toContain(offlineProfileAgentKey('marketing'))
    expect(offlineKeys).not.toContain(offlineProfileAgentKey('sales'))
  })

  it('uses agent id as key for online and unknown rows', () => {
    const agents: AgentSummary[] = [
      summary({ id: 'id/with:chars', name: 'crm-helper' }),
    ]
    const roster = buildAgentRoster(agents)
    expect(roster.find(r => r.kind === 'online')?.agentKey).toBe('id/with:chars')
  })

  it('uses offline- prefix keys for profiles without a connected agent', () => {
    const roster = buildAgentRoster([])
    const sales = AGENT_PROFILES.find(p => p.nameMatch === 'sales')
    expect(sales).toBeTruthy()
    const row = roster.find(r => r.profile?.nameMatch === 'sales')
    expect(row?.agentKey).toBe(`${OFFLINE_KEY_PREFIX}sales`)
    expect(row?.agentKey).toBe(offlineProfileAgentKey('sales'))
  })
})
