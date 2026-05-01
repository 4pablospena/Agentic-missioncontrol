import type { Agent } from '~/models/agent'
import type {
  AgentCommandResult,
  OpenClawBridge,
  OpenClawHealth,
  SendAgentCommandPayload,
} from '~/models/openclaw'
import { createLogEntry } from './logger.server'

export interface GatewayBridgeOptions {
  baseUrl: string
  token: string
}

export function createGatewayOpenClawBridge(options: GatewayBridgeOptions): OpenClawBridge {
  const base = options.baseUrl.replace(/\/$/, '')

  const headers: HeadersInit = {
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  }

  return {
    async health(): Promise<OpenClawHealth> {
      try {
        const res = await fetch(`${base}/health`, { headers })
        return {
          bridgeMode: 'gateway',
          gatewayReachable: res.ok,
          gatewayStatus: res.status,
          message: res.ok ? 'Gateway responded' : `HTTP ${res.status}`,
        }
      }
      catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown error'
        return {
          bridgeMode: 'gateway',
          gatewayReachable: false,
          message: msg,
        }
      }
    },

    async listAgents(): Promise<Agent[]> {
      await createLogEntry({
        level: 'warn',
        message: 'gateway.listAgents not implemented: use mock or extend bridge',
        metadata: { baseUrl: base },
      })
      throw createError({
        statusCode: 501,
        statusMessage: 'Gateway bridge listing not wired yet',
      })
    },

    async getAgent(agentId: string): Promise<Agent | null> {
      await createLogEntry({
        level: 'warn',
        message: 'gateway.getAgent not implemented',
        metadata: { agentId },
      })
      throw createError({
        statusCode: 501,
        statusMessage: 'Gateway bridge getAgent not wired yet',
      })
    },

    async sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult> {
      await createLogEntry({
        agentId,
        level: 'info',
        message: `gateway.command.${payload.command}`,
        metadata: { agentId, payload },
      })
      throw createError({
        statusCode: 501,
        statusMessage: 'Gateway command execution not wired yet (see ADR: POST /v1/responses or tools invoke)',
      })
    },
  }
}
