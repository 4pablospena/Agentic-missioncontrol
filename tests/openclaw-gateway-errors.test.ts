import { describe, expect, it } from 'vitest'
import { gatewayConnectionToHttpError } from '../server/utils/openclaw-gateway-errors'

describe('openclaw-gateway-errors', () => {
  it('maps ECONNREFUSED by errno code', () => {
    const cause = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:18789'), {
      code: 'ECONNREFUSED',
    })
    const err = gatewayConnectionToHttpError(cause)
    expect(err.statusCode).toBe(503)
    expect(err.statusMessage).toContain('connection refused')
    expect(err.statusMessage).toContain('OPENCLAW_GATEWAY_WS')
    expect(err.data).toEqual({ reason: 'ECONNREFUSED' })
  })

  it('maps ECONNREFUSED by message when code missing', () => {
    const err = gatewayConnectionToHttpError(new Error('connect ECONNREFUSED 127.0.0.1:18789'))
    expect(err.statusCode).toBe(503)
    expect(err.data).toEqual({ reason: 'ECONNREFUSED' })
  })

  it('maps ENOTFOUND', () => {
    const cause = Object.assign(new Error('getaddrinfo ENOTFOUND claw.example'), {
      code: 'ENOTFOUND',
    })
    const err = gatewayConnectionToHttpError(cause)
    expect(err.statusCode).toBe(503)
    expect(err.data).toEqual({ reason: 'ENOTFOUND' })
  })

  it('maps ETIMEDOUT', () => {
    const cause = Object.assign(new Error('connect ETIMEDOUT'), { code: 'ETIMEDOUT' })
    const err = gatewayConnectionToHttpError(cause)
    expect(err.statusCode).toBe(503)
    expect(err.data).toEqual({ reason: 'ETIMEDOUT' })
  })

  it('maps EHOSTUNREACH', () => {
    const cause = Object.assign(new Error('connect EHOSTUNREACH'), { code: 'EHOSTUNREACH' })
    const err = gatewayConnectionToHttpError(cause)
    expect(err.statusCode).toBe(503)
    expect(err.data).toEqual({ reason: 'EHOSTUNREACH' })
  })

  it('falls back to UNKNOWN with original message', () => {
    const err = gatewayConnectionToHttpError(new Error('handshake rejected'))
    expect(err.statusCode).toBe(503)
    expect(err.statusMessage).toBe('handshake rejected')
    expect(err.data).toEqual({ reason: 'UNKNOWN' })
  })
})
