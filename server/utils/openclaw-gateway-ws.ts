import WebSocket from 'ws'
import { createError } from 'h3'
import { gatewayConnectionToHttpError } from './openclaw-gateway-errors'

export interface OpenClawWsGatewayOptions {
  wsUrl: string
  token?: string
}

interface WSMessage {
  type?: string
  id?: string | number
  method?: string
  params?: Record<string, unknown>
  ok?: boolean
  payload?: unknown
  error?: unknown
  event?: string
}

/**
 * Derives WebSocket and HTTP origins from env.
 * At least one of `gatewayWs` or `gatewayHttp` must be non-empty.
 */
export function resolveGatewayEndpoints(input: {
  gatewayWs: string
  gatewayHttp: string
}): { wsUrl: string, httpBase: string } | null {
  const wsTrim = input.gatewayWs.trim().replace(/\/$/, '')
  const httpTrim = input.gatewayHttp.trim().replace(/\/$/, '')

  let wsUrl = wsTrim
  if (!wsUrl && httpTrim) {
    if (httpTrim.startsWith('https://'))
      wsUrl = `wss://${httpTrim.slice('https://'.length)}`
    else if (httpTrim.startsWith('http://'))
      wsUrl = `ws://${httpTrim.slice('http://'.length)}`
  }

  let httpBase = httpTrim
  if (!httpBase && wsUrl) {
    if (wsUrl.startsWith('wss://'))
      httpBase = `https://${wsUrl.slice('wss://'.length)}`
    else if (wsUrl.startsWith('ws://'))
      httpBase = `http://${wsUrl.slice('ws://'.length)}`
    else
      httpBase = wsUrl
  }

  if (!wsUrl)
    return null
  return { wsUrl, httpBase: httpBase || '' }
}

/** Control-plane WebSocket client (OpenClaw gateway protocol v3). */
export class OpenClawWsGateway {
  private ws: WebSocket | null = null
  private readonly pending = new Map<string, { resolve: (v: unknown) => void, reject: (e: unknown) => void }>()
  private requestSeq = 0
  private connectMutex: Promise<void> | null = null
  private handshakeOk = false

  constructor(private readonly options: OpenClawWsGatewayOptions) {}

  private handshakeParams(): Record<string, unknown> {
    const token = this.options.token?.trim()
    return {
      minProtocol: 3,
      maxProtocol: 3,
      client: {
        id: 'mission-control',
        version: '1.0.0',
        platform: 'node',
        mode: 'operator',
      },
      role: 'operator',
      scopes: ['operator.read', 'operator.write'],
      auth: token ? { token } : {},
      locale: 'es-ES',
      userAgent: 'mission-control/1.0.0',
    }
  }

  private normalizeRejectError(error: unknown): Error | ReturnType<typeof createError> {
    if (error && typeof error === 'object' && 'statusCode' in error)
      return error as ReturnType<typeof createError>
    if (typeof error === 'string')
      return createError({ statusCode: 502, statusMessage: error })
    if (error && typeof error === 'object' && 'message' in error) {
      const m = String((error as { message: unknown }).message)
      return createError({ statusCode: 502, statusMessage: m || 'OpenClaw gateway error', data: error })
    }
    return createError({ statusCode: 502, statusMessage: 'OpenClaw gateway error', data: error })
  }

  private handleIncoming(data: WebSocket.RawData): void {
    const raw = typeof data === 'string' ? data : data.toString()
    let msg: WSMessage
    try {
      msg = JSON.parse(raw) as WSMessage
    }
    catch {
      return
    }
    if (msg.type === 'event')
      return
    if (msg.type !== 'res' || msg.id == null)
      return
    const id = String(msg.id)
    const p = this.pending.get(id)
    if (!p)
      return
    this.pending.delete(id)
    if (msg.ok)
      p.resolve(msg.payload)
    else
      p.reject(this.normalizeRejectError(msg.error))
  }

  private rejectAllPending(reason: unknown): void {
    for (const [, p] of this.pending)
      p.reject(reason)
    this.pending.clear()
  }

  private cleanupSocket(): void {
    this.handshakeOk = false
    if (this.ws) {
      this.ws.removeAllListeners()
      try {
        this.ws.close()
      }
      catch {
        /* ignore */
      }
      this.ws = null
    }
  }

  private onSocketClosed(): void {
    this.handshakeOk = false
    this.rejectAllPending(
      createError({ statusCode: 503, statusMessage: 'OpenClaw gateway WebSocket closed' }),
    )
    this.ws = null
  }

  private async openSocket(): Promise<void> {
    this.cleanupSocket()
    const socket = new WebSocket(this.options.wsUrl)
    this.ws = socket

    try {
      await new Promise<void>((resolve, reject) => {
        socket.once('open', () => resolve())
        socket.once('error', reject)
      })

      socket.on('message', d => this.handleIncoming(d))
      socket.on('close', () => this.onSocketClosed())

      await this.sendRequestInternal('connect', this.handshakeParams())
      this.handshakeOk = true
    }
    catch (e) {
      this.cleanupSocket()
      throw gatewayConnectionToHttpError(e)
    }
  }

  async ensureConnected(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this.handshakeOk)
      return
    if (!this.connectMutex) {
      this.connectMutex = this.openSocket().finally(() => {
        this.connectMutex = null
      })
    }
    await this.connectMutex
  }

  private sendRequestInternal(method: string, params: Record<string, unknown>): Promise<unknown> {
    const sock = this.ws
    if (!sock || sock.readyState !== WebSocket.OPEN) {
      return Promise.reject(
        createError({ statusCode: 503, statusMessage: 'OpenClaw gateway WebSocket not open' }),
      )
    }

    const id = `${++this.requestSeq}`
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      sock.send(JSON.stringify({ type: 'req', id, method, params }))
      setTimeout(() => {
        if (!this.pending.has(id))
          return
        this.pending.delete(id)
        reject(createError({ statusCode: 504, statusMessage: `OpenClaw gateway timeout: ${method}` }))
      }, 30_000)
    })
  }

  async request(method: string, params: Record<string, unknown>): Promise<unknown> {
    await this.ensureConnected()
    return this.sendRequestInternal(method, params)
  }

  disconnect(): void {
    this.rejectAllPending(
      createError({ statusCode: 503, statusMessage: 'OpenClaw gateway disconnected by client' }),
    )
    this.cleanupSocket()
  }
}
