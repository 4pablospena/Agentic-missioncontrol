import { randomUUID } from 'node:crypto'
import type { Agent } from '~/models/agent'
import type {
  AgentCommandResult,
  OpenClawBridge,
  OpenClawHealth,
  SendAgentCommandPayload,
} from '~/models/openclaw'
import { createLogEntry } from './logger.server'

/**
 * Mock agents matching the team's character roster.
 * Names are matched case-insensitively against `AGENT_PROFILES.nameMatch`
 * in `config/agent-profiles.ts` to get neon colors, icons, etc.
 */
const MOCK_AGENTS: Agent[] = [
  {
    id: 'sarbina',
    name: 'Sarbina (Sales)',
    status: 'idle',
    model: 'claude-sonnet-4',
    tokenUsage: 24_500,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'mark',
    name: 'Mark (Marketing)',
    status: 'running',
    model: 'claude-sonnet-4',
    currentAction: 'Analizando tendencias de LinkedIn',
    tokenUsage: 18_300,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'odinn',
    name: 'Odínn (CRM)',
    status: 'idle',
    model: 'claude-haiku-4',
    tokenUsage: 9_120,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'enzo',
    name: 'Enzo (Engineering)',
    status: 'running',
    model: 'claude-sonnet-4',
    currentAction: 'Revisando PRs abiertos',
    tokenUsage: 32_100,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'penelope',
    name: 'Penelope (People)',
    status: 'idle',
    model: 'claude-haiku-4',
    tokenUsage: 4_200,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'destin',
    name: 'Destin (Design)',
    status: 'offline',
    model: 'claude-sonnet-4',
    tokenUsage: 0,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
]

export function createMockOpenClawBridge(): OpenClawBridge {
  return {
    async health(): Promise<OpenClawHealth> {
      return {
        bridgeMode: 'mock',
        message: 'Mock bridge: install OpenClaw Gateway and set OPENCLAW_BRIDGE_MODE=gateway',
      }
    },
    async listAgents(): Promise<Agent[]> {
      return MOCK_AGENTS.map(a => ({ ...a, lastSeenAt: new Date().toISOString() }))
    },
    async getAgent(agentId: string): Promise<Agent | null> {
      const hit = MOCK_AGENTS.find(a => a.id === agentId)
      return hit ? { ...hit } : null
    },
    async sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult> {
      const commandId = randomUUID()
      await createLogEntry({
        agentId,
        level: 'info',
        message: `command.${payload.command}`,
        metadata: { commandId, input: payload.input },
      })

      if (payload.command === 'chat.message') {
        const input = payload.input as {
          content?: string
          contextSnippets?: string[]
          recentMessages?: Array<{ role?: string, content?: string }>
        } | undefined
        const content = String(input?.content ?? '')
        const snippets = Array.isArray(input?.contextSnippets) ? input.contextSnippets.length : 0
        const turns = Array.isArray(input?.recentMessages) ? input.recentMessages.length : 0
        const response
          = `[mock assistant · ${agentId}] «${content.slice(0, 400)}${content.length > 400 ? '…' : ''}»`
          + ` · context snippets: ${snippets} · recent turns: ${turns}`

        return {
          commandId,
          agentId,
          command: payload.command,
          ok: true,
          message: 'Mock bridge chat reply',
          detail: { response, payload },
        }
      }

      return {
        commandId,
        agentId,
        command: payload.command,
        ok: true,
        message: 'Mock bridge acknowledged command',
        detail: { payload },
      }
    },
  }
}
