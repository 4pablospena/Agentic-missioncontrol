import { randomUUID } from 'node:crypto'
import type { Agent } from '~/models/agent'
import type {
  AgentCommandResult,
  OpenClawBridge,
  OpenClawHealth,
  SendAgentCommandPayload,
} from '~/models/openclaw'
import { createLogEntry } from './logger.server'

const MOCK_AGENTS: Agent[] = [
  {
    id: 'main',
    name: 'Main agent',
    status: 'idle',
    model: 'mock/model',
    currentAction: undefined,
    tokenUsage: 0,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'ops',
    name: 'Ops agent',
    status: 'running',
    model: 'mock/model',
    currentAction: 'polling queue',
    tokenUsage: 1200,
    lastSeenAt: new Date().toISOString(),
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
