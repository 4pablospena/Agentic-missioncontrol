import { randomUUID } from 'node:crypto'
import type { Agent } from '~/models/agent'
import type {
  AgentCommandResult,
  OpenClawBridge,
  OpenClawHealth,
  SendAgentCommandPayload,
} from '~/models/openclaw'
import {
  extractChatAssistantText,
  normalizeAgentsListResult,
} from '../utils/openclaw-gateway-jsonrpc'
import {
  fetchAgentsListViaHttp,
  isMissingScopeGatewayError,
} from '../utils/openclaw-gateway-http-agents'
import { OpenClawWsGateway } from '../utils/openclaw-gateway-ws'
import { createLogEntry } from './logger.server'

export interface GatewayBridgeOptions {
  wsUrl: string
  /** HTTP origin for dashboard / health (same host as gateway). */
  httpBase: string
  token?: string
  clientId?: string
  clientMode?: string
  connectRole?: string
  connectScopes?: string[]
  omitConnectScopes?: boolean
  wsBearerOnUpgrade?: boolean
}

let sharedWsGateway: OpenClawWsGateway | null = null
let sharedWsKey = ''

function getSharedWsGateway(opts: {
  wsUrl: string
  token?: string
  clientId?: string
  clientMode?: string
  connectRole?: string
  connectScopes?: string[]
  omitConnectScopes?: boolean
  wsBearerOnUpgrade?: boolean
}): OpenClawWsGateway {
  const scopeKey = opts.connectScopes?.join('\x01') ?? ''
  const omitKey = opts.omitConnectScopes ? '1' : '0'
  const bearerKey = opts.wsBearerOnUpgrade ? '1' : '0'
  const key = `${opts.wsUrl}\0${opts.token ?? ''}\0${opts.clientId ?? ''}\0${opts.clientMode ?? ''}\0${opts.connectRole ?? ''}\0${scopeKey}\0${omitKey}\0${bearerKey}`
  if (sharedWsGateway && sharedWsKey === key)
    return sharedWsGateway
  sharedWsGateway?.disconnect()
  sharedWsGateway = new OpenClawWsGateway(opts)
  sharedWsKey = key
  return sharedWsGateway
}

function authHeaders(token?: string): Record<string, string> {
  const t = token?.trim()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export function createGatewayOpenClawBridge(options: GatewayBridgeOptions): OpenClawBridge {
  const httpBase = options.httpBase.replace(/\/$/, '').trim()
  const ws = getSharedWsGateway({
    wsUrl: options.wsUrl,
    token: options.token,
    clientId: options.clientId,
    clientMode: options.clientMode,
    connectRole: options.connectRole,
    connectScopes: options.connectScopes,
    omitConnectScopes: options.omitConnectScopes,
    wsBearerOnUpgrade: options.wsBearerOnUpgrade,
  })
  const auth = authHeaders(options.token)

  async function listAgentsRpc(): Promise<Agent[]> {
    try {
      const result = await ws.request('agents.list', {})
      const agents = normalizeAgentsListResult(result)
      await createLogEntry({
        level: 'info',
        message: 'gateway.agents.list',
        metadata: { count: agents.length, wsUrl: options.wsUrl, via: 'ws' },
      })
      return agents
    }
    catch (e) {
      if (!httpBase || !isMissingScopeGatewayError(e))
        throw e
      const viaHttp = await fetchAgentsListViaHttp({ httpBase, headers: auth })
      if (viaHttp === null)
        throw e
      await createLogEntry({
        level: 'warn',
        message: 'gateway.agents.list.ws_missing_scope_http_fallback',
        metadata: { wsUrl: options.wsUrl, httpBase },
      })
      await createLogEntry({
        level: 'info',
        message: 'gateway.agents.list',
        metadata: { count: viaHttp.length, via: 'http' },
      })
      return viaHttp
    }
  }

  return {
    async health(): Promise<OpenClawHealth> {
      if (!httpBase) {
        try {
          await ws.ensureConnected()
          return {
            bridgeMode: 'gateway',
            gatewayReachable: true,
            message: 'Gateway WebSocket connected',
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
      }
      try {
        const res = await fetch(`${httpBase}/health`, { headers: auth })
        if (res.ok) {
          return {
            bridgeMode: 'gateway',
            gatewayReachable: true,
            gatewayStatus: res.status,
            message: 'Gateway health endpoint responded',
          }
        }
      }
      catch {
        /* try root */
      }
      try {
        const res = await fetch(`${httpBase}/`, { headers: auth, redirect: 'manual' })
        const ok = res.ok || res.status === 302 || res.status === 301
        return {
          bridgeMode: 'gateway',
          gatewayReachable: ok,
          gatewayStatus: res.status,
          message: ok ? 'Gateway root responded' : `HTTP ${res.status}`,
        }
      }
      catch {
        /* fallback: WS only */
      }
      try {
        await ws.ensureConnected()
        return {
          bridgeMode: 'gateway',
          gatewayReachable: true,
          message: 'Gateway WebSocket connected (HTTP health unavailable)',
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
      return listAgentsRpc()
    },

    async getAgent(agentId: string): Promise<Agent | null> {
      const id = agentId.trim()
      if (!id)
        return null
      try {
        const single = await ws.request('agents.get', { agentId: id })
        const candidates = normalizeAgentsListResult(single)
        const hit = candidates.find(a => a.id === id)
        if (hit)
          return hit
      }
      catch {
        /* agents.get optional — fallback to list */
      }
      const agents = await listAgentsRpc()
      return agents.find(a => a.id === id) ?? null
    },

    async sendCommand(agentId: string, payload: SendAgentCommandPayload): Promise<AgentCommandResult> {
      const commandId = randomUUID()
      const aid = agentId.trim()

      await createLogEntry({
        agentId: aid,
        level: 'info',
        message: `gateway.command.${payload.command}`,
        metadata: { commandId, input: payload.input },
      })

      if (payload.command === 'chat.message') {
        const input = payload.input as Record<string, unknown> | undefined
        const message = String(input?.content ?? '').trim()
        if (!message) {
          return {
            commandId,
            agentId: aid,
            command: payload.command,
            ok: false,
            message: 'chat.message requires input.content',
          }
        }
        const sessionId = input?.sessionId ?? input?.conversationId
        const params: Record<string, unknown> = {
          agentId: aid,
          message,
        }
        if (sessionId != null && String(sessionId).trim())
          params.sessionId = String(sessionId).trim()
        if (Array.isArray(input?.contextSnippets))
          params.contextSnippets = input.contextSnippets
        if (Array.isArray(input?.recentMessages))
          params.recentMessages = input.recentMessages

        const result = await ws.request('chat.send', params)
        const responseText = extractChatAssistantText(result)

        return {
          commandId,
          agentId: aid,
          command: payload.command,
          ok: true,
          message: 'Gateway chat.send completed',
          detail: {
            response: responseText,
            rawResult: result,
          },
        }
      }

      const params: Record<string, unknown> = {
        agentId: aid,
        ...(payload.input ?? {}),
      }
      const method = payload.command as string
      const result = await ws.request(method, params)

      return {
        commandId,
        agentId: aid,
        command: payload.command,
        ok: true,
        message: `Gateway RPC ${method} completed`,
        detail: typeof result === 'object' && result !== null
          ? (result as Record<string, unknown>)
          : { result },
      }
    },
  }
}
