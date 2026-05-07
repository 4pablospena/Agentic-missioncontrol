import { normalizeAgentsListResult } from './openclaw-gateway-jsonrpc'

/** GET probadas (OpenClaw/issue docs varían entre builds). */
const AGENTS_GET_PATHS = [
  '/api/agents',
  '/agents',
  '/api/v1/agents',
  '/v1/agents',
  '/gateway/agents',
  '/openclaw/agents',
] as const

/** POST JSON-RPC / wire-style (PR HTTP RPC). */
const AGENTS_POST_PATHS = ['/rpc', '/api/rpc', '/gateway/rpc', '/v1/rpc'] as const

export function isMissingScopeGatewayError(e: unknown): boolean {
  let msg = ''
  if (e && typeof e === 'object' && 'statusMessage' in e)
    msg = String((e as { statusMessage: unknown }).statusMessage)
  else if (e instanceof Error)
    msg = e.message
  return msg.toLowerCase().includes('missing scope')
}

function agentsFromUnknownJson(body: unknown): Agent[] | null {
  if (body == null)
    return null
  if (typeof body !== 'object')
    return normalizeAgentsListResult(body)

  const o = body as Record<string, unknown>

  if (o.error !== undefined && o.result === undefined)
    return null

  if (o.result !== undefined)
    return normalizeAgentsListResult(o.result)

  if (o.type === 'res') {
    if (o.ok === true && 'payload' in o)
      return normalizeAgentsListResult(o.payload)
    return null
  }

  return normalizeAgentsListResult(body)
}

async function postAgentsList(
  url: string,
  headers: Record<string, string>,
  jsonBody: Record<string, unknown>,
): Promise<Agent[] | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonBody),
    })
    if (!res.ok)
      return null
    const body = await res.json() as unknown
    return agentsFromUnknownJson(body)
  }
  catch {
    return null
  }
}

/**
 * Lista agentes por HTTP cuando WS falla por scopes (Serve→localhost, etc.).
 */
export async function fetchAgentsListViaHttp(options: {
  httpBase: string
  headers: Record<string, string>
}): Promise<Agent[] | null> {
  const base = options.httpBase.replace(/\/$/, '').trim()
  if (!base)
    return null

  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  for (const path of AGENTS_GET_PATHS) {
    try {
      const res = await fetch(`${base}${path}`, { headers })
      if (!res.ok)
        continue
      try {
        const json = await res.json() as unknown
        const agents = agentsFromUnknownJson(json)
        if (agents !== null)
          return agents
      }
      catch {
        continue
      }
    }
    catch {
      /* siguiente */
    }
  }

  const jsonRpcBody = {
    jsonrpc: '2.0',
    id: 'mission-control-agents-list',
    method: 'agents.list',
    params: {},
  }
  const wireBody = {
    type: 'req',
    id: 'mission-control-agents-list',
    method: 'agents.list',
    params: {},
  }

  for (const path of AGENTS_POST_PATHS) {
    const url = `${base}${path}`
    let got = await postAgentsList(url, headers, jsonRpcBody)
    if (got !== null)
      return got
    got = await postAgentsList(url, headers, wireBody)
    if (got !== null)
      return got
  }

  return null
}
