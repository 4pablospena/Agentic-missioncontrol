import { describe, expect, it } from 'vitest'
import { isMissingScopeGatewayError } from '../server/utils/openclaw-gateway-http-agents'

describe('openclaw-gateway-http-agents', () => {
  it('isMissingScopeGatewayError detects missing scope messages', () => {
    expect(isMissingScopeGatewayError(new Error('missing scope: operator.read'))).toBe(true)
    expect(isMissingScopeGatewayError({ statusMessage: 'missing scope: operator.read' })).toBe(true)
    expect(isMissingScopeGatewayError(new Error('ECONNREFUSED'))).toBe(false)
  })
})
