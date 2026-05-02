import { createError } from 'h3'

/** Stable codes for API consumers (`statusMessage` remains human-readable). */
export type GatewayConnectionReason =
  | 'ECONNREFUSED'
  | 'ENOTFOUND'
  | 'ETIMEDOUT'
  | 'EHOSTUNREACH'
  | 'UNKNOWN'

function errnoCode(e: unknown): string | undefined {
  if (e && typeof e === 'object' && 'code' in e) {
    const c = (e as { code: unknown }).code
    if (typeof c === 'string')
      return c
  }
  return undefined
}

function messageIncludes(e: unknown, needle: string): boolean {
  const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : ''
  return msg.includes(needle)
}

/** Maps WebSocket / TCP connect failures to a 503 with actionable messaging. */
export function gatewayConnectionToHttpError(cause: unknown): ReturnType<typeof createError> {
  const code = errnoCode(cause)

  if (code === 'ECONNREFUSED' || messageIncludes(cause, 'ECONNREFUSED')) {
    return createError({
      statusCode: 503,
      statusMessage:
        'OpenClaw gateway unreachable (connection refused). Start the gateway or fix OPENCLAW_GATEWAY_WS / OPENCLAW_GATEWAY_URL in .env, then restart Nuxt.',
      data: { reason: 'ECONNREFUSED' satisfies GatewayConnectionReason },
    })
  }

  if (code === 'ENOTFOUND' || messageIncludes(cause, 'ENOTFOUND')) {
    return createError({
      statusCode: 503,
      statusMessage:
        'OpenClaw gateway host not found (ENOTFOUND). Check OPENCLAW_GATEWAY_WS / OPENCLAW_GATEWAY_URL.',
      data: { reason: 'ENOTFOUND' satisfies GatewayConnectionReason },
    })
  }

  if (code === 'ETIMEDOUT' || messageIncludes(cause, 'ETIMEDOUT')) {
    return createError({
      statusCode: 503,
      statusMessage:
        'OpenClaw gateway connection timed out (ETIMEDOUT). Verify the gateway is running and reachable.',
      data: { reason: 'ETIMEDOUT' satisfies GatewayConnectionReason },
    })
  }

  if (code === 'EHOSTUNREACH' || messageIncludes(cause, 'EHOSTUNREACH')) {
    return createError({
      statusCode: 503,
      statusMessage:
        'OpenClaw gateway host unreachable (EHOSTUNREACH). Check network and OPENCLAW_GATEWAY_WS / OPENCLAW_GATEWAY_URL.',
      data: { reason: 'EHOSTUNREACH' satisfies GatewayConnectionReason },
    })
  }

  const msg = cause instanceof Error ? cause.message : 'OpenClaw gateway connect failed'
  return createError({
    statusCode: 503,
    statusMessage: msg,
    data: { reason: 'UNKNOWN' satisfies GatewayConnectionReason },
  })
}
