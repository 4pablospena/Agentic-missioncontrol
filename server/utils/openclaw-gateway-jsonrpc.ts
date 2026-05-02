import type { Agent, AgentStatus } from '~/models/agent'

export function mapGatewayStatus(raw: unknown): AgentStatus {
  const s = typeof raw === 'string' ? raw.toLowerCase() : ''
  if (s === 'running' || s === 'busy' || s === 'online')
    return 'running'
  if (s === 'error')
    return 'error'
  if (s === 'offline')
    return 'offline'
  if (s === 'idle')
    return 'idle'
  return 'idle'
}

export function normalizeAgentRecord(row: Record<string, unknown>): Agent | null {
  const id = String(row.id ?? row.agentId ?? '').trim()
  if (!id)
    return null
  const name = String(row.name ?? row.label ?? id).trim() || id
  const status = mapGatewayStatus(row.status ?? row.state)
  const model = row.model != null ? String(row.model) : undefined
  const currentAction = row.currentAction != null ? String(row.currentAction) : undefined
  const currentTaskId = row.currentTaskId != null ? String(row.currentTaskId) : undefined
  const tokenUsage = typeof row.tokenUsage === 'number' ? row.tokenUsage : undefined
  const lastSeenAt = row.lastSeenAt != null ? String(row.lastSeenAt) : undefined
  return {
    id,
    name,
    status,
    model,
    currentAction,
    currentTaskId,
    tokenUsage,
    lastSeenAt,
  }
}

/** Accepts result as Agent[], single Agent object, { agents: [] }, { items: [] }, etc. */
export function normalizeAgentsListResult(result: unknown): Agent[] {
  if (!result)
    return []
  if (Array.isArray(result)) {
    const out: Agent[] = []
    for (const item of result) {
      if (item && typeof item === 'object') {
        const a = normalizeAgentRecord(item as Record<string, unknown>)
        if (a)
          out.push(a)
      }
    }
    return out
  }
  if (typeof result === 'object') {
    const o = result as Record<string, unknown>
    if (o.id != null || o.agentId != null) {
      const one = normalizeAgentRecord(o)
      return one ? [one] : []
    }
    const nested = o.agents ?? o.items ?? o.data ?? o.results
    if (Array.isArray(nested))
      return normalizeAgentsListResult(nested)
  }
  return []
}

/** Extract assistant text from varied gateway chat payloads */
export function extractChatAssistantText(result: unknown): string {
  if (result == null)
    return ''
  if (typeof result === 'string')
    return result.trim()
  if (typeof result === 'object') {
    const o = result as Record<string, unknown>
    const candidates = [
      o.response,
      o.message,
      o.content,
      o.text,
      o.answer,
      typeof o.data === 'object' && o.data
        ? (o.data as Record<string, unknown>).message
        : undefined,
    ]
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim())
        return c.trim()
    }
  }
  return ''
}
