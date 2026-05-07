import { describe, expect, it } from 'vitest'
import { parseGatewayConnectScopes, resolveGatewayEndpoints } from '../server/utils/openclaw-gateway-ws'

describe('openclaw-gateway-ws', () => {
  it('resolveGatewayEndpoints derives ws from http', () => {
    expect(
      resolveGatewayEndpoints({ gatewayWs: '', gatewayHttp: 'http://127.0.0.1:18789' }),
    ).toEqual({ wsUrl: 'ws://127.0.0.1:18789', httpBase: 'http://127.0.0.1:18789' })
    expect(
      resolveGatewayEndpoints({ gatewayWs: '', gatewayHttp: 'https://gw.example/' }),
    ).toEqual({ wsUrl: 'wss://gw.example', httpBase: 'https://gw.example' })
  })

  it('resolveGatewayEndpoints derives http from ws', () => {
    expect(
      resolveGatewayEndpoints({ gatewayWs: 'ws://127.0.0.1:18789', gatewayHttp: '' }),
    ).toEqual({ wsUrl: 'ws://127.0.0.1:18789', httpBase: 'http://127.0.0.1:18789' })
    expect(
      resolveGatewayEndpoints({ gatewayWs: 'wss://gw.example/', gatewayHttp: '' }),
    ).toEqual({ wsUrl: 'wss://gw.example', httpBase: 'https://gw.example' })
  })

  it('resolveGatewayEndpoints prefers explicit ws when both set', () => {
    expect(
      resolveGatewayEndpoints({
        gatewayWs: 'ws://custom:9',
        gatewayHttp: 'http://127.0.0.1:18789',
      }),
    ).toEqual({ wsUrl: 'ws://custom:9', httpBase: 'http://127.0.0.1:18789' })
  })

  it('resolveGatewayEndpoints returns null when empty', () => {
    expect(resolveGatewayEndpoints({ gatewayWs: '', gatewayHttp: '' })).toBeNull()
    expect(resolveGatewayEndpoints({ gatewayWs: '   ', gatewayHttp: '' })).toBeNull()
  })

  it('parseGatewayConnectScopes parses comma list or returns undefined', () => {
    expect(parseGatewayConnectScopes(undefined)).toBeUndefined()
    expect(parseGatewayConnectScopes('')).toBeUndefined()
    expect(parseGatewayConnectScopes('   ')).toBeUndefined()
    expect(parseGatewayConnectScopes('operator.admin')).toEqual(['operator.admin'])
    expect(parseGatewayConnectScopes('operator.read, operator.write')).toEqual(['operator.read', 'operator.write'])
  })
})
