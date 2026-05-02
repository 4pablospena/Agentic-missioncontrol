import { describe, expect, it } from 'vitest'
import {
  extractChatAssistantText,
  mapGatewayStatus,
  normalizeAgentRecord,
  normalizeAgentsListResult,
} from '../server/utils/openclaw-gateway-jsonrpc'

describe('openclaw-gateway-jsonrpc', () => {
  it('mapGatewayStatus maps common gateway states', () => {
    expect(mapGatewayStatus('online')).toBe('running')
    expect(mapGatewayStatus('busy')).toBe('running')
    expect(mapGatewayStatus('offline')).toBe('offline')
    expect(mapGatewayStatus('idle')).toBe('idle')
    expect(mapGatewayStatus('error')).toBe('error')
  })

  it('normalizeAgentsListResult parses arrays and wrappers', () => {
    expect(normalizeAgentsListResult(null)).toEqual([])
    expect(
      normalizeAgentsListResult([
        { id: 'a', name: 'A', status: 'online' },
        { agentId: 'b', label: 'B', state: 'offline' },
      ]),
    ).toEqual([
      expect.objectContaining({ id: 'a', name: 'A', status: 'running' }),
      expect.objectContaining({ id: 'b', name: 'B', status: 'offline' }),
    ])
    expect(
      normalizeAgentsListResult({ agents: [{ id: 'x', name: 'X' }] }),
    ).toEqual([expect.objectContaining({ id: 'x', name: 'X' })])
    expect(normalizeAgentsListResult({ id: 'solo', name: 'One' })).toEqual([
      expect.objectContaining({ id: 'solo', name: 'One' }),
    ])
  })

  it('normalizeAgentRecord returns null without id', () => {
    expect(normalizeAgentRecord({ name: 'no-id' })).toBeNull()
  })

  it('extractChatAssistantText handles shapes', () => {
    expect(extractChatAssistantText('hello')).toBe('hello')
    expect(extractChatAssistantText({ response: 'ok' })).toBe('ok')
    expect(extractChatAssistantText({ message: 'm' })).toBe('m')
    expect(extractChatAssistantText({ data: { message: 'nested' } })).toBe('nested')
    expect(extractChatAssistantText({})).toBe('')
  })
})
